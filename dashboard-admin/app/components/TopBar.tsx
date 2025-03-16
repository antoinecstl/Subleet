"use client"
import { usePathname } from "next/navigation";
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import Link from "next/link";

export default function TopBar() {
  const pathname = usePathname();
  const isDashboardAdminPage = pathname.startsWith("/dashboard-admin");
  const isSignInPage = pathname === "/sign-in";

  return (
    <header className="w-full bg-gradient-to-r from-blue-700 to-purple-700 text-white py-4 px-8 flex justify-between items-center shadow-lg">
      <Link href="/">
        <h1 className="text-2xl font-bold cursor-pointer">
          {isDashboardAdminPage ? "Admin Dashboard" : "Dashboard"}
        </h1>
      </Link>
      <div>
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
