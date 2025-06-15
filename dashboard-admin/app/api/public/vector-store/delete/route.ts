import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { removeFileFromVectorStore } from '../../../../../lib/vector-store-utils';
import { currentUser } from '@clerk/nextjs/server';
import { auth } from '@clerk/nextjs/server';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_ANON_KEY!);

export async function DELETE(request: Request) {
  try {
    // Vérifier l'authentification
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('project_id');
    const fileId = searchParams.get('file_id');

    if (!projectId || !fileId) {
      return NextResponse.json({ error: 'Project ID and file ID are required' }, { status: 400 });
    }

    // Obtenir l'utilisateur actuel
    const user = await currentUser();
    if (!user || !user.emailAddresses || user.emailAddresses.length === 0) {
      return NextResponse.json({ error: 'User email not found' }, { status: 400 });
    }

    const primaryEmail = user.emailAddresses[0].emailAddress;

    // Vérifier que l'utilisateur est bien le propriétaire du projet
    const { data: clientData, error: clientError } = await supabase
      .from('clients')
      .select('id')
      .eq('email', primaryEmail)
      .single();

    if (clientError) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 });
    }

    // Vérifier que le projet appartient bien à cet utilisateur
    const { data: projectData, error: projectError } = await supabase
      .from('projects')
      .select('project_owner')
      .eq('project_id', projectId)
      .single();

    if (projectError) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    // Vérifier la propriété du projet
    if (projectData.project_owner !== clientData.id) {
      return NextResponse.json({ error: 'Unauthorized access to project' }, { status: 403 });
    }

    // Récupérer l'ID du Vector Store associé au projet
    const { data: vectorStoreData, error: vectorStoreError } = await supabase
      .from('vector_stores')
      .select('openai_vector_id')
      .eq('project_id', projectId)
      .single();

    if (vectorStoreError) {
      return NextResponse.json({ error: 'Vector Store not found for this project' }, { status: 404 });
    }

    // Supprimer le fichier du Vector Store
    await removeFileFromVectorStore(vectorStoreData.openai_vector_id, fileId);

    return NextResponse.json({ 
      message: 'File removed successfully from Vector Store'
    });
  } catch (error) {
    console.error('Error removing file:', error);
    return NextResponse.json({ error: 'Failed to remove file' }, { status: 500 });
  }
}
