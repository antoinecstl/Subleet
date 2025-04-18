import requests
from bs4 import BeautifulSoup
import urllib.parse
from urllib.robotparser import RobotFileParser
import json
import time
import os
import logging
from collections import deque
import re
from typing import Set, Dict, List, Any, Optional
from dotenv import load_dotenv
from content_analyzer import ContentAnalyzer

# Configuration du logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)

# Charger les variables d'environnement depuis .env.local
env_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), '.env.local')
load_dotenv(env_path)

class WebScraper:
    def __init__(self, start_url: str, output_dir: str = 'scraped_data', 
                 delay: float = 1.0, respect_robots: bool = True,
                 max_pages: int = 1000):
        """
        Initialise le web scraper
        
        Args:
            start_url: URL de départ pour le scraping
            output_dir: Dossier où sauvegarder les données
            delay: Délai entre les requêtes (secondes)
            respect_robots: Respecter les règles robots.txt
            max_pages: Nombre maximum de pages à scraper
        """
        self.start_url = start_url
        self.base_url = self._get_base_url(start_url)
        self.output_dir = output_dir
        self.delay = delay
        self.respect_robots = respect_robots
        self.max_pages = max_pages
        
        # File d'attente des URLs à visiter
        self.url_queue = deque([start_url])
        # Ensemble des URLs déjà visitées
        self.visited_urls: Set[str] = set()
        # Dictionnaire pour stocker les données
        self.data: Dict[str, Any] = {}
        
        # Parser pour robots.txt
        self.rp = RobotFileParser()
        if self.respect_robots:
            robots_url = urllib.parse.urljoin(self.base_url, '/robots.txt')
            self.rp.set_url(robots_url)
            try:
                self.rp.read()
                logging.info(f"Robots.txt lu depuis {robots_url}")
            except Exception as e:
                logging.warning(f"Impossible de lire robots.txt: {e}")
        
        # Création du dossier de sortie s'il n'existe pas
        if not os.path.exists(output_dir):
            os.makedirs(output_dir)
            logging.info(f"Dossier de sortie créé: {output_dir}")
    
    def _get_base_url(self, url: str) -> str:
        """Extrait l'URL de base (domaine) d'une URL complète"""
        parsed_url = urllib.parse.urlparse(url)
        return f"{parsed_url.scheme}://{parsed_url.netloc}"
    
    def _is_valid_url(self, url: str) -> bool:
        """Vérifie si l'URL est valide et peut être crawlée"""
        # Vérifie si l'URL appartient au même domaine
        if not url.startswith(self.base_url):
            return False
            
        # Vérifie les règles robots.txt
        if self.respect_robots and not self.rp.can_fetch('*', url):
            logging.info(f"URL non autorisée par robots.txt: {url}")
            return False
            
        # On pourrait ajouter d'autres règles ici (ex: ignorer certaines extensions)
        ignored_extensions = ['.pdf', '.jpg', '.png', '.gif', '.zip']
        if any(url.endswith(ext) for ext in ignored_extensions):
            return False
            
        return True
    
    def _normalize_url(self, url: str, base_url: str) -> str:
        """Normalise une URL pour éviter les doublons"""
        # Convertir URL relative en absolue
        full_url = urllib.parse.urljoin(base_url, url)
        # Supprimer les fragments (#)
        parsed = urllib.parse.urlparse(full_url)
        normalized = parsed._replace(fragment='').geturl()
        # Supprimer le slash final si présent
        if normalized.endswith('/'):
            normalized = normalized[:-1]
        return normalized
    
    def _extract_links(self, soup: BeautifulSoup, base_url: str) -> List[str]:
        """Extrait tous les liens d'une page"""
        links = []
        for anchor in soup.find_all('a', href=True):
            href = anchor['href']
            # Ignorer les liens vides, les ancres et les liens javascript
            if not href or href.startswith('#') or href.startswith('javascript:'):
                continue
            
            normalized_url = self._normalize_url(href, base_url)
            if self._is_valid_url(normalized_url):
                links.append(normalized_url)
        
        return links
    
    def _extract_data(self, soup: BeautifulSoup, url: str) -> Dict[str, Any]:
        """
        Extrait les données structurées d'une page en préservant la hiérarchie du contenu
        """
        data = {
            'url': url,
            'title': soup.title.text.strip() if soup.title else "",
            'metadata': {},
            'content': [],
            'timestamp': time.time()
        }
        
        # Extraction des méta-données
        for meta in soup.find_all('meta'):
            name = meta.get('name') or meta.get('property')
            content = meta.get('content')
            if name and content:
                data['metadata'][name] = content
        
        # Identification du contenu principal
        main_content = soup.find('main') or soup.find('article') or soup.find('div', class_='content')
        if not main_content:
            main_content = soup.find('body')
        
        if main_content:
            # Extraction structurée du contenu
            self._extract_structured_content(main_content, data['content'])
        
        return data
    
    def _extract_structured_content(self, element, content_list):
        """
        Extrait le contenu de manière structurée en préservant la hiérarchie
        """
        for child in element.children:
            if child.name is None:  # Skip text nodes with only whitespace
                continue
                
            if child.name in ['h1', 'h2', 'h3', 'h4', 'h5', 'h6']:
                # Create a new section for headings
                section = {
                    'type': child.name,
                    'text': child.get_text().strip(),
                    'children': []
                }
                content_list.append(section)
            
            elif child.name == 'p':
                text = child.get_text().strip()
                if text:  # Only add non-empty paragraphs
                    content_list.append({
                        'type': 'paragraph',
                        'text': text
                    })
            
            elif child.name == 'ul' or child.name == 'ol':
                list_items = []
                for li in child.find_all('li', recursive=False):
                    list_items.append(li.get_text().strip())
                
                if list_items:
                    content_list.append({
                        'type': 'list',
                        'list_type': 'unordered' if child.name == 'ul' else 'ordered',
                        'items': list_items
                    })
            
            elif child.name == 'img' and child.get('src'):
                content_list.append({
                    'type': 'image',
                    'src': child.get('src', ''),
                    'alt': child.get('alt', ''),
                    'title': child.get('title', '')
                })
            
            elif child.name in ['div', 'section', 'article']:
                # Recursively process div, section, and article elements
                children_content = []
                self._extract_structured_content(child, children_content)
                if children_content:  # Only add non-empty containers
                    content_list.append({
                        'type': 'container',
                        'tag': child.name,
                        'children': children_content
                    })
    
    def _save_data(self, filename: str = None) -> None:
        """Sauvegarde les données récupérées au format JSON"""
        if not filename:
            filename = f"{self.output_dir}/scraped_data.json"
        
        with open(filename, 'w', encoding='utf-8') as f:
            json.dump(self.data, f, ensure_ascii=False, indent=2)
            
        logging.info(f"Données sauvegardées dans {filename}")
    
    def scrape(self) -> Dict[str, Any]:
        """Lance le processus de scraping"""
        page_count = 0
        
        logging.info(f"Début du scraping à partir de {self.start_url}")
        
        while self.url_queue and page_count < self.max_pages:
            # Récupération de l'URL suivante dans la file
            current_url = self.url_queue.popleft()
            
            # Vérifier si l'URL a déjà été visitée
            if current_url in self.visited_urls:
                continue
                
            # Marquer comme visitée
            self.visited_urls.add(current_url)
            
            # Délai pour ne pas surcharger le serveur
            time.sleep(self.delay)
            
            try:
                logging.info(f"Scraping de {current_url}")
                
                # Requête HTTP
                response = requests.get(
                    current_url, 
                    headers={'User-Agent': 'Mozilla/5.0 WebScraper Bot'}
                )
                response.raise_for_status()  # Lever une exception si erreur HTTP
                
                # Parser le contenu
                soup = BeautifulSoup(response.text, 'html.parser')
                
                # Extraire les données
                page_data = self._extract_data(soup, current_url)
                url_id = str(page_count).zfill(5)
                self.data[url_id] = page_data
                
                # Extraire les liens et les ajouter à la file d'attente
                links = self._extract_links(soup, current_url)
                for link in links:
                    if link not in self.visited_urls:
                        self.url_queue.append(link)
                
                page_count += 1
                logging.info(f"Page {page_count}/{self.max_pages} scrapée. File d'attente: {len(self.url_queue)}")
                
                # Ne plus faire de sauvegardes intermédiaires
                # On sauvegarde uniquement à la fin
                
            except Exception as e:
                logging.error(f"Erreur lors du scraping de {current_url}: {e}")
        
        # Sauvegarde finale unique
        self._save_data()
        
        logging.info(f"Scraping terminé. {page_count} pages visitées.")
        return self.data

if __name__ == "__main__":
    # Exemple d'utilisation
    start_url = input("Entrez l'URL du site à scraper: ")
    max_pages = int(input("Nombre maximum de pages à scraper (default: 1000): ") or 1000)
    delay = float(input("Délai entre les requêtes en secondes (default: 0.5): ") or 0.5)
    
    scraper = WebScraper(
        start_url=start_url,
        max_pages=max_pages,
        delay=delay,
        output_dir='scraped_data'
    )
    
    data = scraper.scrape()
    print(f"Scraping terminé. {len(data)} pages scrapées.")
    
    # Demander si l'utilisateur souhaite analyser le contenu
    """analyze = input("Analyser le contenu maintenant? (o/n): ").lower().startswith('o')
    if analyze:
        # Utiliser le nouveau module ContentAnalyzer
        analyzer = ContentAnalyzer(output_dir='scraped_data')
        analyzer.analyze_content(data=data)
        print("Analyse terminée. Résultats sauvegardés dans content_analysis.json et content_analysis.md")
"""