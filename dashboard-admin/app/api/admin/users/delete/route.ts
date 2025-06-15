import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createClerkClient } from '@clerk/nextjs/server';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_ANON_KEY!);
const clerkClient = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });

export async function DELETE(request: Request) {  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }
    
    // 1. Find the user in Supabase first to get the clerk_id
    const { data: clientData, error: findError } = await supabase
      .from('clients')
      .select('clerk_id')
      .eq('email', email)
      .single();
    
    if (findError || !clientData) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 });
    }
    
    const clerkId = clientData.clerk_id;
    
    // 2. Delete from Clerk if clerk_id exists
    if (clerkId) {
      try {
        await clerkClient.users.deleteUser(clerkId);
      } catch (clerkError: any) {
        // If the user doesn't exist in Clerk, we should still delete from Supabase
        // But for other errors, we should fail the request
        console.error('Error deleting user from Clerk:', clerkError);
        
        if (clerkError.status !== 404) {
          return NextResponse.json({ 
            error: `Failed to delete from authentication system: ${clerkError.message}` 
          }, { status: 500 });
        }
      }
    }    // 3. Now delete from Supabase
    const { error: deleteError } = await supabase
      .from('clients')
      .delete()
      .eq('email', email);

    if (deleteError) {
      // This is problematic - the user has been deleted from Clerk but not from Supabase
      console.error('Failed to delete client from database after removing from Clerk:', deleteError);
      return NextResponse.json({ 
        error: 'User deleted from authentication system but database cleanup failed',
        details: deleteError.message
      }, { status: 500 });
    }

    // Successfully deleted from both systems
    return NextResponse.json({ message: 'Client supprimé avec succès.' });
  } catch (error) {
    console.error('Error deleting client:', error);
    return NextResponse.json({ error: 'Failed to delete client' }, { status: 500 });
  }
}
