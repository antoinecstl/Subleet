import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { deleteVectorStore, deleteAssistant } from '@/lib/vector-store-utils';

dotenv.config();

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_ANON_KEY!);

export async function DELETE(request: Request) {
  try {    const { project_id } = await request.json();

    if (!project_id) {
      return NextResponse.json({ error: 'Project ID is required' }, { status: 400 });
    }
    
    // Récupérer les informations du projet, notamment le slug de la fonction Edge
    const { data: projectData, error: projectError } = await supabase
      .from('projects')
      .select('edge_function_slug')
      .eq('project_id', project_id)
      .single();
      
    if (projectError) {
      console.error('Error fetching project details:', projectError);
      // Continuer même en cas d'erreur pour ne pas bloquer la suppression
    }// Récupérer l'ID du Vector Store et de l'Assistant avant de supprimer le projet
    const { data: vectorStoreData } = await supabase
      .from('vector_stores')
      .select('openai_vector_id')
      .eq('project_id', project_id)
      .single();

    const { data: assistantData } = await supabase
      .from('assistants')
      .select('openai_assistant_id')
      .eq('project_id', project_id)
      .single();

    // Supprimer le vector store si trouvé
    if (vectorStoreData && vectorStoreData.openai_vector_id) {
      try {
        await deleteVectorStore(vectorStoreData.openai_vector_id);
      } catch (error) {
        console.error('Error deleting vector store:', error);
        // Continuer malgré l'erreur pour ne pas bloquer la suppression du projet
      }
    }

    // Supprimer l'assistant si trouvé
    if (assistantData && assistantData.openai_assistant_id) {
      try {
        await deleteAssistant(assistantData.openai_assistant_id);
      } catch (error) {
        console.error('Error deleting assistant:', error);
        // Continuer malgré l'erreur pour ne pas bloquer la suppression du projet
      }
    }    // Supprimer la fonction Edge si elle existe
    if (projectData?.edge_function_slug && process.env.SUPABASE_PROJECT_REF && process.env.SUPABASE_ACCESS_TOKEN) {
      try {
        // Appel à l'API Supabase pour supprimer la fonction Edge
        const edgeFunctionEndpoint = `https://api.supabase.com/v1/projects/${process.env.SUPABASE_PROJECT_REF}/functions/${projectData.edge_function_slug}`;
        
        const edgeFunctionResponse = await fetch(edgeFunctionEndpoint, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${process.env.SUPABASE_ACCESS_TOKEN}`
          }
        });
        
        if (!edgeFunctionResponse.ok) {
          console.error(`Failed to delete Edge Function: ${edgeFunctionResponse.status}`);
        } else {
          console.log(`Edge Function ${projectData.edge_function_slug} deleted successfully`);
        }
      } catch (edgeError) {
        console.error('Error deleting Edge Function:', edgeError);
        // Continuer malgré l'erreur pour ne pas bloquer la suppression du projet
      }
    }

    // DELETE CASCADE s'occupera de supprimer les entrées dans vector_stores et assistants
    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('project_id', project_id);

    if (error) {
      throw error;
    }

    return NextResponse.json({ message: 'Projet supprimé avec succès.' });
  } catch (error) {
    console.error('Error deleting project:', error);
    return NextResponse.json({ error: 'Failed to delete project' }, { status: 500 });
  }
}
