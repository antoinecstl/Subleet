import { auth } from '@clerk/nextjs/server';

// Vérification d'authentification uniquement
export async function requireAuth() {
  try {
    const { userId } = await auth();
    
    // Vérifier si l'utilisateur est authentifié
    if (!userId) {
      return {
        success: false,
        error: 'Authentication required',
        status: 401
      };
    }
    
    return { success: true, userId };
  } catch (error) {
    console.error('Error checking authentication:', error);
    return {
      success: false,
      error: 'Failed to verify authentication',
      status: 500
    };
  }
}

// Vérification du plan Classic
export async function checkClassicPlan() {
  try {
    const { has, userId } = await auth();
    
    // Vérifier si l'utilisateur est authentifié
    if (!userId) {
      return {
        success: false,
        error: 'Authentication required',
        status: 401
      };
    }
    
    // Vérifier si l'utilisateur a le plan "classic"
    const hasClassicPlan = await has({ plan: 'classic' });
    
    return { 
      success: true,
      hasClassicPlan,
      userId
    };
  } catch (error) {
    console.error('Error checking subscription plan:', error);
    return {
      success: false,
      error: 'Failed to verify subscription',
      status: 500
    };
  }
}
