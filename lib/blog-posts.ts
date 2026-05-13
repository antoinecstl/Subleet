export type BlogPost = {
  id: number
  slug: string
  title: string
  cat: string
  date: string
  readTime: string
  excerpt: string
  content: Section[]
}

type Section = {
  type: 'intro' | 'h2' | 'p' | 'ul' | 'quote'
  text?: string
  items?: string[]
}

export const BLOG_POSTS: BlogPost[] = [
  {
    id: 1,
    slug: 'construire-produit-saas-clair',
    title: 'Construire un produit SaaS clair avant de le rendre complet',
    cat: 'Produit',
    date: '18 avr. 2026',
    readTime: '5 min',
    excerpt:
      'Un produit utile commence rarement par une longue liste de fonctionnalités. Il commence par une promesse nette, un parcours compréhensible et quelques décisions assumées.',
    content: [
      {
        type: 'intro',
        text:
          'La tentation naturelle, lorsqu’on lance un SaaS, consiste à couvrir tous les cas. On ajoute des paramètres, des vues, des exports, des rôles, des options. Très vite, le produit devient plus large que précis.',
      },
      {
        type: 'h2',
        text: 'La clarté est une contrainte produit',
      },
      {
        type: 'p',
        text:
          'Un bon produit ne montre pas tout ce qu’il sait faire. Il hiérarchise. Il choisit l’action la plus importante, rend le chemin évident et laisse le reste au second plan. Cette contrainte force à trancher : à qui s’adresse le produit, quel problème traite-t-il, et quelle décision doit devenir plus simple ?',
      },
      {
        type: 'p',
        text:
          'Cette clarté se voit dans l’interface, mais elle se prépare en amont : modèle de données, vocabulaire, navigation, états vides, messages d’erreur. Chaque détail peut soit rassurer l’utilisateur, soit lui demander un effort inutile.',
      },
      {
        type: 'h2',
        text: 'Réduire avant d’ajouter',
      },
      {
        type: 'ul',
        items: [
          'Nommer précisément le problème traité.',
          'Définir le parcours principal sans détour.',
          'Retirer les fonctionnalités qui ne renforcent pas ce parcours.',
          'Écrire les textes d’interface comme des décisions produit.',
          'Mesurer si l’utilisateur comprend l’étape suivante sans explication externe.',
        ],
      },
      {
        type: 'quote',
        text: 'Un produit clair ne paraît pas simple parce qu’il manque d’ambition. Il paraît simple parce que les arbitrages ont déjà été faits.',
      },
      {
        type: 'p',
        text:
          'Chez Subleet, nous privilégions cette approche : construire moins de surface au départ, mais construire une surface plus nette. C’est souvent ce qui permet d’aller plus vite sans accumuler une dette d’usage dès les premières versions.',
      },
    ],
  },
  {
    id: 2,
    slug: 'fi-hub-suivi-patrimonial',
    title: 'fi-hub : remettre de l’ordre dans le suivi patrimonial',
    cat: 'fi-hub',
    date: '12 avr. 2026',
    readTime: '4 min',
    excerpt:
      'fi-hub part d’un besoin simple : suivre son patrimoine sans jongler entre des interfaces, des fichiers et des calculs manuels qui finissent par masquer l’essentiel.',
    content: [
      {
        type: 'intro',
        text:
          'Le suivi patrimonial devient vite fragmenté. Les comptes sont séparés, les supports changent d’un établissement à l’autre, et les informations utiles ne sont pas toujours présentées de façon comparable.',
      },
      {
        type: 'h2',
        text: 'Le problème n’est pas seulement la donnée',
      },
      {
        type: 'p',
        text:
          'Avoir les chiffres ne suffit pas. Encore faut-il pouvoir les lire. Un tableau de bord patrimonial utile doit aider à comprendre une situation, pas seulement afficher des montants. La valeur se situe dans la consolidation, la comparaison et la mise en contexte.',
      },
      {
        type: 'p',
        text:
          'fi-hub vise cette lecture plus directe : comptes, allocation, évolution, mouvements. L’objectif n’est pas d’ajouter du bruit, mais de rendre visible ce qui aide réellement à suivre et décider.',
      },
      {
        type: 'h2',
        text: 'Ce que l’interface doit réussir',
      },
      {
        type: 'ul',
        items: [
          'Donner une vue globale sans masquer les détails importants.',
          'Rendre les montants et variations faciles à comparer.',
          'Éviter les visualisations décoratives qui ne servent pas la décision.',
          'Garder un vocabulaire financier compréhensible.',
        ],
      },
      {
        type: 'quote',
        text: 'Un bon outil financier ne cherche pas à impressionner. Il doit d’abord inspirer confiance.',
      },
      {
        type: 'p',
        text:
          'C’est la direction de fi-hub : une application sobre, lisible, construite pour consulter régulièrement son patrimoine sans avoir à reconstruire mentalement l’information à chaque visite.',
      },
    ],
  },
  {
    id: 3,
    slug: 'automatiser-sans-compliquer',
    title: 'Automatiser sans compliquer les opérations',
    cat: 'IA',
    date: '5 avr. 2026',
    readTime: '6 min',
    excerpt:
      'L’automatisation devient rentable quand elle supprime une friction réelle. Elle devient dangereuse quand elle ajoute une couche opaque à un processus déjà mal défini.',
    content: [
      {
        type: 'intro',
        text:
          'L’IA et les automatisations donnent l’impression que tout peut être accéléré. En pratique, les meilleurs résultats viennent souvent de cas très simples : un transfert d’information, une qualification, une synthèse, un contrôle.',
      },
      {
        type: 'h2',
        text: 'Commencer par le processus',
      },
      {
        type: 'p',
        text:
          'Avant de choisir un outil, il faut décrire le chemin actuel : qui reçoit quoi, qui décide, où l’information se perd, quelles erreurs reviennent souvent. Si ce travail n’est pas fait, l’automatisation risque de rendre le désordre plus rapide.',
      },
      {
        type: 'h2',
        text: 'Les bons signaux',
      },
      {
        type: 'ul',
        items: [
          'La tâche est fréquente et suit des règles relativement stables.',
          'Les données d’entrée sont disponibles et suffisamment propres.',
          'Le résultat attendu peut être vérifié facilement.',
          'Un humain garde la main sur les décisions sensibles.',
        ],
      },
      {
        type: 'p',
        text:
          'Une automatisation réussie doit être lisible par l’équipe qui l’utilise. Les logs, les erreurs, les exceptions et les points de reprise comptent autant que le scénario idéal.',
      },
      {
        type: 'quote',
        text: 'Automatiser, ce n’est pas cacher le travail. C’est rendre le bon travail plus répétable.',
      },
      {
        type: 'p',
        text:
          'Notre approche consiste à identifier une friction, construire une première boucle fiable, puis élargir seulement si l’usage tient dans le temps.',
      },
    ],
  },
  {
    id: 4,
    slug: 'rag-agents-evaluations-ia',
    title: 'RAG, agents et évaluations : rendre l’IA exploitable',
    cat: 'IA',
    date: '28 mars 2026',
    readTime: '7 min',
    excerpt:
      'Passer d’une démo IA impressionnante à un système fiable demande plus qu’un bon prompt : récupération de contexte, appels outils, sorties structurées et évaluations doivent être pensés ensemble.',
    content: [
      {
        type: 'intro',
        text:
          'La plupart des prototypes IA fonctionnent sur quelques exemples bien choisis. La difficulté commence quand le système doit traiter des données réelles, des cas incomplets, des documents ambigus et des demandes qui ne rentrent pas dans le scénario initial.',
      },
      {
        type: 'h2',
        text: 'Le RAG n’est pas une recherche magique',
      },
      {
        type: 'p',
        text:
          'Un pipeline RAG fiable dépend d’abord de la qualité de l’indexation. Le découpage des documents, les métadonnées, le choix du modèle d’embeddings et la stratégie de reranking influencent directement la réponse finale. Si le bon passage n’est pas récupéré, le modèle ne peut pas l’inventer proprement.',
      },
      {
        type: 'ul',
        items: [
          'Chunking par structure logique plutôt que par taille fixe quand le document le permet.',
          'Métadonnées explicites pour filtrer par source, date, client, version ou type de document.',
          'Hybrid search lorsque les mots exacts comptent autant que la proximité sémantique.',
          'Reranking sur les meilleurs candidats pour limiter le bruit transmis au modèle.',
        ],
      },
      {
        type: 'h2',
        text: 'Les agents sont surtout des boucles de décision',
      },
      {
        type: 'p',
        text:
          'Un agent utile n’est pas un modèle “plus autonome”. C’est une boucle qui choisit une action, appelle un outil, lit le résultat, puis décide si elle doit continuer ou s’arrêter. La qualité vient des garde-fous : permissions, limites d’itération, schémas de sortie, gestion des erreurs et journalisation.',
      },
      {
        type: 'p',
        text:
          'Les appels outils doivent rester explicites. Un modèle qui peut créer un ticket, interroger une base ou envoyer un email doit travailler avec des entrées validées, des confirmations sur les actions sensibles et des messages d’erreur compréhensibles.',
      },
      {
        type: 'h2',
        text: 'Évaluer avant de généraliser',
      },
      {
        type: 'p',
        text:
          'Sans jeu d’évaluation, chaque changement de prompt, de modèle ou de retriever devient une décision au ressenti. Il faut des cas de test représentatifs : questions faciles, documents contradictoires, absence de réponse, formats attendus, contraintes métier.',
      },
      {
        type: 'ul',
        items: [
          'Mesurer la récupération : le bon contexte est-il présent dans les passages fournis ?',
          'Mesurer la réponse : est-elle exacte, complète et suffisamment sourcée ?',
          'Mesurer le format : le JSON ou la sortie structurée respecte-t-il le schéma attendu ?',
          'Mesurer le coût et la latence pour savoir si le système tient en usage réel.',
        ],
      },
      {
        type: 'quote',
        text: 'Un système IA fiable se construit moins autour d’un prompt parfait qu’autour d’une boucle observable.',
      },
      {
        type: 'p',
        text:
          'La bonne architecture dépend du risque. Un assistant interne peut tolérer plus d’incertitude qu’un outil qui modifie des données métier. Dans tous les cas, les briques techniques doivent rendre les erreurs visibles, testables et corrigibles.',
      },
    ],
  },
]

export function getPostBySlug(slug: string): BlogPost | undefined {
  return BLOG_POSTS.find(post => post.slug === slug)
}
