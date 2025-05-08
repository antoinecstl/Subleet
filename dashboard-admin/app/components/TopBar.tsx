"use client"
import { usePathname } from "next/navigation";
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { useLanguage } from "../../lib/language-context";
import { useState, useEffect } from "react";

export default function TopBar() {
  const pathname = usePathname();
  const isSignInPage = pathname === "/sign-in";
  const { t } = useLanguage();
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") as "light" | "dark" | null;
    if (savedTheme) {
      setTheme(savedTheme);
      document.body.classList.toggle("light-theme", savedTheme === "light");
    } else {
      setTheme("light");
      document.body.classList.add("light-theme");
      localStorage.setItem("theme", "light");
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    document.body.classList.toggle("light-theme", newTheme === "light");
    localStorage.setItem("theme", newTheme);
  };

  const isActive = (path: string) => {
    if (path === '/' && pathname === '/') return true;
    if (path !== '/' && pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <header
      className={`w-full backdrop-blur-md ${
        theme === "light"
          ? "bg-white/70 text-gray-800"
          : "bg-black/30 text-white"
      } py-4 px-8 flex justify-between items-center shadow-lg sticky top-0 z-50 border-b ${
        theme === "light" ? "border-gray-200" : "border-white/10"
      }`}
    >
      <div className="flex items-center h-full">
        <Link href="/" className="group flex items-center">
          <h1 className="text-2xl font-bold cursor-pointer flex items-center my-0">
        <span
          className={`text-transparent bg-clip-text bg-gradient-to-r ${
            theme === "light"
          ? "from-indigo-600 via-purple-600 to-pink-600"
          : "from-indigo-400 via-purple-400 to-pink-400"
          }`}
        >
          Catalysia
        </span>
          </h1>
        </Link>
        
        {/* Navigation links */}
        <nav className="hidden md:flex items-center ml-8 space-x-6">
          <SignedIn>
            <Link 
              href="/dashboard"
              className={`nav-link ${isActive('/dashboard') ? 'font-medium text-primary' : 'text-muted'} transition-colors duration-200 hover:text-primary`}
            >
              Dashboard
            </Link>
          </SignedIn>
          <Link 
            href="/information" 
            className={`nav-link ${isActive('/information') ? 'font-medium text-primary' : 'text-muted'} transition-colors duration-200 hover:text-primary`}
          >
            About
          </Link>
          <Link 
            href="/pricing"
            className={`nav-link ${isActive('/pricing') ? 'font-medium text-primary' : 'text-muted'} transition-colors duration-200 hover:text-primary`}
          >
            Pricing
          </Link>
        </nav>
      </div>
      <div className="flex items-center space-x-4">
        {/* Theme toggle */}
        <div
          className="theme-toggle"
          onClick={toggleTheme}
          role="button"
          tabIndex={0}
          aria-label="Toggle theme"
        >
          <div className="theme-toggle-circle">
            {theme === "light" ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="theme-toggle-icon"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="theme-toggle-icon"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z"
                  clipRule="evenodd"
                />
              </svg>
            )}
          </div>
        </div>

        {!isSignInPage && (
          <>
            <SignedOut>
              <SignInButton>
                <button className="btn-gradient px-5 py-1">Sign In</button>
              </SignInButton>
            </SignedOut>
            <SignedIn>
              <UserButton
                appearance={{
                  elements: {
                    userButtonAvatarBox: `border-2 ${
                      theme === "light"
                        ? "border-indigo-300 hover:border-indigo-500"
                        : "border-indigo-500/30 hover:border-indigo-400"
                    } transition-colors duration-300`,
                  },
                }}
              />
            </SignedIn>
          </>
        )}
      </div>
    </header>
  );
}
