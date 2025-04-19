import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { createVectorStore } from '../../../../../lib/vector-store-utils';

dotenv.config();

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_ANON_KEY!);

export async function POST(request: Request) {
  try {
    const { project_name, project_owner, context } = await request.json();

    if (!project_name || !project_owner) {
      return NextResponse.json({ error: 'Project name and owner are required' }, { status: 400 });
    }

    // Créer un Vector Store pour le projet
    let vectorStoreId;
    try {
      vectorStoreId = await createVectorStore(project_name);
    } catch (error) {
      console.error('Failed to create vector store:', error);
      return NextResponse.json({ error: 'Failed to create vector store' }, { status: 500 });
    }

    // Insert into projects
    const { data: projectData, error: projectError } = await supabase
      .from('projects')
      .insert([{ 
        project_name, 
        project_owner, 
        context: context || null,
        working: true // Default to active
      }])
      .select()
      .single();

    if (projectError) {
      // Si une erreur se produit, essayer de supprimer le vector store
      // (mais ne pas interrompre la fonction si cela échoue)
      try {
        // Code pour supprimer le vector store sera implémenté plus tard
      } catch (cleanupError) {
        console.error('Failed to clean up vector store after project creation failure:', cleanupError);
      }
      throw projectError;
    }

    // Enregistrer l'ID du Vector Store dans la table vector_stores
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

    // Return the successful response
    return NextResponse.json({ 
      message: 'Project created successfully.', 
      project: projectData,
      vector_store_id: vectorStoreId
    });

  } catch (error) {
    console.error('Error creating project:', error);
    return NextResponse.json({ error: 'Failed to create project' }, { status: 500 });
  }
}
