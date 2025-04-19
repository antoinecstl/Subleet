"use client"
import { usePathname } from "next/navigation";
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { useLanguage, Language } from "../../lib/language-context";

export default function TopBar() {
  const pathname = usePathname();
  const isDashboardAdminPage = pathname.startsWith("/dashboard-admin");
  const isDashboardPage = pathname.startsWith("/dashboard");
  const isSignInPage = pathname === "/sign-in";
  const { language, setLanguage, t } = useLanguage();

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'fr' : 'en');
  };

  return (
    <header className="w-full bg-gradient-to-r from-blue-700 to-purple-700 text-white py-4 px-8 flex justify-between items-center shadow-lg">
      <Link href="/">
        <h1 className="text-2xl font-bold cursor-pointer">
          {isDashboardAdminPage ? "Admin Dashboard" : t("nav.dashboard")}
        </h1>
      </Link>
      <div className="flex items-center space-x-4">
        {/* Sélecteur de langue */}
        {!isDashboardPage && !isDashboardAdminPage && (
          <button 
            onClick={toggleLanguage}
            className="px-3 py-1 rounded-full bg-white/10 hover:bg-white/20 transition flex items-center"
          >
            <span className="mr-1 text-sm">
              {language === 'en' ? '🇬🇧' : '🇫🇷'}
            </span>
            <span>{language.toUpperCase()}</span>
          </button>
        )}
        
        {!isSignInPage && (
          <>
            <SignedOut>
              <SignInButton />
            </SignedOut>
            <SignedIn>
              <UserButton />
            </SignedIn>
          </>
        )}
      </div>
    </header>
  );
}
