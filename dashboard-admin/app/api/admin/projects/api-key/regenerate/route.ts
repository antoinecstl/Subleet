import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { currentUser } from '@clerk/nextjs/server';
import { auth } from '@clerk/nextjs/server';
import { generateApiKey, encryptApiKey } from '@/lib/api-key-utils';
import { deployEdgeFunction } from '@/lib/edge-functions/deploy-utils';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_ANON_KEY!);

export async function POST(request: NextRequest) {
    try {
        // Vérifier l'authentification
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const user = await currentUser();
        if (!user || !user.emailAddresses || user.emailAddresses.length === 0) {
            return NextResponse.json({ error: 'User email not found' }, { status: 400 });
        }
        const primaryEmail = user.emailAddresses[0].emailAddress;
        
        // Vérifier les privilèges admin
        if (!process.env.ADMIN_EMAILS?.split(',').includes(primaryEmail)) {
            return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
        }
        
        // Récupérer les données de la requête
        const { projectId } = await request.json();
        
        if (!projectId) {
            return NextResponse.json({ error: 'Project ID is required' }, { status: 400 });
        }
        
        // Récupérer les données du projet (sans vérifier le propriétaire pour l'admin)
        const { data: projectData, error: projectError } = await supabase
            .from('projects')
            .select('project_id, project_name, project_url, edge_function_slug, working')
            .eq('project_id', projectId)
            .single();
            
        if (projectError || !projectData) {
            return NextResponse.json({ error: 'Project not found' }, { status: 404 });
        }

        // Vérifier que la configuration de chiffrement est correcte
        if (!process.env.API_ENCRYPTION_SECRET || process.env.API_ENCRYPTION_SECRET.length < 32) {
            console.error('API_ENCRYPTION_SECRET is not properly configured');
            return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
        }

        // Vérifier que la configuration Supabase est disponible
        if (!process.env.SUPABASE_PROJECT_REF) {
            return NextResponse.json({ error: 'SUPABASE_PROJECT_REF environment variable is not set' }, { status: 500 });
        }

        // Générer une nouvelle clé API
        const newApiKey = generateApiKey();
        
        // Chiffrer la nouvelle clé API
        const encryptedApiKey = encryptApiKey(newApiKey, process.env.API_ENCRYPTION_SECRET);

        // Récupérer les IDs nécessaires pour redéployer l'Edge Function
        const { data: vectorStoreData } = await supabase
            .from('vector_stores')
            .select('openai_vector_id')
            .eq('project_id', projectId)
            .single();

        const { data: assistantData } = await supabase
            .from('assistants')
            .select('openai_assistant_id')
            .eq('project_id', projectId)
            .single();

        // Redéployer l'Edge Function avec la nouvelle clé API
        let edgeFunctionError = null;
        try {
            await deployEdgeFunction(
                process.env.SUPABASE_PROJECT_REF!,
                projectData.edge_function_slug,
                projectData.project_url,
                projectData.working, // Utiliser l'état actuel du projet
                projectData.project_name,
                vectorStoreData?.openai_vector_id,
                assistantData?.openai_assistant_id,
                newApiKey // Nouvelle clé API
            );
        } catch (error) {
            console.error('Failed to redeploy Edge Function with new API key:', error);
            edgeFunctionError = error;
            // Ne pas bloquer la régénération si le déploiement échoue
        }

        // Mettre à jour la clé API dans la base de données
        const { error: updateError } = await supabase
            .from('api_keys')
            .update({
                encrypted_key: encryptedApiKey,
                created_at: new Date().toISOString(),
                is_displayed: false // Remettre à false pour permettre l'affichage
            })
            .eq('project_id', projectId);
        
        if (updateError) {
            console.error('Error updating API key:', updateError);
            return NextResponse.json({ error: 'Failed to update API key in database' }, { status: 500 });
        }

        return NextResponse.json({
            success: true,
            message: 'API key regenerated successfully.',
            api_key: newApiKey, // Retourner la clé non-chiffrée pour affichage immédiat
            edge_function_updated: !edgeFunctionError,
            edge_function_error: edgeFunctionError ? String(edgeFunctionError) : null,
            warning: 'This API key will only be displayed once. Make sure to copy and store it securely.'
        });
            
    } catch (error) {
        console.error('API key regeneration error:', error);
        return NextResponse.json({ error: 'An error occurred while regenerating the API key' }, { status: 500 });
    }
}
