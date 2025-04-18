"use client"

import { useEffect } from "react";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import { clearCache } from "../lib/cache-utils";

export default function Home() {
  const { user, isLoaded } = useUser();

  useEffect(() => {
    // Clear cache only if authentication check is complete and user is not logged in
    if (isLoaded && !user) {
      // User is not authenticated (likely after logout), clear cache
      clearCache();
      console.log("Cache cleared after user logout");
    }
  }, [user, isLoaded]);

  return (
    <div className="min-h-screen relative overflow-hidden hero-gradient">
      {/* Decorative elements */}
      <div className="absolute top-20 left-10 w-64 h-64 rounded-full bg-blue-500 opacity-20 blur-3xl animate-float"></div>
      <div className="absolute bottom-20 right-10 w-80 h-80 rounded-full bg-purple-600 opacity-20 blur-3xl animate-float" style={{ animationDelay: "2s" }}></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-indigo-500 opacity-10 blur-3xl animate-pulse-soft"></div>
      
      {/* Main content */}
      <div className="container mx-auto px-4 py-12 md:py-24 relative z-10">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-16">
          
          {/* Left column - Text content */}
          <div className="flex-1 text-white space-y-8 animate-slide-left">
            <h1 className="text-4xl md:text-6xl font-bold leading-tight">
              Welcome to <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-purple-300">Catalisia</span>
            </h1>
            
            <p className="text-xl opacity-90 max-w-2xl">
              Your ultimate AI-powered chatbot solution, designed to seamlessly 
              integrate into your business and enhance customer interactions.
            </p>
            
            <div className="flex flex-wrap gap-4 pt-4">
              <Link href="/dashboard">
                <button className="bg-white text-blue-600 font-semibold py-3 px-8 rounded-full shadow-lg 
                hover:shadow-blue-500/20 hover:bg-blue-50 transition duration-300 transform hover:scale-105">
                  Go to Dashboard
                </button>
              </Link>
              
              <Link href="#features">
                <button className="bg-transparent text-white border border-white py-3 px-8 rounded-full
                hover:bg-white hover:bg-opacity-10 transition duration-300">
                  Learn More
                </button>
              </Link>
            </div>
          </div>
          
          {/* Right column - Visual element */}
          <div className="flex-1 animate-slide-right">
            <div className="glass-card rounded-xl p-6 md:p-10 hover-scale">
              <div className="aspect-video rounded-lg overflow-hidden flex items-center justify-center">
                <div className="text-center p-8">
                  <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-white/20 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">AI-Powered Conversations</h3>
                  <p className="text-white/80">Catalisia uses advanced natural language processing to deliver human-like interactions</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Features section */}
        <div id="features" className="mt-24 text-white">
          <h2 className="text-3xl font-bold text-center mb-16">Why Choose Catalisia</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: "Smart Responses",
                description: "AI-driven responses that improve over time",
                icon: "M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23-.693L5 14.5"
              },
              {
                title: "Seamless Integration",
                description: "Easily integrate with your existing platforms",
                icon: "M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z"
              },
              {
                title: "Analytics Dashboard",
                description: "In-depth insights into chat performance",
                icon: "M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z"
              }
            ].map((feature, i) => (
              <div key={i} className="glass-card rounded-xl p-6 hover-scale">
                <div className="h-12 w-12 rounded-full bg-white/20 flex items-center justify-center mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={feature.icon} />
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                <p className="text-white/80">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
