import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

const isPublicRoute = createRouteMatcher(['/sign-in(.*)', '/sign-up(.*)', '/', '/pricing', '/information'])

// Update the admin route matcher to include API routes
const isAdminRoute = createRouteMatcher([
  '/dashboard-admin(.*)',
  '/api/admin/(.*)' // This pattern matches all admin API routes
])

interface SessionClaims {
  metadata?: {
    role?: string;
  };
}

export default clerkMiddleware(async (auth, request) => {
    const authObject = await auth() as { userId?: string; sessionClaims?: SessionClaims };
    
    // Handle admin route access (both UI and API)
    if (isAdminRoute(request)) {
        if (!authObject.userId || authObject.sessionClaims?.metadata?.role !== 'admin') {
            // For API routes, return 403 Forbidden instead of redirect
            if (request.url.includes('/api/admin/')) {
                return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
            }
            // For UI routes, redirect to home page
            const url = new URL('/', request.url)
            return NextResponse.redirect(url)
        }
    }
    
    // Protect non-public routes
    if (!isPublicRoute(request)) {
        await auth.protect()
    }
})

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
}