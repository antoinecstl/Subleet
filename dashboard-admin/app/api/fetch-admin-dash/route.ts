import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_ANON_KEY!);

export async function GET() {
  try {
    // First fetch all clients
    const { data: clients, error: clientsError } = await supabase
      .from('clients')
      .select('*')
      .order('creation_date', { ascending: false });

    if (clientsError) {
      throw clientsError;
    }

    // Then fetch all projects
    const { data: projects, error: projectsError } = await supabase
      .from('projects')
      .select('*');

    if (projectsError) {
      throw projectsError;
    }

    // Map projects to clients
    const clientsWithProjects = clients.map(client => {
      const clientProjects = projects.filter(project => project.project_owner === client.id);
      const totalCalls = clientProjects.reduce((sum, project) => sum + project.total_call, 0);
      
      return {
        ...client,
        projects: clientProjects,
        project_count: clientProjects.length,
        total_calls: totalCalls
      };
    });

    return NextResponse.json(clientsWithProjects);

  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

