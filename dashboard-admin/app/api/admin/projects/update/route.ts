import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { deployEdgeFunction } from '@/lib/edge-functions/deploy-utils';

dotenv.config();

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_ANON_KEY!);

export async function PUT(request: Request) {
  try {
    const { project_id, working } = await request.json();

    if (project_id === undefined) {
      return NextResponse.json({ error: 'Project ID is required' }, { status: 400 });
    }

    // Check if working is provided
    if (working === undefined) {
      return NextResponse.json({ error: 'Working status must be provided' }, { status: 400 });
    }

    // Récupérer les informations du projet avant modification pour obtenir l'URL et le nom
    const { data: currentProject, error: fetchError } = await supabase
      .from('projects')
      .select('*')
      .eq('project_id', project_id)
      .single();
      
    if (fetchError) {
      return NextResponse.json({ error: 'Failed to fetch project details' }, { status: 404 });
    }

    // Prepare update object based on what was provided
    const updateData: { working?: boolean } = {};
    if (working !== undefined) updateData.working = working;

    // Update project in database
    const { data: updatedProject, error: updateError } = await supabase
      .from('projects')
      .update(updateData)
      .eq('project_id', project_id)
      .select()
      .single();

    if (updateError) {
      throw updateError;
    }

    // Si le statut d'activation a changé, redéployer la fonction Edge
    if (working !== undefined && process.env.SUPABASE_PROJECT_REF) {
      try {
        // Déployer la fonction Edge avec le statut approprié
        await deployEdgeFunction(
          process.env.SUPABASE_PROJECT_REF,
          currentProject.edge_function_slug,
          currentProject.project_url,
          working, // Actif ou inactif
          currentProject.project_name
        );
        
        console.log(`Edge Function redeployed with status: ${working ? 'active' : 'disabled'}`);
      } catch (edgeError) {
        console.error('Error redeploying Edge Function:', edgeError);
        // On ne fait pas échouer la requête en cas d'erreur de déploiement Edge
      }
    }

    // Return the successful response
    return NextResponse.json({ 
      message: 'Project updated successfully.', 
      project: updatedProject 
    });

  } catch (error) {
    console.error('Error updating project:', error);
    return NextResponse.json({ error: 'Failed to update project' }, { status: 500 });
  }
}
