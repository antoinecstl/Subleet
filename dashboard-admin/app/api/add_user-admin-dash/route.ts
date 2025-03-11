import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { v4 as uuidv4 } from 'uuid';

dotenv.config();

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_ANON_KEY!);

export async function POST(request: Request) {
  try {
    const { name, email } = await request.json();

    if (!name || !email) {
      return NextResponse.json({ error: 'Name and Email are required' }, { status: 400 });
    }

    const apiKey = uuidv4();

    // Insert into clients
    const { data: clientData, error: clientError } = await supabase
      .from('clients')
      .insert([{ name, email }])
      .select('id') // Ensure 'id' is returned
      .single<{ id: number }>();

    if (clientError) {
      throw clientError;
    }

    if (!clientData) {
      throw new Error('Failed to retrieve client data');
    }

    // Insert into api_keys
    const { data: apiData, error: apiError } = await supabase
      .from('api_keys')
      .insert([{ client_id: clientData.id, key: apiKey }])
      .select('key') // Ensure 'key' is returned
      .single<{ key: string }>();

    if (apiError) {
      throw apiError;
    }

    // Return the successful response with the apiKey
    return NextResponse.json({ message: 'User added successfully.', apiKey: apiData.key });

  } catch (error) {
    console.error('Error adding user:', error);
    return NextResponse.json({ error: 'Failed to add user' }, { status: 500 });
  }
}
