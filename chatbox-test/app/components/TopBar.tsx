"use client";
import { useState } from "react";
import Image from "next/image";

export default function TopBar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <nav className="w-full bg-white dark:bg-gray-800 shadow p-2">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Image src="/next.svg" alt="next" width={40} height={40} />
            <span className="ml-2 text-xl font-bold text-gray-800 dark:text-white">My Shop</span>
          </div>
          
          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-4">
            <a href="#" className="text-lg font-semibold text-gray-800 dark:text-gray-100 hover:text-blue-500">Home</a>
            <a href="#" className="text-lg font-semibold text-gray-800 dark:text-gray-100 hover:text-blue-500">Shop</a>
            <a href="#" className="text-lg font-semibold text-gray-800 dark:text-gray-100 hover:text-blue-500">Contact</a>
          </div>
          
          {/* Search and Mobile Menu Button */}
          <div className="flex items-center">
            <div className="hidden md:block">
              <input
                type="text"
                placeholder="Search..."
                className="px-3 py-2 border rounded-md bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button
              onClick={toggleMobileMenu}
              className="md:hidden ml-4 text-gray-800 dark:text-gray-100 hover:text-blue-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
            >
              <svg
                className="h-6 w-6"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                {isMobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white dark:bg-gray-800">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <a href="#" className="block text-lg font-semibold text-gray-800 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md px-3 py-2">Home</a>
            <a href="#" className="block text-lg font-semibold text-gray-800 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md px-3 py-2">Shop</a>
            <a href="#" className="block text-lg font-semibold text-gray-800 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md px-3 py-2">Contact</a>
            <div className="mt-3 px-3">
              <input
                type="text"
                placeholder="Search..."
                className="w-full px-3 py-2 border rounded-md bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}