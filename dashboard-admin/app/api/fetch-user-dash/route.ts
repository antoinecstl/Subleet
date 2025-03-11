import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { currentUser } from '@clerk/nextjs/server';
import { auth } from '@clerk/nextjs/server';
import dotenv from 'dotenv';
import { headers } from 'next/headers';

dotenv.config();

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_ANON_KEY!);

// Rate limiting map
const rateLimit = new Map<string, number>();
const RATE_LIMIT_DURATION = 10000; 

export async function GET() {
  const headersList = await headers();
  const ip = headersList.get('x-forwarded-for') || 'unknown';
  const now = Date.now();
  const lastRequest = rateLimit.get(ip);

  // Check rate limiting
  if (lastRequest && now - lastRequest < RATE_LIMIT_DURATION) {
    return NextResponse.json(
      { error: 'Too many requests' },
      { status: 429, headers: { 'Retry-After': '10' } }
    );
  }

  // Update last request timestamp
  rateLimit.set(ip, now);

  // Clean old entries every 5 minutes
  if (now % 300000 < RATE_LIMIT_DURATION) {
    for (const [key, timestamp] of rateLimit.entries()) {
      if (now - timestamp > 300000) {
        rateLimit.delete(key);
      }
    }
  }

  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await currentUser();
    if (!user || !user.emailAddresses || user.emailAddresses.length === 0) {
      return NextResponse.json({ error: 'User email not found' }, { status: 400 });
    }

    const primaryEmail = user.emailAddresses[0].emailAddress;

    // Find client by email
    const { data: clientData, error: clientError } = await supabase
      .from('clients')
      .select('*')
      .eq('email', primaryEmail)
      .single();

    if (clientError) {
      console.error('Client error:', clientError);
      return NextResponse.json({ error: 'Client not found' }, { status: 404 });
    }

    // Find projects associated with this client
    const { data: projectsData, error: projectsError } = await supabase
      .from('projects')
      .select('*')
      .eq('project_owner', clientData.id)
      .order('project_name', { ascending: true });

    if (projectsError) {
      console.error('Projects error:', projectsError);
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
