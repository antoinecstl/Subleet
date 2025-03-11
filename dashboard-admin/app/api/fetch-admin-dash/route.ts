import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_ANON_KEY!);

export async function GET() {
  try {
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
      .order('created_at', { foreignTable: 'api_keys' });

    if (error) {
      throw error;
    }

    // Transform the nested data structure to create an entry for each API key
    const transformedData = data.flatMap(client => {
      // If client has no API keys, return one entry with null key
      if (!client.api_keys || client.api_keys.length === 0) {
        return [{
          id: client.id,
          name: client.name,
          email: client.email,
          key: null,
          created_at: null,
          revoked: false,
          total_calls: 0
        }];
      }

      // Create an entry for each API key
      return client.api_keys.map(apiKey => ({
        id: client.id,
        name: client.name,
        email: client.email,
        key: apiKey.key,
        created_at: apiKey.created_at,
        revoked: apiKey.revoked,
        total_calls: apiKey.total_calls
      }));
    });

    return NextResponse.json(transformedData);

  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

