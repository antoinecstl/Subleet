"use client"

import { useEffect } from 'react';
import Link from 'next/link';
import { useUser } from "@clerk/nextjs";
import { clearUserCache, setCurrentUser } from '@/lib/cache-utils';

export default function Home() {
  const { user, isLoaded } = useUser();

  // Gérer la connexion/déconnexion
  useEffect(() => {
    if (isLoaded) {
      if (user) {
        // Utilisateur connecté, associer le cache à cet utilisateur
        setCurrentUser(user.id);
      } else {
        // Utilisateur déconnecté, vider le cache
        clearUserCache();
      }
    }
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
