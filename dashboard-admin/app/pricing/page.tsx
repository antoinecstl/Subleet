"use client"

import { useUser } from "@clerk/nextjs"
import { PricingTable } from '@clerk/nextjs'
import { useState, useEffect, useRef } from "react"

export default function PricingPage() {
  const { user } = useUser();
  const [theme, setTheme] = useState<"light" | "dark">("dark");
  const [showContactModal, setShowContactModal] = useState(false);  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' });
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  // Completely revamped theme detection logic
  useEffect(() => {
    // Function to detect current theme
    const detectTheme = () => {
      const isDarkMode = !document.body.classList.contains('light-theme');
      return isDarkMode ? 'dark' : 'light';
    };
    
    // Set theme on mount and whenever it changes
    const updateTheme = () => {
      const currentTheme = detectTheme();
      setTheme(currentTheme);
    };
    
    // Initial theme detection
    updateTheme();
    
    // Set up mutation observer to detect theme changes on body element
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'class') {
          updateTheme();
        }
      });
    });
    
    observer.observe(document.body, { attributes: true });
    
    // Cleanup observer on component unmount
    return () => observer.disconnect();
  }, []);
  
  // Force refresh when theme changes for immediate visual update
  useEffect(() => {
    const pricingContainer = document.querySelector('.pricing-table-container');
    if (pricingContainer) {
      // Trigger a subtle layout shift to force refresh the component
      pricingContainer.classList.add('theme-refresh');
      setTimeout(() => pricingContainer.classList.remove('theme-refresh'), 10);
    }
  }, [theme]);

  // Modal close on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (showContactModal && modalRef.current && !modalRef.current.contains(event.target as Node)) {
        setShowContactModal(false);
      }
    }
    if (showContactModal) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showContactModal]);

  // Fonction pour soumettre le formulaire de contact
  const handleSubmitContact = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },        body: JSON.stringify({
          name: form.name,
          email: form.email,
          phone: form.phone,
          message: form.message,
          source: 'Pricing Page'
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'An error happened');
      }      setSubmitted(true);
      // Réinitialiser le formulaire
      setForm({ name: '', email: '', phone: '', message: '' });
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'An error happened');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen p-6 relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-20 left-10 w-64 h-64 rounded-full bg-primary opacity-5 blur-3xl"></div>
      <div className="absolute bottom-20 right-10 w-80 h-80 rounded-full bg-secondary opacity-5 blur-3xl"></div>
      
      <div className="relative z-10 content-container">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            Simple, Transparent <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">Pricing</span>
          </h1>
          <p className="text-lg text-muted mb-6">
            Choose the plan that&apos;s right for your business needs
          </p>
        </div>
        
        {/* Pricing Table & Custom Dev Offer côte à côte */}
        <div className="max-w-5xl mx-auto mb-8 md:flex md:gap-8">
          {/* Clerk Pricing Table */}
          <div className={`glass-card rounded-xl p-8 mb-8 md:mb-0 md:w-1/2 shadow-lg transition-all duration-300 border flex flex-col ${theme === 'light' ? 'bg-white border-gray-200' : 'bg-gray-900 border-gray-800'}`}>
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center mr-4 shadow-lg">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
              </div>
              <div>
                <h2 className="text-2xl font-bold mb-1">Standard Plan</h2>
                <p className="text-base text-muted">Choose the plan that&apos;s right for your business</p>
              </div>
            </div>
            <div className="flex-1">
              <PricingTable 
                key={theme}
                newSubscriptionRedirectUrl={user ? "/dashboard" : "/sign-in"}
                appearance={{
                  variables: theme === "light" 
                    ? {
                        colorPrimary: '#4f46e5', 
                        colorText: '#0f172a',
                        colorTextSecondary: '#4b5563',
                        colorBackground: 'rgba(255, 255, 255, 0.9)',
                        borderRadius: '0.75rem',
                        fontFamily: 'inherit',
                        colorSuccess: '#059669',
                      }
                    : {
                        colorPrimary: '#8b5cf6',
                        colorText: 'white',
                        colorTextSecondary: '#d1d5db',
                        colorBackground: 'rgba(35, 30, 54, 0.9)',
                        borderRadius: '0.75rem',
                        fontFamily: 'inherit',
                        colorSuccess: '#10b981',
                      },
                  elements: {
                    card: "glass-card shadow-lg hover:shadow-xl transition-all duration-300",
                    formButtonPrimary: "bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 hover:from-indigo-500 hover:via-purple-500 hover:to-pink-500",
                    footerActionLink: theme === "light" ? "text-indigo-600 hover:text-indigo-700" : "text-indigo-400 hover:text-indigo-300",
                    headerTitle: "text-2xl font-bold",
                    headerSubtitle: "text-base opacity-80",
                    switchThumb : "dark:bg-white dark:border-gray-700",
                    pricingTable : "rounded-xl glass-card  transition-all duration-300",
                  }
                }}
                checkoutProps={{
                  appearance: {
                    elements: {
                      drawerBackdrop: "fixed inset-0 bg-black/40 z-[70]",
                      drawerRoot:      "fixed inset-0 flex z-[80]",   // <– conteneur principal
                      drawerContent:   "z-[90] shadow-2xl",
                    },
                  },
                }}
              />
            </div>
          </div>
          {/* Custom Dev Offer */}
          <div className={`glass-card rounded-xl p-8 md:w-1/2 shadow-lg transition-all duration-300 border flex flex-col ${theme === 'light' ? 'bg-white border-gray-200' : 'bg-gray-900 border-gray-800'}`}>
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-indigo-500 rounded-full flex items-center justify-center mr-4 shadow-lg">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2a4 4 0 014-4h4" /></svg>
              </div>
              <div>
                <h2 className="text-2xl font-bold mb-1">Custom Development</h2>
                <p className="text-base text-muted">Tailored solutions for unique business needs</p>
              </div>
            </div>
            <div className="flex-1">
              <p className={`text-lg mb-6 ${theme === 'light' ? 'text-gray-700' : 'text-gray-300'}`}>Need a custom solution? Our team of expert developers can create a tailored solution to meet your specific needs.</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                <div className="flex items-start">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary mr-2 mt-1 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Custom Architecture</span>
                </div>
                <div className="flex items-start">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary mr-2 mt-1 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Full Integration</span>
                </div>
                <div className="flex items-start">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary mr-2 mt-1 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Dedicated Support</span>
                </div>
                <div className="flex items-start">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary mr-2 mt-1 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Continuous Updates</span>
                </div>
              </div>
            </div>
            <div>              <button
                className="btn-gradient w-full px-6 py-3 text-center rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
                onClick={() => { setShowContactModal(true); setSubmitted(false); setSubmitError(null); }}
                type="button"
              >
                Contact Us
              </button>
            </div>
          </div>
        </div>

        {/* FAQ Section - même largeur */}
        <div className="glass-card rounded-xl p-8 mb-8 mt-8 sm:mt-16 max-w-5xl mx-auto"> {/* Increased top margin for better spacing */}
          <h2 className="card-header text-center text-2xl mb-8">Frequently Asked Questions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 sm:gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-2">Can I switch plans later?</h3>
              <p className="text-muted mb-6">
                Yes, you can upgrade or downgrade your plan at any time. Changes will be reflected in your next billing cycle.
              </p>
            </div>     
            <div>              
              <h3 className="text-lg font-semibold mb-2">Can I create custom AI behaviors?</h3>
              <p className="text-muted mb-6">
                Yes, all plans allow you to customize your AI&apos;s behavior, knowledge, and responses.
              </p>
            </div>
          </div>
        </div>        <div className="text-center text-muted mb-8">
          <p className="text-sm">Need help choosing a plan? <button className="text-primary hover:underline" onClick={() => { setShowContactModal(true); setSubmitted(false); setSubmitError(null); }}>Contact us</button></p>
        </div>
      </div>

      {/* Contact Modal */}
      {showContactModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div ref={modalRef} className={`w-full max-w-sm mx-auto rounded-2xl shadow-2xl p-8 relative ${theme === 'light' ? 'bg-white' : 'bg-gray-900'} border border-gray-200 dark:border-gray-800`}>
            <button
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 text-2xl"
              onClick={() => setShowContactModal(false)}
              aria-label="Close"
            >
              &times;
            </button>            <h2 className="text-xl font-bold mb-4 text-center">Contact Us</h2>
            {submitted ? (
              <div className="text-center text-green-600 dark:text-green-400 font-semibold py-8">
                <div className="mb-4">
                  <svg className="w-16 h-16 mx-auto mb-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                Thank you! Your message has been sent.<br />We will get back to you soon.
              </div>
            ) : (
              <form
                className="flex flex-col gap-4"
                onSubmit={handleSubmitContact}
              >
                {submitError && (
                  <div className="text-red-600 dark:text-red-400 text-sm p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                    {submitError}
                  </div>
                )}
                <input
                  type="text"
                  required
                  placeholder="Your Name"
                  className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  disabled={isSubmitting}
                />                <input
                  type="email"
                  required
                  placeholder="Your Email"
                  className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  disabled={isSubmitting}
                />
                <input
                  type="tel"
                  required
                  placeholder="Your Phone Number"
                  className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  value={form.phone}
                  onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                  disabled={isSubmitting}
                />
                <textarea
                  required
                  placeholder="Your Message"
                  rows={4}
                  className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  value={form.message}
                  onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                  disabled={isSubmitting}
                />
                <button
                  type="submit"
                  className="btn-gradient px-6 py-2 rounded-lg font-semibold mt-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Sending...
                    </>
                  ) : (
                    'Send Message'
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  )
}