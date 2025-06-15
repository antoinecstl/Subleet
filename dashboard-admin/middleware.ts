import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

const isPublicRoute = createRouteMatcher(['/sign-in(.*)', '/sign-up(.*)', '/', '/pricing', '/about', '/api/webhooks(.*)'])

// Routes requérant différents niveaux d'accès
const isAdminRoute = createRouteMatcher([
  '/dashboard-admin(.*)',
  '/api/admin/(.*)' // This pattern matches all admin API routes
])

// Routes nécessitant un plan Classic pour toutes les fonctionnalités de projet
const requiresClassicPlan = createRouteMatcher([
  '/dashboard/project(.*)',  // Toutes les pages de projet client
  '/api/public/(.*)'         // Toutes les API publiques (projets, vector-store, assistants, etc.)
])

interface SessionClaims {
  metadata?: {
    role?: string;
    plan?: string;
  };
}

interface AuthObject {
  userId: string | null;
  sessionClaims?: SessionClaims;
  has?: (args: any) => Promise<boolean>;
}

export default clerkMiddleware(async (authMiddleware, request) => {
    // Obtenir les informations d'authentification
    const authObject = await authMiddleware() as unknown as AuthObject;
    
    // Étape 1: Protéger les routes non publiques (authentification de base)
    if (!isPublicRoute(request)) {
        // Si l'utilisateur n'est pas connecté, rediriger vers la page de connexion
        if (!authObject.userId) {
            const url = new URL('/sign-in', request.url);
            return NextResponse.redirect(url);
        }
    }
    
    // Étape 2: Vérifier les droits administrateur
    if (isAdminRoute(request)) {
        if (!authObject.userId || authObject.sessionClaims?.metadata?.role !== 'admin') {
            // Pour les routes API, renvoyer 403 Forbidden
            if (request.url.includes('/api/admin/')) {
                return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
            }
            // Pour les routes UI, rediriger vers la page d'accueil
            const url = new URL('/', request.url);
            return NextResponse.redirect(url);
        }
    }
      // Étape 3: Vérifier les restrictions basées sur le plan d'abonnement
    if (requiresClassicPlan(request)) {
        // Vérifier si l'utilisateur a le plan Classic en utilisant l'objet d'auth du middleware
        const hasClassicPlan = authObject.has ? await authObject.has({ plan: 'classic' }) : false;
        
        if (!hasClassicPlan) {
            // Pour les routes API, renvoyer 403 Forbidden
            if (request.url.includes('/api/')) {
                return NextResponse.json({ 
                    error: 'Classic plan required', 
                    needsSubscription: true 
                }, { status: 403 });
            }
            // Pour les routes UI, rediriger vers la page de tarification
            const url = new URL('/pricing', request.url);
            return NextResponse.redirect(url);
        }
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