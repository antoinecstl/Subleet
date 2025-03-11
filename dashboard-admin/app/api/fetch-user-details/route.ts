import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_ANON_KEY!);

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const clientIdParam = searchParams.get('client_id');
    if (!clientIdParam) {
      return NextResponse.json({ error: "client_id parameter is required" }, { status: 400 });
    }

    const { data: clientData, error: clientError } = await supabase
      .from('clients')
      .select('*')
      .eq('id', clientIdParam)
      .single();

    if (clientError) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 });
    }

    const { data: projectsData, error: projectsError } = await supabase
      .from('projects')
      .select('*')
      .eq('project_owner', clientData.id)
      .order('project_name', { ascending: true });

    if (projectsError) {
      return NextResponse.json({ error: 'Error fetching projects' }, { status: 500 });
    }

    return NextResponse.json({
      client: clientData,
      projects: projectsData
    });
  } catch (error) {
    console.error('Server error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
