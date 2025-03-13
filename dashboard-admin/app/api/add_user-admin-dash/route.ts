import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_ANON_KEY!);

export async function POST(request: Request) {
  try {
    const { name, email, phone, project_list } = await request.json();

    if (!name || !email) {
      return NextResponse.json({ error: 'Name and Email are required' }, { status: 400 });
    }

    // Insert into clients
    const { data: clientData, error: clientError } = await supabase
      .from('clients')
      .insert([{ 
        name,
        email,
        phone: phone || null,
        project_list: project_list || null
      }])
      .select()
      .single();

    if (clientError) {
      throw clientError;
    }

    // Return the successful response
    return NextResponse.json({ 
      message: 'User added successfully.', 
      client: clientData 
    });

  } catch (error) {
    console.error('Error adding user:', error);
    return NextResponse.json({ error: 'Failed to add user' }, { status: 500 });
  }
}
