"use client"

import { useEffect } from 'react';
import Link from 'next/link';
import { useUser } from "@clerk/nextjs";
import { useLanguage } from '@/lib/language-context';
import { clearCache } from '@/lib/cache-utils';

export default function Home() {
  const { user, isLoaded } = useUser();
  const { t, language } = useLanguage();

  useEffect(() => {
    // Clear cache only if authentication check is complete and user is not logged in
    if (isLoaded && !user) {
      // User is not authenticated (likely after logout), clear cache
      clearCache();
      console.log("Cache cleared after user logout");
    }
  }, [user, isLoaded]);

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-20 left-0 w-96 h-96 rounded-full bg-indigo-600 opacity-10 blur-3xl animate-float"></div>
      <div className="absolute bottom-40 right-0 w-96 h-96 rounded-full bg-purple-600 opacity-10 blur-3xl animate-float-delay-2"></div>
      <div className="absolute top-60 right-60 w-64 h-64 rounded-full bg-pink-600 opacity-10 blur-3xl animate-float-delay-4"></div>
      
      {/* Content */}
      <div className="container mx-auto px-4 py-16 relative z-10">
        <div className="flex flex-col items-center justify-center text-center max-w-3xl mx-auto mt-8">
          <div className="mb-8 relative">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 animate-fadeIn">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 animate-glow">
                Subleet
              </span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 leading-relaxed">
              Custom AI solutions tailored for your business
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full mb-12">
            {user ? (
              <>
                {/* Client Dashboard Button - Visible to all users */}
                <Link href="/dashboard" className="w-full">
                  <div className="glass-card p-8 rounded-2xl text-center h-full flex flex-col items-center justify-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center mb-4 shadow-lg shadow-indigo-500/20">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                      </svg>
                    </div>
                    <h2 className="card-header text-2xl">Dashboard</h2>
                    <p className="mb-4">Access your projects and manage your AI assistants</p>
                    <span className="btn-gradient px-6 py-2 inline-block mt-auto">
                      Access
                    </span>
                  </div>
                </Link>
                
                {/* AI Services Card */}
                <div className="glass-card p-8 rounded-2xl text-center h-full flex flex-col items-center justify-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mb-4 shadow-lg shadow-purple-500/20">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <h2 className="card-header text-2xl">AI Services</h2>
                  <p className="mb-4">Explore our customized artificial intelligence solutions</p>
                  <Link href="/information" className="btn-gradient px-6 py-2 inline-block mt-auto">
                    Learn More
                  </Link>
                </div>
              </>
            ) : (
              <>
                {/* Secure Client Space Card */}
                <div className="glass-card p-8 rounded-2xl text-center h-full">
                  <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-indigo-500/20">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <h2 className="card-header text-2xl">Secure Client Portal</h2>
                  <p className="mb-4">Access your projects and manage your AI assistants securely</p>
                  <Link href="/sign-in" className="btn-gradient px-6 py-2 inline-block">
                    Sign In
                  </Link>
                </div>
                
                {/* AI Powered Card */}
                <div className="glass-card p-8 rounded-2xl text-center h-full">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-purple-500/20">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <h2 className="card-header text-2xl">AI Powered</h2>
                  <p className="mb-4">Discover how our AI technology can transform your business</p>
                  <Link href="/information" className="btn-gradient px-6 py-2 inline-block">
                    Learn More
                  </Link>
                </div>
              </>
            )}
          </div>
          
          <div className="w-full">
            <div className="glass-card p-8 rounded-2xl">
              <div className="flex flex-col md:flex-row items-center">
                <div className="md:w-1/2 mb-6 md:mb-0 md:pr-8">
                  <h2 className="card-header text-2xl">About Our Solutions</h2>
                  <p className="mb-4">
                    Subleet allows you to integrate custom AI assistants into your web and mobile applications. Our solutions adapt to all business sectors to enhance your users' experience.
                  </p>
                  <Link href="/pricing" className="btn-gradient px-6 py-2 inline-block">
                    View Our Plans
                  </Link>
                </div>
                <div className="md:w-1/2 flex justify-center">
                  <div className="w-64 h-64 relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-xl opacity-80 blur-sm"></div>
                    <div className="absolute inset-2 backdrop-blur-xl bg-black/30 rounded-lg flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-24 w-24 text-white/80" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6zM16 7a1 1 0 10-2 0v1h-1a1 1 0 100 2h1v1a1 1 0 102 0v-1h1a1 1 0 100-2h-1V7z" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
