"use client"

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useUser } from "@clerk/nextjs";
import { useLanguage } from '@/lib/language-context';
import { clearCache } from '@/lib/cache-utils';

export default function Home() {
  const { user, isLoaded } = useUser();
  const { t, language } = useLanguage();
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');

  // Theme detection (identique aux autres pages)
  useEffect(() => {
    const detectTheme = () => {
      const isDarkMode = !document.body.classList.contains('light-theme');
      return isDarkMode ? 'dark' : 'light';
    };
    const updateTheme = () => setTheme(detectTheme());
    updateTheme();
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'class') updateTheme();
      });
    });
    observer.observe(document.body, { attributes: true });
    return () => observer.disconnect();
  }, []);

  // Clear cache on logout
  useEffect(() => {
    if (isLoaded && !user) clearCache();
  }, [user, isLoaded]);

  return (
    <div className="min-h-screen p-6 relative overflow-hidden flex items-center justify-center">
      {/* Decorative elements */}
      <div className="absolute top-20 left-10 w-64 h-64 rounded-full bg-primary opacity-5 blur-3xl"></div>
      <div className="absolute bottom-20 right-10 w-80 h-80 rounded-full bg-secondary opacity-5 blur-3xl"></div>
      <div className="relative z-10 content-container w-full">
        {/* Hero Section */}
        <div className="text-center max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">
              Subleet
            </span>
            <span className="block mt-2">Custom AI for your business</span>
          </h1>
          <p className="text-xl text-muted mb-8 sm:mb-16">
            Boost your business with intelligent, customizable AI assistants. Enhance customer experience, automate support, and empower your teams.
          </p>
          <div className="flex flex-col sm:flex-row w-3/4 sm:w-auto mx-auto gap-5 sm:gap-4 justify-center">
            {user ? (
              <Link href="/dashboard" className="btn-gradient px-8 py-3 text-base md:text-lg">
                Go to Dashboard
              </Link>
            ) : (
              <Link href="/sign-up" className="btn-gradient px-8 py-3 text-base md:text-lg">
                Get Started
              </Link>
            )}
            <Link href="/about" className="btn-outline px-8 py-3 text-base md:text-lg">
              Learn More
            </Link>
            <Link href="/pricing" className="btn-outline px-8 py-3 text-base md:text-lg">
              View Pricing
            </Link>
          </div>
        </div>        
      </div>
    </div>
  );
}
