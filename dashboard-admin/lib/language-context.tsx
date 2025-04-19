"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Définir les types pour les traductions et le contexte
export type Language = 'fr' | 'en';

export type Translations = {
  [key: string]: {
    fr: string | string[];
    en: string | string[];
  };
};

type LanguageContextType = {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string | string[];
};

// Valeurs par défaut
const defaultLanguage: Language = 'en';

// Créer le contexte
const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Translations
export const translations: Translations = {
  // Navigation
  "nav.dashboard": {
    en: "Dashboard",
    fr: "Dashboard"
  },
  "nav.info": {
    en: "Informations",
    fr: "Informations"
  },
  "nav.pricing": {
    en: "Pricing",
    fr: "Tarifs"
  },
  "nav.learnMore": {
    en: "Learn More",
    fr: "En savoir plus"
  },
  // Landing page
  "landing.welcome": {
    en: "Welcome to",
    fr: "Bienvenue sur"
  },
  "landing.subtitle": {
    en: "Your ultimate AI-powered chatbot solution, designed to seamlessly integrate into your business and enhance customer interactions.",
    fr: "Votre solution de chatbot IA ultime, conçue pour s'intégrer parfaitement à votre entreprise et améliorer les interactions avec vos clients."
  },
  "landing.features": {
    en: "Why Choose Catalisia",
    fr: "Pourquoi choisir Catalisia"
  },
  "landing.feature1.title": {
    en: "Smart Responses",
    fr: "Réponses intelligentes"
  },
  "landing.feature1.desc": {
    en: "AI-driven responses that improve over time",
    fr: "Réponses basées sur l'IA qui s'améliorent avec le temps"
  },
  "landing.feature2.title": {
    en: "Seamless Integration",
    fr: "Intégration facile"
  },
  "landing.feature2.desc": {
    en: "Easily integrate with your existing platforms",
    fr: "S'intègre facilement à vos plateformes existantes"
  },
  "landing.feature3.title": {
    en: "Analytics Dashboard",
    fr: "Tableau de bord analytique"
  },
  "landing.feature3.desc": {
    en: "In-depth insights into chat performance",
    fr: "Analyses approfondies des performances de discussion"
  },
  "landing.aiConversations": {
    en: "AI-Powered Conversations",
    fr: "Conversations alimentées par l'IA"
  },
  "landing.aiDescription": {
    en: "Catalisia uses advanced natural language processing to deliver human-like interactions",
    fr: "Catalisia utilise un traitement avancé du langage naturel pour offrir des interactions similaires à celles d'un humain"
  },
  // Ajout de nouvelles traductions pour la page Info et Pricing
  // Info page
  "info.title": {
    en: "About",
    fr: "À propos de "
  },
  "info.mission.title": {
    en: "Our Mission",
    fr: "Notre mission"
  },
  "info.mission.content": {
    en: "At Catalisia, we transform customer interactions through our cutting-edge artificial intelligence technology. Our platform creates seamless, natural conversational experiences, reducing wait times and improving customer satisfaction.",
    fr: "Chez Catalisia, nous transformons les interactions clients grâce à notre technologie d'intelligence artificielle de pointe. Notre plateforme permet de créer des expériences conversationnelles fluides et naturelles, réduisant les temps d'attente et améliorant la satisfaction client."
  },
  "info.technology.title": {
    en: "Technology",
    fr: "Technologie" 
  },
  "info.technology.content": {
    en: "Our chatbot relies on the most advanced language models to understand customer requests with remarkable precision. Our platform continuously learns from each interaction to constantly improve.",
    fr: "Notre chatbot s'appuie sur les modèles de langage les plus avancés pour comprendre les demandes des clients avec une précision remarquable. Notre plateforme apprend en continu de chaque interaction pour s'améliorer constamment."
  },
  "info.features.title": {
    en: "Key Features",
    fr: "Fonctionnalités clés"
  },
  "info.features.list": {
    en: ["Natural language understanding", "Personalized and contextual responses", "Multi-platform integration", "Sentiment analysis", "Analytics dashboard"],
    fr: ["Compréhension du langage naturel", "Réponses personnalisées et contextuelles", "Intégration multi-plateforme", "Analyse de sentiments", "Tableau de bord analytique"]
  },
  "info.benefits.title": {
    en: "Benefits",
    fr: "Avantages"
  },
  "info.benefits.list": {
    en: ["24/7 availability", "Reduced operational costs", "Improved customer experience", "Time savings for your teams", "Analysis and insights about your customers"],
    fr: ["Disponibilité 24/7", "Réduction des coûts opérationnels", "Amélioration de l'expérience client", "Gain de temps pour vos équipes", "Analyse et insights sur vos clients"]
  },
  "info.cta": {
    en: "Discover our offers",
    fr: "Découvrir nos offres"
  },
  
  // Pricing page
  "pricing.title": {
    en: "Our Offers",
    fr: "Nos Offres"
  },
  "pricing.subtitle": {
    en: "Solutions tailored to your needs, regardless of your company size",
    fr: "Des solutions adaptées à vos besoins, quelle que soit la taille de votre entreprise"
  },
  "pricing.starter.name": {
    en: "Starter",
    fr: "Starter"
  },
  "pricing.starter.price": {
    en: "€49",
    fr: "49€"
  },
  "pricing.starter.period": {
    en: "per month",
    fr: "par mois"
  },
  "pricing.starter.description": {
    en: "Ideal for small businesses starting with AI",
    fr: "Idéal pour les petites entreprises débutant avec l'IA"
  },
  "pricing.starter.features": {
    en: ["1,000 conversations per month", "Email support", "Basic website integration", "Standard dashboard", "1 supported language"],
    fr: ["1 000 conversations par mois", "Assistance par email", "Intégration site web basique", "Tableau de bord standard", "1 langue supportée"]
  },
  "pricing.starter.cta": {
    en: "Get Started",
    fr: "Démarrer"
  },
  "pricing.business.name": {
    en: "Business",
    fr: "Business"
  },
  "pricing.business.price": {
    en: "€199",
    fr: "199€"
  },
  "pricing.business.period": {
    en: "per month",
    fr: "par mois"
  },
  "pricing.business.description": {
    en: "For growing businesses with specific needs",
    fr: "Pour les entreprises en croissance avec des besoins spécifiques"
  },
  "pricing.business.features": {
    en: ["10,000 conversations per month", "Priority support", "Multi-platform integration", "Advanced dashboard", "3 supported languages", "Basic customization"],
    fr: ["10 000 conversations par mois", "Assistance prioritaire", "Intégration multi-plateforme", "Tableau de bord avancé", "3 langues supportées", "Personnalisation de base"]
  },
  "pricing.business.cta": {
    en: "Choose this plan",
    fr: "Choisir ce plan"
  },
  "pricing.business.recommended": {
    en: "Recommended",
    fr: "Recommandé"
  },
  "pricing.enterprise.name": {
    en: "Enterprise",
    fr: "Enterprise"
  },
  "pricing.enterprise.price": {
    en: "Custom",
    fr: "Sur mesure"
  },
  "pricing.enterprise.description": {
    en: "For large organizations with advanced needs",
    fr: "Pour les grandes organisations aux besoins avancés"
  },
  "pricing.enterprise.features": {
    en: ["Unlimited volume", "Dedicated 24/7 support", "Complete API integration", "Custom dashboard", "Full multilingual support", "Advanced customization", "Training and onboarding"],
    fr: ["Volume illimité", "Support dédié 24/7", "Intégration complète API", "Tableau de bord personnalisé", "Support multilingue complet", "Personnalisation avancée", "Formation et onboarding"]
  },
  "pricing.enterprise.cta": {
    en: "Contact the team",
    fr: "Contacter l'équipe"
  },
  "pricing.contact.title": {
    en: "Contact us for more information",
    fr: "Contactez-nous pour plus d'informations"
  },
  "pricing.contact.name": {
    en: "Name",
    fr: "Nom"
  },
  "pricing.contact.company": {
    en: "Company",
    fr: "Entreprise"
  },
  "pricing.contact.plan": {
    en: "Plan of interest",
    fr: "Plan d'intérêt"
  },
  "pricing.contact.selectPlan": {
    en: "Select a plan",
    fr: "Sélectionnez un plan"
  },
  "pricing.contact.message": {
    en: "Message",
    fr: "Message"
  },
  "pricing.contact.messagePlaceholder": {
    en: "Detail your specific needs...",
    fr: "Détaillez vos besoins spécifiques..."
  },
  "pricing.contact.submit": {
    en: "Send your request",
    fr: "Envoyer votre demande"
  },
  "pricing.contact.success": {
    en: "Thank you for your interest! Our team will contact you soon.",
    fr: "Merci pour votre intérêt ! Notre équipe vous contactera sous peu."
  }
};

// Provider component
export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguage] = useState<Language>(defaultLanguage);

  // Fonction pour détecter la langue préférée du navigateur
  useEffect(() => {
    const detectBrowserLanguage = () => {
      const browserLang = navigator.language.split('-')[0];
      // Vérifier si la langue est prise en charge
      if (browserLang === 'fr') {
        setLanguage('fr');
      } else {
        // Langue par défaut en anglais
        setLanguage('en');
      }
    };

    detectBrowserLanguage();
  }, []);

  // Fonction pour obtenir une traduction
  const t = (key: string): string | string[] => {
    if (!translations[key]) {
      console.warn(`Missing translation for key: ${key}`);
      return key;
    }
    return translations[key][language];
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

// Hook pour utiliser le contexte de langue
export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};