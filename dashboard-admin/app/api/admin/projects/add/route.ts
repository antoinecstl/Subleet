import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { createVectorStore, createAssistant, SUPPORTED_MODELS } from '@/lib/vector-store-utils';
import { deployEdgeFunction } from '@/lib/edge-functions/deploy-utils';
import { generateApiKey, encryptApiKey } from '@/lib/api-key-utils';

dotenv.config();

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_ANON_KEY!);

export async function POST(request: Request) {
  try {
    const { project_name, project_owner, model, project_url } = await request.json();

    if (!project_name || !project_owner || !project_url) {
      return NextResponse.json({ error: 'Project name, owner, and URL are required' }, { status: 400 });
    }
    
    // Vérifier si l'identifiant du projet Supabase est disponible dans les variables d'environnement
    if (!process.env.SUPABASE_PROJECT_REF) {
      return NextResponse.json({ error: 'SUPABASE_PROJECT_REF environment variable is not set' }, { status: 500 });
    }

    // Vérifier si le modèle est supporté
    if (model && !SUPPORTED_MODELS.includes(model)) {
      return NextResponse.json({ 
        error: `Le modèle ${model} n'est pas supporté. Modèles disponibles: ${SUPPORTED_MODELS.join(', ')}` 
      }, { status: 400 });
    }

    // Créer un Vector Store pour le projet
    let vectorStoreId;
    try {
      vectorStoreId = await createVectorStore(project_name);
    } catch (error) {
      console.error('Failed to create vector store:', error);
      return NextResponse.json({ error: 'Failed to create vector store' }, { status: 500 });
    }

    // Créer un Assistant pour le projet
    let assistantData;
    try {
      assistantData = await createAssistant(project_name, vectorStoreId, model || 'gpt-4.1-nano');
    } catch (error) {
      console.error('Failed to create assistant:', error);
      return NextResponse.json({ error: 'Failed to create Assistant' }, { status: 500 });
    }    // Générer un slug unique avec timestamp
    const timestamp = Date.now().toString(36);
    const uniqueId = Math.random().toString(36).substring(2, 8);
    const edgeFunctionSlug = `Subleet-${project_name.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${timestamp}-${uniqueId}`;
    
    // Générer une clé API unique pour ce projet
    const apiKey = generateApiKey();
    
    // Vérifier que la clé de chiffrement est configurée
    if (!process.env.API_ENCRYPTION_SECRET || process.env.API_ENCRYPTION_SECRET.length < 32) {
      console.error('API_ENCRYPTION_SECRET is not properly configured');
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }
    
    // Encrypter la clé API pour stockage sécurisé
    const encryptedApiKey = encryptApiKey(apiKey, process.env.API_ENCRYPTION_SECRET);
    
    // Insert into projects
    const { data: projectData, error: projectError } = await supabase
      .from('projects')
      .insert([{ 
        project_name, 
        project_owner, 
        project_url, // Ajout de l'URL du projet
        working: true, // Default to active
        edge_function_slug: edgeFunctionSlug // Slug unique avec identifiant
      }])
      .select()
      .single();
      if (projectError) {
      // Si une erreur se produit, essayer de supprimer le vector store et l'assistant
      try {
        // Code pour supprimer le vector store sera implémenté plus tard
        // Note: Si besoin, ajouter ici la logique pour supprimer la fonction Edge déployée
      } catch (cleanupError) {
        console.error('Failed to clean up resources after project creation failure:', cleanupError);
      }
      throw projectError;
    }    // Enregistrer l'ID du Vector Store dans la table vector_stores
    const { error: vectorStoreError } = await supabase
      .from('vector_stores')
      .insert([{
        project_id: projectData.project_id,
        openai_vector_id: vectorStoreId,
        name: project_name
      }]);

    if (vectorStoreError) {
      console.error('Error saving vector store information:', vectorStoreError);
      // Continuer malgré l'erreur, car le projet a été créé avec succès
    }
    
    // Enregistrer la clé API encryptée dans la table api_keys
    const { error: apiKeyError } = await supabase
      .from('api_keys')
      .insert([{
        project_id: projectData.project_id,
        encrypted_key: encryptedApiKey,
        created_at: new Date().toISOString()
      }]);
    
    if (apiKeyError) {
      console.error('Error saving API key:', apiKeyError);
      // Ne pas bloquer la création du projet en cas d'erreur
    }// Enregistrer l'ID de l'Assistant dans la table assistants si l'assistant a été créé
    if (assistantData) {
      const { error: assistantError } = await supabase
        .from('assistants')
        .insert([{
          project_id: projectData.project_id,
          openai_assistant_id: assistantData.id,
          name: project_name,
          model: assistantData.model,
          created_at: assistantData.created_at
        }]);

      if (assistantError) {
        console.error('Error saving assistant information:', assistantError);
        // Continuer malgré l'erreur, car le projet et le vector store ont été créés avec succès
      }
    }    // Déployer la fonction Edge sur Supabase
    let edgeFunctionData;
    let edgeFunctionError;
    try {      // Utilise le slug déjà stocké dans projectData
      const functionName = projectData.edge_function_slug;      
      
      edgeFunctionData = await deployEdgeFunction(
        process.env.SUPABASE_PROJECT_REF!, 
        functionName,
        project_url,               // Passer l'URL du projet pour les CORS
        true,                     // Active par défaut
        project_name,             // Nom du projet
        vectorStoreId,            // ID du Vector Store à hardcoder
        assistantData?.id,        // ID de l'Assistant à hardcoder (undefined si n'existe pas)
        apiKey                    // Clé API à hardcoder dans la fonction
      );
      
        } catch (error) {
      console.error('Failed to deploy Edge Function:', error);
      edgeFunctionError = error;
    }

    // Return the successful response
    return NextResponse.json({ 
      message: 'Project created successfully.', 
      project: projectData,
      vector_store_id: vectorStoreId,
      assistant_id: assistantData?.id || null,
      edge_function: edgeFunctionData || null,
      edge_function_error: edgeFunctionError ? String(edgeFunctionError) : null
    });

  } catch (error) {
    console.error('Error creating project:', error);
    return NextResponse.json({ error: 'Failed to create project' }, { status: 500 });
  }
}
