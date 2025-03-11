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

  // Vérifier le rate limiting
  if (lastRequest && now - lastRequest < RATE_LIMIT_DURATION) {
    return NextResponse.json(
      { error: 'Too many requests' },
      { status: 429, headers: { 'Retry-After': '10' } }
    );
  }

  // Mettre à jour le timestamp de la dernière requête
  rateLimit.set(ip, now);

  // Nettoyer les anciennes entrées toutes les 5 minutes
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

    // Modification de la requête Supabase pour gérer le cas où aucun résultat n'est trouvé
    const { data, error } = await supabase
      .from('clients')
      .select(`
        id,
        name,
        email,
        api_keys (
          key,
          created_at,
          revoked,
          total_calls
        )
      `)
      .eq('email', primaryEmail);

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }

    // Si aucun utilisateur n'est trouvé, renvoyer un tableau vide
    if (!data || data.length === 0) {
      return NextResponse.json([]);
    }

    // Transformation des données pour le premier (et normalement unique) utilisateur trouvé
    const client = data[0];
    const transformedData = client.api_keys && client.api_keys.length > 0
      ? client.api_keys.map(apiKey => ({
          id: client.id,
          name: client.name,
          email: client.email,
          key: apiKey.key,
          created_at: apiKey.created_at,
          revoked: apiKey.revoked,
          total_calls: apiKey.total_calls
        }))
      : [{
          id: client.id,
          name: client.name,
          email: client.email,
          key: null,
          created_at: null,
          revoked: false,
          total_calls: 0
        }];

    return NextResponse.json(transformedData);

  } catch (error) {
    console.error('Server error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
