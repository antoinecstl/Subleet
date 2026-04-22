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
    slug: 'ia-gestion-patrimoine',
    title: "Comment l'IA transforme la gestion de patrimoine",
    cat: 'IA',
    date: '18 Avr 2026',
    readTime: '5 min',
    excerpt: "L'intelligence artificielle ouvre de nouvelles perspectives pour les investisseurs particuliers. Analyse de portefeuille en temps réel, alertes prédictives, optimisation fiscale automatisée — ce qui était réservé aux family offices devient accessible à tous.",
    content: [
      {
        type: 'intro',
        text: "Pendant longtemps, les outils de gestion patrimoniale sophistiqués étaient l'apanage des grandes fortunes et des conseillers en gestion de patrimoine haut de gamme. L'IA change radicalement la donne en démocratisant l'accès à des analyses qui réclamaient autrefois des heures de travail manuel.",
      },
      {
        type: 'h2',
        text: 'Les limites de l\'approche traditionnelle',
      },
      {
        type: 'p',
        text: "La gestion de patrimoine classique souffre de plusieurs frictions structurelles. D'abord, la dispersion des données : un investisseur typique détient un PEA dans une banque, un compte-titres chez un courtier en ligne, un contrat d'assurance-vie ailleurs, et plusieurs livrets dans différents établissements. Obtenir une vision consolidée relève du parcours du combattant.",
      },
      {
        type: 'p',
        text: "Ensuite, la réactivité. Les marchés bougent en temps réel, mais la plupart des outils grand public ne mettent à jour les valorisations qu'une fois par jour, voire moins souvent. Pour un portefeuille exposé à des actifs volatils, ce décalage peut coûter cher.",
      },
      {
        type: 'h2',
        text: 'Ce que l\'IA apporte concrètement',
      },
      {
        type: 'p',
        text: "Les algorithmes modernes permettent aujourd'hui plusieurs avancées majeures dans la gestion d'actifs personnelle :",
      },
      {
        type: 'ul',
        items: [
          "Analyse de corrélation en temps réel entre vos positions pour détecter les concentrations de risque",
          "Alertes prédictives basées sur les patterns historiques et les signaux macroéconomiques",
          "Optimisation fiscale automatisée : identification des opportunités de tax-loss harvesting",
          "Simulation de scénarios : impact d'une hausse des taux, d'un choc sectoriel ou d'un krach sur votre allocation",
          "Recommandations de rééquilibrage personnalisées selon votre profil de risque et vos objectifs",
        ],
      },
      {
        type: 'h2',
        text: 'L\'approche de fi-hub',
      },
      {
        type: 'p',
        text: "Chez Subleet, nous avons conçu fi-hub avec cette conviction centrale : l'IA doit servir la clarté, pas la complexité. Plutôt que de noyer l'utilisateur sous des métriques abstraites, fi-hub traduit les données en insights actionnables. La plateforme agrège vos PEA, comptes-titres, livrets et assurances-vie dans un tableau de bord unique, puis applique des modèles d'analyse pour vous donner une lecture claire de votre situation.",
      },
      {
        type: 'quote',
        text: "L'intelligence artificielle ne remplace pas le jugement humain — elle lui donne les bonnes données au bon moment.",
      },
      {
        type: 'h2',
        text: 'Vers une gestion patrimoniale augmentée',
      },
      {
        type: 'p',
        text: "La tendance de fond est claire : l'IA ne va pas remplacer la relation humaine dans la gestion de patrimoine, mais elle va considérablement élever le niveau de base. Un investisseur équipé des bons outils prend de meilleures décisions, plus vite, avec moins de biais émotionnels. C'est précisément l'objectif que nous poursuivons avec fi-hub.",
      },
    ],
  },
  {
    id: 2,
    slug: 'vision-fi-hub',
    title: 'fi-hub : notre vision du wealth tracking',
    cat: 'Produit',
    date: '12 Avr 2026',
    readTime: '4 min',
    excerpt: "Pourquoi avons-nous créé fi-hub ? Le constat était simple : aucun outil existant ne permettait de voir l'ensemble de son patrimoine financier en un coup d'œil, avec des données fraîches et une vraie valeur analytique. Voici la genèse du projet.",
    content: [
      {
        type: 'intro',
        text: "fi-hub est né d'une frustration personnelle. Gérer plusieurs enveloppes d'investissement en France — PEA, CTO, assurance-vie, livrets réglementés — implique de jongler entre des interfaces bancaires disparates, des relevés mensuels en PDF et des tableaux Excel. Il manquait une couche d'agrégation intelligente.",
      },
      {
        type: 'h2',
        text: 'Le problème que nous voulions résoudre',
      },
      {
        type: 'p',
        text: "Le marché des agrégateurs financiers existe, mais il souffre d'un problème récurrent : les données sont souvent obsolètes, les interfaces peu engageantes, et les fonctionnalités analytiques quasi inexistantes. La plupart des outils se contentent d'afficher un solde consolidé. C'est utile, mais insuffisant pour piloter réellement sa stratégie patrimoniale.",
      },
      {
        type: 'p',
        text: "Ce que l'investisseur particulier sérieux veut vraiment savoir, c'est : quelle est ma performance réelle nette de frais ? Mon allocation actuelle correspond-elle à mes objectifs ? Quels sont mes points de concentration de risque ? fi-hub répond à ces questions.",
      },
      {
        type: 'h2',
        text: 'Les fonctionnalités clés',
      },
      {
        type: 'ul',
        items: [
          "Agrégation multi-comptes : PEA, CTO, assurance-vie, Livret A, LDDS et autres enveloppes",
          "Valorisation en temps réel des positions actions, ETF et fonds",
          "Calcul de performance personnalisé (TWR et MWR selon le contexte)",
          "Analyse d'allocation par classe d'actifs, géographie et secteur",
          "Historique des opérations et calcul des plus-values latentes et réalisées",
          "Tableau de bord personnalisable selon vos priorités",
        ],
      },
      {
        type: 'h2',
        text: 'Notre approche technique',
      },
      {
        type: 'p',
        text: "fi-hub repose sur une architecture moderne pensée pour la performance et la fiabilité. Nous agrégeons les données via des connexions sécurisées, avec une architecture qui favorise la fraîcheur des données sans surcharger les systèmes sources. La sécurité est au cœur du produit : chiffrement de bout en bout, authentification forte, et aucun stockage de vos identifiants bancaires.",
      },
      {
        type: 'quote',
        text: "Construire un outil de confiance pour gérer son patrimoine, c'est d'abord construire un outil dont on ne se demande jamais s'il est sûr.",
      },
      {
        type: 'h2',
        text: 'La suite du projet',
      },
      {
        type: 'p',
        text: "Nous travaillons actuellement sur plusieurs évolutions majeures : des alertes intelligentes basées sur vos seuils personnalisés, des rapports fiscaux automatisés pour simplifier votre déclaration, et une API ouverte pour les utilisateurs avancés qui souhaitent connecter fi-hub à leurs propres outils. Si vous souhaitez tester fi-hub en avant-première, rejoignez notre liste d'attente depuis la page Produits.",
      },
    ],
  },
  {
    id: 3,
    slug: 'automatisation-ia-commencer',
    title: "Automatisation IA : par où commencer ?",
    cat: 'IA',
    date: '5 Avr 2026',
    readTime: '6 min',
    excerpt: "L'automatisation par l'IA n'est plus réservée aux grandes entreprises. Mais face à la prolifération des outils, beaucoup de dirigeants et d'équipes ne savent pas par où commencer. Guide pratique pour identifier les bons cas d'usage et éviter les pièges courants.",
    content: [
      {
        type: 'intro',
        text: "Presque chaque semaine, un nouvel outil IA promet de révolutionner telle ou telle partie de votre activité. Dans ce bruit ambiant, comment distinguer ce qui est réellement utile de ce qui est gadget ? Comment prioriser ses efforts et obtenir un retour sur investissement concret ?",
      },
      {
        type: 'h2',
        text: 'Identifier les bons processus à automatiser',
      },
      {
        type: 'p',
        text: "La règle d'or : commencez par les tâches répétitives, volumineuses et à faible valeur ajoutée. Ces processus sont les plus faciles à automatiser et offrent le meilleur ratio effort/impact. Quelques exemples concrets :",
      },
      {
        type: 'ul',
        items: [
          "Qualification et tri des leads entrants par email ou formulaire",
          "Rédaction de premiers brouillons de réponses clients standardisées",
          "Extraction et structuration de données depuis des documents PDF ou des emails",
          "Génération de rapports hebdomadaires à partir de données existantes",
          "Planification et suivi de tâches récurrentes dans des outils comme Notion ou Airtable",
        ],
      },
      {
        type: 'h2',
        text: 'Choisir les bons outils',
      },
      {
        type: 'p',
        text: "Le marché s'est structuré autour de quelques catégories d'outils complémentaires. Pour l'automatisation de workflows, Zapier, Make et n8n sont les références. Pour les agents IA capables de prendre des décisions contextuelles, les frameworks basés sur les LLM (GPT-4, Claude, Mistral) ouvrent des possibilités considérables. Pour les interfaces conversationnelles internes ou client, les solutions de chatbot IA sont désormais accessibles sans développement complexe.",
      },
      {
        type: 'p',
        text: "Chez Subleet, nous accompagnons nos clients dans la sélection et l'intégration de ces outils en fonction de leur stack existant et de leurs objectifs métier spécifiques.",
      },
      {
        type: 'h2',
        text: 'Les erreurs à éviter',
      },
      {
        type: 'ul',
        items: [
          "Automatiser un processus mal défini : l'IA amplifie les dysfonctionnements existants, elle ne les corrige pas",
          "Vouloir tout faire en même temps : mieux vaut un cas d'usage qui fonctionne parfaitement que dix pilotes qui stagnent",
          "Négliger la formation des équipes : un outil IA non adopté ne produit aucune valeur",
          "Sous-estimer les enjeux de qualité des données : garbage in, garbage out",
          "Confondre automatisation et suppression de poste — l'objectif est de libérer du temps, pas de déshumaniser",
        ],
      },
      {
        type: 'h2',
        text: 'Par où commencer concrètement ?',
      },
      {
        type: 'p',
        text: "Notre recommandation : réalisez un audit de vos processus internes sur une semaine. Demandez à chaque membre de votre équipe de noter les tâches qu'il trouve les plus fastidieuses. Vous obtiendrez rapidement une liste priorisée des candidats à l'automatisation. Ensuite, lancez un pilote en 4 semaines sur le cas d'usage le plus simple — les résultats obtenus serviront de preuve de concept pour élargir le périmètre.",
      },
      {
        type: 'quote',
        text: "L'automatisation réussie ne part jamais d'un outil. Elle part d'un problème bien défini.",
      },
    ],
  },
  {
    id: 4,
    slug: 'erreurs-strategie-digitale',
    title: "Les 5 erreurs à éviter dans votre stratégie digitale",
    cat: 'Stratégie',
    date: '28 Mar 2026',
    readTime: '3 min',
    excerpt: "Retour d'expérience sur les pièges les plus fréquents de la transformation digitale — et comment les contourner. Des erreurs que nous observons régulièrement chez nos clients et que nous avons parfois commises nous-mêmes.",
    content: [
      {
        type: 'intro',
        text: "La transformation digitale est un chantier permanent, pas un projet avec une date de fin. Ceux qui l'abordent comme un projet ponctuel se retrouvent invariablement à recommencer tous les trois ans. Voici les cinq erreurs que nous observons le plus souvent — et comment les éviter.",
      },
      {
        type: 'h2',
        text: 'Erreur 1 — Vouloir tout digitaliser en même temps',
      },
      {
        type: 'p',
        text: "La transformation digitale crée un appétit insatiable pour les nouveaux outils. CRM, ERP, automatisation marketing, BI, collaboration… Résultat : des budgets éparpillés, des équipes surchargées d'outils peu utilisés, et une dette d'intégration massive. La solution : une roadmap séquencée avec des critères de priorisation clairs — impact métier, complexité d'implémentation et rapidité du retour sur investissement.",
      },
      {
        type: 'h2',
        text: 'Erreur 2 — Négliger l\'expérience utilisateur',
      },
      {
        type: 'p',
        text: "L'erreur classique consiste à choisir les outils selon les fonctionnalités sur le papier, sans impliquer les utilisateurs finaux. Un outil techniquement parfait mais peu ergonomique sera contourné. Systématiquement, investissez dans des tests utilisateurs avant tout déploiement, même à petite échelle.",
      },
      {
        type: 'h2',
        text: 'Erreur 3 — Sous-estimer les délais',
      },
      {
        type: 'p',
        text: "Un projet digital dure toujours plus longtemps que prévu — généralement 1,5 à 2 fois l'estimation initiale. Les raisons sont connues : migration de données, formation des équipes, personnalisations imprévues, intégrations complexes. Anticipez ces dépassements dès la phase de planification, et préférez des livraisons itératives aux grands déploiements monolithiques.",
      },
      {
        type: 'h2',
        text: 'Erreur 4 — Oublier la formation des équipes',
      },
      {
        type: 'p',
        text: "Beaucoup d'organisations sous-investissent dans la formation, considérée comme une dépense secondaire. C'est une erreur fondamentale : le taux d'adoption d'un outil détermine directement son retour sur investissement. Prévoyez minimum 20 % du budget projet pour la formation et l'accompagnement au changement.",
      },
      {
        type: 'h2',
        text: 'Erreur 5 — Confondre outils et stratégie',
      },
      {
        type: 'p',
        text: "La plus répandue et la plus coûteuse. Adopter ChatGPT ou Salesforce n'est pas une stratégie digitale — c'est un choix d'outil. La stratégie, c'est ce que vous voulez accomplir, pour qui, et comment vous allez mesurer le succès. Sans cette clarté préalable, les outils les plus puissants ne produisent que de la complexité supplémentaire.",
      },
      {
        type: 'quote',
        text: "Un outil digital sans stratégie, c'est un marteau cherchant un clou.",
      },
      {
        type: 'p',
        text: "Si vous souhaitez qu'on analyse votre situation et qu'on vous aide à construire une feuille de route digitale adaptée à votre contexte, notre équipe est disponible pour un premier échange sans engagement.",
      },
    ],
  },
]

export function getPostBySlug(slug: string): BlogPost | undefined {
  return BLOG_POSTS.find(p => p.slug === slug)
}
