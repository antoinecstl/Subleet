"use client"

import { useState } from "react";
import Link from "next/link";
import { useLanguage } from "../../lib/language-context";

export default function PricingPage() {
  const { t } = useLanguage();
  
  const [form, setForm] = useState({
    name: "",
    email: "",
    company: "",
    plan: "",
    message: ""
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Contact form submitted:", form);
    alert(t("pricing.contact.success"));
    setForm({ name: "", email: "", company: "", plan: "", message: "" });
  };

  const pricingPlans = [
    {
      name: t("pricing.starter.name") as string,
      price: t("pricing.starter.price") as string,
      period: t("pricing.starter.period") as string,
      description: t("pricing.starter.description") as string,
      features: t("pricing.starter.features") as unknown as string[],
      cta: t("pricing.starter.cta") as string,
      popular: false,
    },
    {
      name: t("pricing.business.name") as string,
      price: t("pricing.business.price") as string,
      period: t("pricing.business.period") as string,
      description: t("pricing.business.description") as string,
      features: t("pricing.business.features") as unknown as string[],
      cta: t("pricing.business.cta") as string,
      popular: true,
      recommended: t("pricing.business.recommended") as string,
    },
    {
      name: t("pricing.enterprise.name") as string,
      price: t("pricing.enterprise.price") as string,
      period: "",
      description: t("pricing.enterprise.description") as string,
      features: t("pricing.enterprise.features") as unknown as string[],
      cta: t("pricing.enterprise.cta") as string,
      popular: false,
    },
  ];

  return (
    <div className="min-h-screen relative overflow-hidden hero-gradient">
      {/* Decorative elements */}
      <div className="absolute top-20 left-10 w-64 h-64 rounded-full bg-blue-500 opacity-20 blur-3xl animate-float"></div>
      <div className="absolute bottom-20 right-10 w-80 h-80 rounded-full bg-purple-600 opacity-20 blur-3xl animate-float" style={{ animationDelay: "2s" }}></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-indigo-500 opacity-10 blur-3xl animate-pulse-soft"></div>
      
      {/* Main content */}
      <div className="container mx-auto px-4 py-12 md:py-24 relative z-10">
        <h1 className="text-4xl md:text-5xl font-bold text-center text-white mb-4 animate-slide-left">
          {t("pricing.title")} <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-purple-300">Catalisia</span>
        </h1>
        <p className="text-white text-xl text-center max-w-2xl mx-auto mb-16 opacity-90 animate-slide-left" style={{ animationDelay: "0.2s" }}>
          {t("pricing.subtitle")}
        </p>
        
        {/* Pricing cards */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-24 animate-slide-right">
          {pricingPlans.map((plan, index) => (
            <div 
              key={index} 
              className={`glass-card rounded-xl p-8 text-white hover-scale ${plan.popular ? 'ring-2 ring-purple-400 shadow-lg shadow-purple-500/20' : ''}`}
            >
              {plan.popular && (
                <div className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-xs font-bold px-4 py-1 rounded-full inline-block mb-4">
                  {plan.recommended}
                </div>
              )}
              <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
              <div className="mb-4">
                <span className="text-3xl font-bold">{plan.price}</span>
                {plan.period && <span className="text-white/70 ml-1">{plan.period}</span>}
              </div>
              <p className="text-white/80 mb-6 min-h-[60px]">{plan.description}</p>
              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-start">
                    <svg className="h-5 w-5 text-indigo-300 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-white/90">{feature}</span>
                  </li>
                ))}
              </ul>
              <button 
                onClick={() => setForm({...form, plan: plan.name})}
                className={`w-full py-3 px-4 rounded-full font-semibold transition duration-300 ${
                  plan.popular 
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white' 
                    : 'bg-white/20 hover:bg-white/30 text-white'
                }`}
              >
                {plan.cta}
              </button>
            </div>
          ))}
        </div>
        
        {/* Contact form */}
        <div className="max-w-2xl mx-auto animate-slide-left">
          <div className="glass-card rounded-xl p-8">
            <h3 className="text-2xl font-bold text-white mb-6 text-center">{t("pricing.contact.title")}</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="name" className="block text-white/80 mb-1 text-sm">{t("pricing.contact.name")}</label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    required
                    value={form.name}
                    onChange={handleChange}
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder={t("pricing.contact.name") as string}
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-white/80 mb-1 text-sm">Email</label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={form.email}
                    onChange={handleChange}
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="example@email.com"
                  />
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="company" className="block text-white/80 mb-1 text-sm">{t("pricing.contact.company")}</label>
                  <input
                    id="company"
                    name="company"
                    type="text"
                    value={form.company}
                    onChange={handleChange}
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder={t("pricing.contact.company") as string}
                  />
                </div>
                <div>
                  <label htmlFor="plan" className="block text-white/80 mb-1 text-sm">{t("pricing.contact.plan")}</label>
                  <select
                    id="plan"
                    name="plan"
                    value={form.plan}
                    onChange={handleChange}
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="" className="bg-gray-800">{t("pricing.contact.selectPlan")}</option>
                    {pricingPlans.map((plan, index) => (
                      <option key={index} value={plan.name} className="bg-gray-800">
                        {plan.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label htmlFor="message" className="block text-white/80 mb-1 text-sm">{t("pricing.contact.message")}</label>
                <textarea
                  id="message"
                  name="message"
                  rows={4}
                  required
                  value={form.message}
                  onChange={handleChange}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder={t("pricing.contact.messagePlaceholder") as string}
                />
              </div>
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold py-3 rounded-lg transition duration-300"
              >
                {t("pricing.contact.submit")}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}