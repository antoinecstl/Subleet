import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createClerkClient } from '@clerk/nextjs/server';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_ANON_KEY!);
const clerkClient = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });

export async function POST(request: Request) {
  try {
    const { name, email, phone } = await request.json();

    if (!name || !email) {
      return NextResponse.json({ error: 'Name and Email are required' }, { status: 400 });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 });
    }
    
    // Check if user already exists in Clerk
    try {
      const existingUsers = await clerkClient.users.getUserList({
        emailAddress: [email],
      });
      
      if (existingUsers.data.length > 0) {
        return NextResponse.json({ error: 'A user with this email already exists' }, { status: 400 });
      }
    } catch (error) {
      console.error('Error checking for existing user:', error);
      // Continue with user creation attempt
    }
      // 1. Create user in Clerk    
      const clerkUser = await clerkClient.users.createUser({
      username: name.replace(/\s+/g, '-'),
      emailAddress: [email],
      skipPasswordRequirement: true, // Skip password requirement
      publicMetadata: {
        phone: phone || null,
        role: 'client', // Default role for clients
      }
    });
      // 2. Insert into Supabase clients table - let Supabase auto-generate the ID
    const { data: clientData, error: clientError } = await supabase
      .from('clients')
      .insert([{ 
        name,
        email,
        phone: phone || null,
        clerk_id: clerkUser.id, // Store Clerk ID as a reference but don't use it as primary key
      }])
      .select()
      .single();   
      
      if (clientError) {
      // If Supabase insert fails, clean up by deleting the Clerk user
      await clerkClient.users.deleteUser(clerkUser.id);
      throw clientError;
    }
    
    // Return the successful response
    return NextResponse.json({ 
      message: 'User added successfully.', 
      client: clientData 
    });

  } catch (error: any) {
    console.error('Error adding user:', error);

     // Log detailed error information
    if (error.errors) {
      console.error('Detailed error information:', JSON.stringify(error.errors, null, 2));
    }

    // Handle specific Clerk API errors
    if (error.clerkError) {
      // This is a Clerk API error
      const statusCode = error.status || 500;
      const errorMessage = error.errors?.[0]?.message || 'Authentication service error';
      
      return NextResponse.json({ 
        error: `Authentication error: ${errorMessage}` 
      }, { status: statusCode });
    }
    
    // Handle potential Supabase constraint errors (like duplicate entries)
    if (error.code === '23505') {
      return NextResponse.json({ 
        error: 'A user with this information already exists in the database' 
      }, { status: 409 });
    }

    // Generic error response
    return NextResponse.json({ 
      error: 'Failed to add user', 
      details: error.message 
    }, { status: 500 });
  }
}
