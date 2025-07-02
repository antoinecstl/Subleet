import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { currentUser } from '@clerk/nextjs/server';

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_ANON_KEY!);

export async function POST(request: NextRequest) {
    try {
        const user = await currentUser();
        if (!user || !user.emailAddresses || user.emailAddresses.length === 0) {
            return NextResponse.json({ error: 'User email not found' }, { status: 400 });
        }
        const primaryEmail = user.emailAddresses[0].emailAddress;
        
        // Find the client by email
        const { data: clientData, error: clientError } = await supabase
            .from('clients')
            .select('id')
            .eq('email', primaryEmail)
            .single();
            
        if (clientError || !clientData) {
            return NextResponse.json({ error: 'Client not found' }, { status: 404 });
        }
        
        const { projectId } = await request.json();
        
        if (!projectId) {
            return NextResponse.json({ error: 'Project ID is required' }, { status: 400 });
        }
        
        // Verify that the project belongs to the current user
        const { data: projectData, error: projectError } = await supabase
            .from('projects')
            .select('project_id')
            .eq('project_id', projectId)
            .eq('project_owner', clientData.id)
            .single();
            
        if (projectError || !projectData) {
            return NextResponse.json({ error: 'Project not found or unauthorized' }, { status: 404 });
        }
        
        // Mark the API key as displayed
        const { error: updateError } = await supabase
            .from('api_keys')
            .update({ is_displayed: true })
            .eq('project_id', projectId);
            
        if (updateError) {
            console.error('Error marking API key as displayed:', updateError);
            return NextResponse.json({ error: 'Failed to update API key status' }, { status: 500 });
        }
        
        return NextResponse.json({
            success: true,
            message: 'API key marked as displayed'
        });
            
    } catch (error) {
        console.error('Error marking API key as displayed:', error);
        return NextResponse.json({ error: 'An error occurred' }, { status: 500 });
    }
}
