import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { currentUser } from '@clerk/nextjs/server';
import { auth } from '@clerk/nextjs/server';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_ANON_KEY!);

export async function GET() {
  try {
    // Vérifier l'authentification
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await currentUser();
    if (!user || !user.emailAddresses || user.emailAddresses.length === 0) {
      return NextResponse.json({ error: 'User email not found' }, { status: 400 });
    }    const primaryEmail = user.emailAddresses[0].emailAddress;

    // Find client by email - on ne récupère que l'id nécessaire pour la relation
    const { data: clientData, error: clientError } = await supabase
      .from('clients')
      .select('id')
      .eq('email', primaryEmail)
      .single();

    if (clientError) {
      console.error('Client error:', clientError);
      return NextResponse.json({ error: 'Client not found' }, { status: 404 });
    }
    
    // Find projects associated with this client - récupération seulement des champs utilisés dans le dashboard
    const { data: projectsData, error: projectsError } = await supabase
      .from('projects')
      .select('project_id, project_name, working, creation_timestamp')
      .eq('project_owner', clientData.id)
      .order('project_name', { ascending: true });

    if (projectsError) {
      console.error('Projects error:', projectsError);
      return NextResponse.json({ error: 'Error fetching projects' }, { status: 500 });
    }    return NextResponse.json({
      client: { id: clientData.id }, // On ne retourne que l'id du client (suffisant pour les besoins)
      projects: projectsData,
      hasClassicPlan: true // Garanti par le middleware - tous les utilisateurs ici ont le plan Classic
    });

  } catch (error) {
    console.error('Server error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
