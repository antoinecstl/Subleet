"use client"

import Link from "next/link"
import { useLanguage } from "../../lib/language-context"

export default function InfoPage() {
  const { t } = useLanguage();
  
  return (
    <div className="min-h-screen relative overflow-hidden hero-gradient">
      {/* Decorative elements */}
      <div className="absolute top-20 left-10 w-64 h-64 rounded-full bg-blue-500 opacity-20 blur-3xl animate-float"></div>
      <div className="absolute bottom-20 right-10 w-80 h-80 rounded-full bg-purple-600 opacity-20 blur-3xl animate-float" style={{ animationDelay: "2s" }}></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-indigo-500 opacity-10 blur-3xl animate-pulse-soft"></div>
      
      {/* Main content */}
      <div className="container mx-auto px-4 py-12 md:py-24 relative z-10">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold text-center text-white mb-12 animate-slide-left">
            {t("info.title")} <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-purple-300">Catalisia</span>
          </h1>
          
          <div className="glass-card rounded-xl p-8 animate-slide-right">
            <div className="text-white">
              <div className="mb-10">
                <h2 className="text-2xl font-bold mb-4">{t("info.mission.title")}</h2>
                <p className="text-lg opacity-90">
                  {t("info.mission.content")}
                </p>
              </div>
              
              <div className="mb-10">
                <h2 className="text-2xl font-bold mb-4">{t("info.technology.title")}</h2>
                <p className="text-lg opacity-90">
                  {t("info.technology.content")}
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
                <div>
                  <h2 className="text-2xl font-bold mb-4">{t("info.features.title")}</h2>
                  <ul className="list-disc list-inside space-y-2 opacity-90">
                    {(t("info.features.list") as unknown as string[]).map((feature, index) => (
                      <li key={index}>{feature}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h2 className="text-2xl font-bold mb-4">{t("info.benefits.title")}</h2>
                  <ul className="list-disc list-inside space-y-2 opacity-90">
                    {(t("info.benefits.list") as unknown as string[]).map((benefit, index) => (
                      <li key={index}>{benefit}</li>
                    ))}
                  </ul>
                </div>
              </div>
              
              <div className="text-center">
                <Link href="/pricing">
                  <button className="bg-white text-purple-600 font-semibold py-3 px-8 rounded-full shadow-lg hover:shadow-purple-500/20 hover:bg-purple-50 transition duration-300 transform hover:scale-105">
                    {t("info.cta")}
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}