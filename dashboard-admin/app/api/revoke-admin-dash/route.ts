import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import crypto from 'crypto';

dotenv.config();

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_ANON_KEY!);

export async function POST(request: Request) {
  try {
    const { apiKey } = await request.json();

    if (!apiKey) {
      return NextResponse.json({ error: 'API Key is required' }, { status: 400 });
    }

    // Retrieve the client associated with the API key
    const { data: userData, error: userError } = await supabase
      .from('api_keys')
      .select('client_id')
      .eq('key', apiKey)
      .single();

    if (userError) {
      throw userError;
    }

    // Revoke the existing API key
    const { data, error } = await supabase
      .from('api_keys')
      .update({ revoked: true })
      .eq('key', apiKey);

    if (error) {
      throw error;
    }

    // Generate a new API key
    const newApiKey = crypto.randomBytes(16).toString('hex');
    // Insert the new API key associated with the client
    const { data: newData, error: newError } = await supabase
      .from('api_keys')
      .insert({ key: newApiKey, revoked: false, client_id: userData.client_id });

    if (newError) {
      throw newError;
    }

    return NextResponse.json({ message: 'API Key revoked successfully. New API Key generated.', newApiKey });
  } catch (error) {
    console.error('Error revoking client:', error);
    return NextResponse.json({ error: 'Failed to revoke client' }, { status: 500 });
  }
}
