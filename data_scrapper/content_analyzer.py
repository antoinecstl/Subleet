import json
import time
import os
import logging
from typing import Dict, List, Any, Union
from dotenv import load_dotenv
import tiktoken
from openai import OpenAI
import copy

# Configuration du logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)

# Charger les variables d'environnement depuis .env.local
env_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), '.env.local')
load_dotenv(env_path)

class ContentAnalyzer:
    def __init__(self, output_dir: str = 'scraped_data'):
        """
        Initialise l'analyseur de contenu
        
        Args:
            output_dir: Dossier où sauvegarder les analyses
        """
        self.output_dir = output_dir
        
        # S'assurer que le dossier de sortie existe
        if not os.path.exists(output_dir):
            os.makedirs(output_dir)
            logging.info(f"Dossier de sortie créé: {output_dir}")
    
    def _estimate_token_count(self, text: str, model: str = "gpt-4o-mini") -> int:
        """
        Estime le nombre de tokens dans un texte pour un modèle donné
        
        Args:
            text: Le texte à analyser
            model: Le modèle OpenAI à utiliser
            
        Returns:
            Nombre estimé de tokens
        """
        try:
            # Sélectionner l'encodage approprié selon le modèle
            if model.startswith("gpt-4o"):
                # Pour les modèles gpt-4o, utiliser cl100k_base
                encoding = tiktoken.get_encoding("cl100k_base")
            elif model.startswith("gpt-4"):
                encoding = tiktoken.encoding_for_model("gpt-4")
            elif model.startswith("gpt-3.5"):
                encoding = tiktoken.encoding_for_model("gpt-3.5-turbo")
            else:
                # Par défaut pour les nouveaux modèles
                encoding = tiktoken.get_encoding("cl100k_base")
                
            # Compter les tokens
            token_count = len(encoding.encode(text))
            
            # Appliquer un facteur de sécurité pour éviter les sous-estimations
            # Les différences peuvent provenir de la façon dont les sauts de ligne, espaces, etc. sont traités
            safety_factor = 1.1  # +10% pour être sûr
            
            return int(token_count * safety_factor)
        
        except Exception as e:
            logging.warning(f"Erreur lors de l'estimation des tokens: {e}. Utilisation d'une estimation approximative.")
            # Estimation approximative (~3 caractères par token - plus conservatrice)
            return len(text) // 3
    
    def optimize_input_json(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Optimise le JSON d'entrée en supprimant les balises inutiles pour économiser des tokens
        
        Args:
            data: Les données JSON à optimiser
            
        Returns:
            Données JSON optimisées
        """
        optimized_data = {}
        
        for page_id, page_data in data.items():
            # Copier les données de base de la page
            optimized_page = {
                'url': page_data.get('url', ''),
                'title': page_data.get('title', ''),
                'content': []
            }
            
            # Optimiser le contenu en conservant uniquement les informations essentielles
            for content_item in page_data.get('content', []):
                item_type = content_item.get('type', '')
                
                if item_type in ['h1', 'h2', 'h3', 'h4', 'h5', 'h6']:
                    # Pour les titres, conserver uniquement le type et le texte
                    optimized_page['content'].append({
                        'type': item_type,
                        'text': content_item.get('text', '')
                    })
                    
                elif item_type == 'paragraph':
                    # Pour les paragraphes, conserver uniquement le texte
                    optimized_page['content'].append({
                        'type': 'paragraph',
                        'text': content_item.get('text', '')
                    })
                    
                elif item_type == 'list':
                    # Pour les listes, conserver les éléments mais pas le type de liste
                    optimized_page['content'].append({
                        'type': 'list',
                        'items': content_item.get('items', [])
                    })
                    
                elif item_type == 'image' and content_item.get('src'):
                    # Pour les images, conserver uniquement les attributs essentiels
                    optimized_page['content'].append({
                        'type': 'image',
                        'src': content_item.get('src', ''),
                        'alt': content_item.get('alt', '')
                    })
                    
                elif item_type == 'container':
                    # Pour les conteneurs, extraire directement les enfants sans nicher
                    if 'children' in content_item:
                        for child in content_item['children']:
                            if isinstance(child, dict) and 'type' in child:
                                if child['type'] in ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'paragraph']:
                                    optimized_page['content'].append({
                                        'type': child['type'],
                                        'text': child.get('text', '')
                                    })
                                elif child['type'] == 'list':
                                    optimized_page['content'].append({
                                        'type': 'list',
                                        'items': child.get('items', [])
                                    })
            
            optimized_data[page_id] = optimized_page
            
        return optimized_data
    
    def _split_content(self, content: List[str], page_urls: Dict[str, str], 
                      max_tokens: int = 100000) -> List[Dict[str, Any]]:
        """
        Divise le contenu en parties respectant la limite de tokens et les éléments logiques
        
        Args:
            content: Liste des éléments de contenu
            page_urls: Dictionnaire associant titres et URLs
            max_tokens: Nombre maximum de tokens par partie
            
        Returns:
            Liste de dictionnaires contenant les parties de contenu et leurs URLs associées
        """
        parts = []
        current_part = []
        current_token_count = 0
        current_urls = {}
        
        # Réserver des tokens pour les instructions, le système, et les autres éléments du prompt
        reserved_tokens = 4000
        effective_max_tokens = max_tokens - reserved_tokens
        
        # Estimer les tokens pour le JSON des URLs
        urls_json = json.dumps(page_urls)
        urls_tokens = self._estimate_token_count(urls_json)
        effective_max_tokens -= urls_tokens
        
        logging.info(f"Limite effective de tokens par partie: {effective_max_tokens} (après réservation)")
        
        # Structure pour suivre les unités logiques
        current_section = None  # Pour suivre la section actuelle
        section_items = []      # Pour stocker les éléments de la section en cours
        section_urls = {}       # URLs associées à la section en cours
        section_token_count = 0 # Nombre de tokens dans la section en cours
        
        i = 0
        while i < len(content):
            item = content[i]
            item_tokens = self._estimate_token_count(item)
            
            # Vérifier si c'est un en-tête (début de section)
            is_heading = item.startswith('\n## ') or item.startswith('### Page:')
            
            # Si l'élément est un titre et que nous sommes au début ou avons dépassé la limite
            if is_heading:
                # Si nous avons une section en cours à traiter
                if current_section is not None:
                    # Si ajouter la section actuelle dépasserait la limite
                    if current_token_count + section_token_count > effective_max_tokens and current_part:
                        # Finaliser la partie actuelle sans cette section
                        parts.append({
                            'content': current_part.copy(),
                            'urls': current_urls.copy()
                        })
                        
                        # Réinitialiser pour la nouvelle partie
                        current_part = []
                        current_token_count = 0
                        current_urls = {}
                    
                    # Ajouter la section complète à la partie courante
                    current_part.extend(section_items)
                    current_token_count += section_token_count
                    current_urls.update(section_urls)
                
                # Débuter une nouvelle section
                current_section = item
                section_items = [item]
                section_token_count = item_tokens
                section_urls = {}
                
                # Extraire et stocker les URLs associées
                if item.startswith('### Page:'):
                    title_line = item.split('\n')[0].replace('### Page: ', '')
                    url_line = ''
                    if len(item.split('\n')) > 1:
                        url_line = item.split('\n')[1].replace('URL: ', '')
                    section_urls[title_line] = url_line
                elif item.startswith('\n## '):
                    heading = item.replace('\n## ', '')
                    if heading in page_urls:
                        section_urls[heading] = page_urls[heading]
            else:
                # Si cet item seul est trop grand (rare)
                if item_tokens > effective_max_tokens:
                    logging.warning(f"Élément trop grand ({item_tokens} tokens). Troncature.")
                    ratio = effective_max_tokens / item_tokens
                    item_chars = int(len(item) * ratio * 0.9)
                    item = item[:item_chars] + "... [tronqué]"
                    item_tokens = self._estimate_token_count(item)
                
                # Ajouter l'élément à la section en cours
                if current_section is not None:
                    section_items.append(item)
                    section_token_count += item_tokens
                else:
                    # Si pas de section en cours, traiter comme élément individuel
                    if current_token_count + item_tokens > effective_max_tokens and current_part:
                        parts.append({
                            'content': current_part.copy(),
                            'urls': current_urls.copy()
                        })
                        current_part = []
                        current_token_count = 0
                        current_urls = {}
                    
                    current_part.append(item)
                    current_token_count += item_tokens
            
            i += 1
        
        # Traiter la dernière section si nécessaire
        if current_section is not None and section_items:
            # Si ajouter la dernière section dépasserait la limite
            if current_token_count + section_token_count > effective_max_tokens and current_part:
                parts.append({
                    'content': current_part.copy(),
                    'urls': current_urls.copy()
                })
                current_part = section_items
                current_token_count = section_token_count
                current_urls = section_urls
            else:
                # Sinon, ajouter à la partie en cours
                current_part.extend(section_items)
                current_token_count += section_token_count
                current_urls.update(section_urls)
        
        # Ajouter la dernière partie si elle contient quelque chose
        if current_part:
            parts.append({
                'content': current_part.copy(),
                'urls': current_urls.copy()
            })
        
        logging.info(f"Contenu divisé en {len(parts)} parties, respectant les unités logiques")
        for i, part in enumerate(parts):
            part_text = "\n".join(part['content'])
            part_tokens = self._estimate_token_count(part_text)
            logging.info(f"Partie {i+1}: estimation de {part_tokens} tokens")
        
        return parts
    
    def analyze_content(self, data_path: str = None, data: Dict[str, Any] = None, 
                       model: str = "gpt-4o-mini", api_key: str = None, 
                       optimize_json: bool = True) -> Dict[str, Any]:
        """
        Analyse le contenu scrapé avec OpenAI et génère un résumé des éléments importants
        
        Args:
            data_path: Chemin vers le fichier JSON de données scrapées (si data non fourni)
            data: Données scrapées (alternative à data_path)
            model: Le modèle OpenAI à utiliser (par défaut: gpt-4o-mini)
            api_key: Clé API OpenAI (optionnel, utilise la variable d'environnement par défaut)
            optimize_json: Si True, optimise le JSON d'entrée pour économiser des tokens
            
        Returns:
            Dictionnaire contenant l'analyse
        """
        if not data and not data_path:
            raise ValueError("Vous devez fournir soit des données, soit un chemin vers un fichier de données.")
        
        # Charger les données si nécessaire
        if not data and data_path:
            try:
                with open(data_path, 'r', encoding='utf-8') as f:
                    data = json.load(f)
            except Exception as e:
                logging.error(f"Erreur lors du chargement des données: {e}")
                return {"error": f"Impossible de charger les données: {e}"}
        
        # Optimiser le JSON d'entrée si demandé
        if optimize_json:
            logging.info("Optimisation du JSON d'entrée...")
            data = self.optimize_input_json(data)
        
        # Si aucune clé n'est fournie, utiliser celle de l'environnement
        if api_key is None:
            api_key = os.environ.get('OPENAI_API_KEY')
            if not api_key:
                logging.error("Clé API OpenAI non trouvée. Veuillez la définir dans .env.local")
                return {"error": "Clé API manquante"}
        
        # Configuration du client OpenAI
        client = OpenAI(api_key=api_key)
        
        # Préparer les données pour l'analyse
        all_content = []
        page_urls = {}  # Dictionnaire pour associer les titres aux URLs
        
        # Extraction et organisation du contenu pour l'analyse
        for page_id, page_data in data.items():
            url = page_data.get('url', '')
            title = page_data.get('title', '')
            page_urls[title] = url  # Stocker l'URL associée au titre
            
            all_content.append(f"### Page: {title}\nURL: {url}\n")
            
            for content_item in page_data.get('content', []):
                if content_item.get('type') in ['h1', 'h2', 'h3', 'h4', 'h5', 'h6']:
                    heading_text = content_item.get('text')
                    all_content.append(f"\n## {heading_text}")
                    # Associer chaque titre à son URL également
                    page_urls[heading_text] = url
                
                elif content_item.get('type') == 'paragraph':
                    all_content.append(content_item.get('text'))
                
                elif content_item.get('type') == 'list':
                    list_type = content_item.get('list_type')
                    items = content_item.get('items', [])
                    all_content.append("\n" + "\n".join([f"- {item}" for item in items]) + "\n")
        
        # Vérifier les limites de contexte et diviser si nécessaire
        max_tokens = self._get_max_tokens(model)
        
        # Estimer le nombre total de tokens
        combined_content = "\n".join(all_content)
        urls_json = json.dumps(page_urls)
        prompt_template = self._build_prompt("CONTENT_PLACEHOLDER", urls_json)
        prompt_without_content = prompt_template.replace("CONTENT_PLACEHOLDER", "")
        
        # Estimer les tokens pour le template de prompt sans le contenu
        template_tokens = self._estimate_token_count(prompt_without_content)
        content_tokens = self._estimate_token_count(combined_content)
        total_token_count = template_tokens + content_tokens
        
        logging.info(f"Estimation détaillée des tokens:")
        logging.info(f"- Template du prompt: {template_tokens} tokens")
        logging.info(f"- Contenu: {content_tokens} tokens")
        logging.info(f"- Total: {total_token_count} tokens (limite du modèle: {max_tokens} tokens)")
        
        # Diviser si nécessaire
        if total_token_count > max_tokens:
            parts = self._split_content(all_content, page_urls, max_tokens)
            logging.info(f"Contenu divisé en {len(parts)} parties pour l'analyse")
            
            # Analyser séquentiellement avec fusion des résultats
            return self._analyze_parts(parts, model, client)
        else:
            # Pas besoin de diviser, analyser directement
            return self._analyze_single(all_content, page_urls, model, client)
    
    def _get_max_tokens(self, model: str) -> int:
        """
        Renvoie la limite de tokens pour un modèle donné
        
        Args:
            model: Le nom du modèle OpenAI
            
        Returns:
            Nombre maximum de tokens
        """
        model_limits = {
            "gpt-4o-mini": 125000,  # Réduction de la limite pour une marge de sécurité
            "gpt-4o": 125000,      # Le modèle peut aller à 128K mais gardons une marge
            "gpt-4": 6500,         # Le modèle peut aller à 8K
            "gpt-3.5-turbo-16k": 14000,  # Le modèle peut aller à 16K
            "gpt-3.5-turbo": 3000,       # Le modèle standard
        }
        
        for model_name, limit in model_limits.items():
            if model.startswith(model_name):
                return limit
        
        # Par défaut, utiliser une valeur très conservative
        return 2000
    
    def _analyze_single(self, content: List[str], page_urls: Dict[str, str], 
                       model: str, client: OpenAI) -> Dict[str, Any]:
        """
        Analyse une partie unique du contenu
        
        Args:
            content: Liste des éléments de contenu
            page_urls: Dictionnaire associant titres et URLs
            model: Le modèle OpenAI à utiliser
            client: Client OpenAI configuré
            
        Returns:
            Dictionnaire contenant l'analyse
        """
        # Joindre tout le contenu extrait
        combined_text = "\n".join(content)
        
        # Créer une représentation JSON des URLs pour le modèle
        urls_json = json.dumps(page_urls)
        
        # Construire un prompt amélioré
        prompt = self._build_prompt(combined_text, urls_json)
        
        try:
            # Appel à l'API OpenAI
            response = client.chat.completions.create(
                model=model,
                messages=[
                    {"role": "system", "content": "Tu es un analyste web expert avec une capacité exceptionnelle à extraire, organiser et expliquer l'information de manière détaillée et structurée. Tu fournis des analyses complètes et approfondies."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.2  # Plus déterministe pour une analyse factuelle
            )
            
            # Extraction du résultat
            result = response.choices[0].message.content
            analysis = {
                'summary': result,
                'timestamp': time.time(),
                'model_used': model
            }
            
            # Sauvegarder l'analyse
            self._save_analysis(analysis)
            
            return analysis
        
        except Exception as e:
            logging.error(f"Erreur lors de l'analyse avec OpenAI: {e}")
            return {"error": str(e)}
    
    def _analyze_parts(self, parts: List[Dict[str, Any]], model: str, client: OpenAI) -> Dict[str, Any]:
        """
        Analyse des parties multiples de contenu séquentiellement, puis unifie le tout
        
        Args:
            parts: Liste de dictionnaires contenant les parties de contenu et leurs URLs
            model: Le modèle OpenAI à utiliser
            client: Client OpenAI configuré
            
        Returns:
            Dictionnaire contenant l'analyse complète unifiée
        """
        # Liste pour stocker les analyses partielles
        part_analyses = []
        
        # Phase 1: Analyser chaque partie séparément
        for i, part in enumerate(parts):
            logging.info(f"Analyse de la partie {i+1}/{len(parts)}...")
            
            # Joindre le contenu de cette partie
            combined_text = "\n".join(part['content'])
            
            # Créer une représentation JSON des URLs pour cette partie
            urls_json = json.dumps(part['urls'])
            
            # Construire le prompt pour cette partie, avec contexte si nécessaire
            if i == 0:
                # Première partie - analyse initiale
                prompt = self._build_prompt(combined_text, urls_json)
                context_message = "Ceci est la première partie du contenu à analyser."
            else:
                # Parties suivantes - inclure le contexte des analyses précédentes
                prompt = self._build_continuation_prompt(combined_text, urls_json, part_analyses)
                context_message = f"Ceci est la partie {i+1}/{len(parts)} du contenu. Continue l'analyse en tenant compte des résultats précédents."
            
            try:
                # Appel à l'API OpenAI
                response = client.chat.completions.create(
                    model=model,
                    messages=[
                        {"role": "system", "content": f"Tu es un analyste web expert avec une capacité exceptionnelle à extraire, organiser et expliquer l'information de manière détaillée et structurée. {context_message}"},
                        {"role": "user", "content": prompt}
                    ],
                    temperature=0.2
                )
                
                # Extraction du résultat pour cette partie
                result = response.choices[0].message.content
                part_analyses.append({
                    'part_number': i+1,
                    'content': result,
                    'urls': part['urls']
                })
                
            except Exception as e:
                logging.error(f"Erreur lors de l'analyse de la partie {i+1}: {e}")
                part_analyses.append({
                    'part_number': i+1,
                    'content': f"[Erreur d'analyse pour la partie {i+1}: {e}]",
                    'urls': part['urls']
                })
        
        # Phase 2: Unifier toutes les analyses partielles en une seule analyse cohérente
        logging.info("Unification des analyses partielles en une analyse cohérente...")
        
        # Extraire tous les URLs pour les mettre à disposition dans l'analyse unifiée
        all_urls = {}
        for part in part_analyses:
            all_urls.update(part.get('urls', {}))
        
        try:
            # Créer le prompt pour l'unification
            unification_prompt = self._build_unification_prompt(part_analyses, all_urls)
            
            # Appel à l'API OpenAI pour l'unification
            response = client.chat.completions.create(
                model=model,
                messages=[
                    {"role": "system", "content": "Tu es un expert en synthèse et unification d'analyses. Ta tâche est de prendre plusieurs analyses partielles d'un même site web et de les fusionner en une analyse unifiée, cohérente et complète."},
                    {"role": "user", "content": unification_prompt}
                ],
                temperature=0.2
            )
            
            # Extraction du résultat unifié
            unified_result = response.choices[0].message.content
            
            # Créer et sauvegarder l'analyse fusionnée
            analysis = {
                'summary': unified_result,
                'timestamp': time.time(),
                'model_used': model,
                'parts_count': len(parts),
                'parts': [part.get('content') for part in part_analyses]  # Stocker aussi les analyses partielles
            }
            
            self._save_analysis(analysis)
            
            return analysis
            
        except Exception as e:
            logging.error(f"Erreur lors de l'unification des analyses: {e}")
            
            # Fallback: combiner manuellement les analyses partielles si l'unification échoue
            combined_analysis = "\n\n".join([
                f"# Partie {part.get('part_number')}\n\n{part.get('content')}" 
                for part in part_analyses
            ])
            
            analysis = {
                'summary': combined_analysis,
                'timestamp': time.time(),
                'model_used': model,
                'parts_count': len(parts),
                'parts': [part.get('content') for part in part_analyses],
                'unification_error': str(e)
            }
            
            self._save_analysis(analysis)
            
            return analysis

    def _build_unification_prompt(self, part_analyses: List[Dict[str, Any]], all_urls: Dict[str, str]) -> str:
        """
        Construit le prompt pour unifier plusieurs analyses partielles en préservant les détails
        
        Args:
            part_analyses: Liste des analyses partielles
            all_urls: Dictionnaire fusionné de toutes les URLs
            
        Returns:
            Le prompt formaté pour l'unification
        """
        # Assembler toutes les analyses partielles avec une structure améliorée
        analyses_text = "\n\n".join([
            f"### ANALYSE PARTIE {part.get('part_number')}/{len(part_analyses)} ###\n\n{part.get('content')}"
            for part in part_analyses
        ])
        
        # Créer la représentation JSON des URLs
        urls_json = json.dumps(all_urls)
        
        return f"""
        J'ai analysé un site web en plusieurs parties en raison de sa taille. Je te fournis maintenant toutes les analyses partielles.
        
        Ta mission est de synthétiser ces analyses en UN SEUL DOCUMENT unifié, cohérent et complet qui donne une vision globale du site.
        
        STRUCTURE À SUIVRE IMPÉRATIVEMENT:
        
        1. INTRODUCTION - Présentation générale du site et de son objectif (concis)
        
        2. ARBORESCENCE COMPLÈTE ET DÉTAILLÉE DU SITE - Ceci est la section la plus importante
           - Structure hiérarchique en forme d'arbre avec TOUTES les catégories principales et sous-catégories
           - Pour chaque catégorie: nom, description, et lien URL
           - Pour CHAQUE PRODUIT INDIVIDUEL IDENTIFIÉ dans les analyses: 
               * Nom exact du produit
               * Description détaillée et complète
               * Liste exhaustive de TOUTES les caractéristiques techniques disponibles
               * Prix (si mentionné)
               * Lien URL exact vers la page produit
           - Utilise une présentation indentée clairement formatée pour représenter la hiérarchie
           - LISTE ABSOLUMENT TOUS LES PRODUITS mentionnés dans les analyses partielles
        
        3. ANALYSE DÉTAILLÉE PAR CATÉGORIE
           - Pour chaque catégorie principale, détaille:
               * Les types de produits qu'elle contient
               * Les caractéristiques communes et spécifiques
               * Les produits phares avec leurs points forts
               * Toutes les spécifications techniques importantes
        
        4. RELATIONS ET INTÉGRATIONS ENTRE PRODUITS
           - Comment les différents produits peuvent être utilisés ensemble
           - Compatibilités et complémentarités entre produits
           - Solutions intégrées possibles
        
        5. CONCLUSION
        
        IMPORTANT: L'objectif principal est de PRÉSERVER TOUS LES DÉTAILS sur chaque produit et catégorie mentionnés dans les analyses partielles, en créant une structure claire et exhaustive. Le document final doit être un catalogue complet des produits du site avec tous leurs détails techniques.
        
        CONSEILS SUPPLÉMENTAIRES:
        - Assure-toi d'inclure TOUS les produits mentionnés, même ceux avec peu d'informations
        - Établis une arborescence claire qui reflète la structure réelle du site
        - Formate soigneusement la présentation pour que la hiérarchie soit évidente
        - Inclus systématiquement les liens vers les sources en utilisant la syntaxe [Nom](URL)
        - N'hésite pas à produire un document long et détaillé - la complétude prime sur la concision
        
        Dictionnaire complet des URLs (titre -> url):
        {urls_json}
        
        ANALYSES PARTIELLES À UNIFIER:
        {analyses_text}
        """
    
    def _build_prompt(self, content: str, urls_json: str) -> str:
        """
        Construit le prompt pour l'analyse
        
        Args:
            content: Le contenu à analyser
            urls_json: Les URLs associées au format JSON
            
        Returns:
            Le prompt formaté
        """
        return f"""
        Tu es un expert en analyse et synthèse de contenu web. Je te fournis le contenu extrait d'un site web ainsi qu'un dictionnaire associant les titres à leurs URLs.

        Je veux que tu réalises une analyse approfondie et détaillée, comprenant :

        1. Un résumé complet des informations principales du site
        
        2. Une ARBORESCENCE COMPLÈTE ET DÉTAILLÉE du site, organisée comme suit:
           - Structure hiérarchique en forme d'arbre avec catégories principales et sous-catégories
           - Pour chaque catégorie: nom, description, et lien
           - Pour chaque produit/article en les listants tous : nom, description détaillée, caractéristiques techniques, prix (si disponible), et lien
           - Présentation sous forme de liste hiérarchique indentée pour faciliter la lecture
        
        3. Une classification thématique complète du contenu permettant de comprendre l'organisation des produits
        
        4. Les relations et connexions entre les différentes catégories de produits et comment ils s'intègrent ensemble
        
        Lorsque tu mentionnes un élément spécifique du contenu, inclus TOUJOURS un lien vers la page contenant cet élément, en utilisant le dictionnaire d'URLs fourni.
        
        Pour référencer une source, utilise ce format : [Titre ou description](URL correspondante)
        
        TRÈS IMPORTANT: Produis une analyse EXTRÊMEMENT détaillée. Ne te limite pas en longueur. Je veux une analyse complète qui liste tous les produits de manière exhaustive, avec leurs détails techniques complets.
        
        Dictionnaire des URLs (titre -> url) :
        {urls_json}
        
        CONTENU DU SITE :
        {content}
        """
    
    def _build_continuation_prompt(self, content: str, urls_json: str, previous_analyses: List[Dict[str, Any]]) -> str:
        """
        Construit le prompt pour une partie suivante de l'analyse, très similaire au prompt initial
        
        Args:
            content: Le contenu à analyser
            urls_json: Les URLs associées au format JSON
            previous_analyses: Les analyses des parties précédentes
            
        Returns:
            Le prompt formaté
        """
        # Note courte sur les parties précédentes (sans leur contenu complet)
        part_info = f"REMARQUE: Ceci est la partie {len(previous_analyses)+1} du contenu. " + \
                    f"{len(previous_analyses)} parties ont déjà été analysées précédemment."
        
        # Utiliser essentiellement le même prompt que l'original
        return f"""
        Tu es un expert en analyse et synthèse de contenu web. Je te fournis la SUITE du contenu extrait d'un site web ainsi qu'un dictionnaire associant les titres à leurs URLs.

        {part_info}

        Je veux que tu réalises une analyse approfondie et détaillée de cette nouvelle partie, comprenant :

        1. Un résumé complet des informations principales du site
        
        2. Une ARBORESCENCE COMPLÈTE ET DÉTAILLÉE du site, organisée comme suit:
           - Structure hiérarchique en forme d'arbre avec catégories principales et sous-catégories
           - Pour chaque catégorie: nom, description, et lien
           - Pour chaque produit/article en les listants tous : nom, description détaillée, caractéristiques techniques, prix (si disponible), et lien
           - Présentation sous forme de liste hiérarchique indentée pour faciliter la lecture
        
        3. Une classification thématique complète du contenu permettant de comprendre l'organisation des produits
        
        4. Les relations et connexions entre les différentes catégories de produits et comment ils s'intègrent ensemble
        
        IMPORTANT:
        - Utilise la même structure et le même format que l'analyse précédente
        - N'essaie pas de résumer ou de raccourcir ton analyse
        - Analyse cette partie comme un complément aux parties précédentes
        - SOIS EXTRÊMEMENT DÉTAILLÉ dans la description des produits et leurs caractéristiques
        
        Lorsque tu mentionnes un élément spécifique du contenu, inclus TOUJOURS un lien vers la page contenant cet élément.
        
        Pour référencer une source, utilise ce format : [Titre ou description](URL correspondante)
        
        TRÈS IMPORTANT: Produis une analyse EXTRÊMEMENT détaillée. Ne te limite pas en longueur. Je veux une analyse complète qui liste tous les produits de manière exhaustive, avec leurs détails techniques complets.

        Dictionnaire des URLs (titre -> url) :
        {urls_json}
        
        CONTENU DU SITE (PARTIE {len(previous_analyses)+1}) :
        {content}
        """
    
    def _save_analysis(self, analysis: Dict[str, Any]) -> None:
        """
        Sauvegarde l'analyse dans des fichiers
        
        Args:
            analysis: Le dictionnaire d'analyse à sauvegarder
        """
        # Sauvegarder l'analyse au format JSON
        analysis_file = f"{self.output_dir}/content_analysis.json"
        with open(analysis_file, 'w', encoding='utf-8') as f:
            json.dump(analysis, f, ensure_ascii=False, indent=2)
        
        # Sauvegarder également l'analyse au format texte pour une lecture plus facile
        text_analysis_file = f"{self.output_dir}/content_analysis.md"
        with open(text_analysis_file, 'w', encoding='utf-8') as f:
            f.write(analysis['summary'])
        
        logging.info(f"Analyse sauvegardée dans {analysis_file} et {text_analysis_file}")


# Exemple d'utilisation autonome
if __name__ == "__main__":
    import argparse
    
    parser = argparse.ArgumentParser(description='Analyse de contenu web scrapé avec OpenAI')
    parser.add_argument('--data', type=str, help='Chemin vers le fichier JSON de données scrapées')
    parser.add_argument('--output', type=str, default='scraped_data', help='Dossier de sortie')
    parser.add_argument('--model', type=str, default='gpt-4o-mini', help='Modèle OpenAI à utiliser')
    parser.add_argument('--no-optimize', action='store_true', help='Désactive l\'optimisation du JSON d\'entrée')
    
    args = parser.parse_args()
    
    if args.data:
        analyzer = ContentAnalyzer(output_dir=args.output)
        result = analyzer.analyze_content(
            data_path=args.data, 
            model=args.model, 
            optimize_json=not args.no_optimize
        )
        print(f"Analyse terminée. Résultats disponibles dans {args.output}/content_analysis.md")
    else:
        print("Veuillez spécifier un fichier de données avec --data")
