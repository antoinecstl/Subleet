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
    slug: 'interface-credibilite',
    title: 'Une interface crédible ne se contente pas d’être jolie',
    cat: 'Design',
    date: '28 mars 2026',
    readTime: '4 min',
    excerpt:
      'La crédibilité d’un site ou d’un outil se joue dans les détails : rythme, textes, états, cohérence et capacité à guider sans surjouer.',
    content: [
      {
        type: 'intro',
        text:
          'Un design peut impressionner quelques secondes et échouer dès que l’utilisateur doit vraiment s’en servir. La crédibilité naît quand la forme aide la compréhension.',
      },
      {
        type: 'h2',
        text: 'Le style doit servir la lecture',
      },
      {
        type: 'p',
        text:
          'Typographie, couleur, grille et animation ne sont pas des couches décoratives. Ce sont des outils de hiérarchie. Leur rôle est d’indiquer ce qui compte, ce qui est secondaire, et ce qui peut attendre.',
      },
      {
        type: 'h2',
        text: 'Les détails qui changent la perception',
      },
      {
        type: 'ul',
        items: [
          'Des titres qui décrivent vraiment la section.',
          'Des boutons dont l’action est évidente.',
          'Des contrastes suffisants pour lire sans effort.',
          'Des états d’erreur et de succès écrits clairement.',
          'Une cohérence visuelle entre la page d’accueil et les pages profondes.',
        ],
      },
      {
        type: 'p',
        text:
          'Le niveau de finition n’est pas seulement esthétique. Il donne une indication sur le sérieux du produit, sur sa maintenance future et sur l’attention portée aux utilisateurs.',
      },
      {
        type: 'quote',
        text: 'Une bonne interface fait baisser le niveau de doute.',
      },
    ],
  },
]

export function getPostBySlug(slug: string): BlogPost | undefined {
  return BLOG_POSTS.find(p => p.slug === slug)
}

