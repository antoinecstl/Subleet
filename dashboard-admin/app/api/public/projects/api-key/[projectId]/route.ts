import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { currentUser } from '@clerk/nextjs/server';
import { decryptApiKey } from '@/lib/api-key-utils';

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_ANON_KEY!);

export async function GET(request: NextRequest, { params }: { params: Promise<{ projectId: string }> }) {
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
        
        const { projectId } = await params;
        
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
        
        // Get the API key information
        const { data: apiKeyData, error: apiKeyError } = await supabase
            .from('api_keys')
            .select('encrypted_key, is_displayed, created_at')
            .eq('project_id', projectId)
            .single();
            
        if (apiKeyError || !apiKeyData) {
            return NextResponse.json({ error: 'API key not found' }, { status: 404 });
        }
        
        // Check if the API key has already been displayed
        if (apiKeyData.is_displayed) {
            return NextResponse.json({
                success: false,
                message: 'API key has already been displayed and cannot be viewed again',
                alreadyDisplayed: true
            }, { status: 403 });
        }
        
        // Check that the encryption key is properly configured
        if (!process.env.API_ENCRYPTION_SECRET || process.env.API_ENCRYPTION_SECRET.length < 32) {
            console.error('API_ENCRYPTION_SECRET is not properly configured');
            return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
        }
        
        // Decrypt the API key
        let decryptedApiKey;
        try {
            decryptedApiKey = decryptApiKey(apiKeyData.encrypted_key, process.env.API_ENCRYPTION_SECRET);
        } catch (error) {
            console.error('Failed to decrypt API key:', error);
            return NextResponse.json({ error: 'Failed to decrypt API key' }, { status: 500 });
        }
        
        return NextResponse.json({
            success: true,
            api_key: decryptedApiKey,
            created_at: apiKeyData.created_at,
            warning: 'This API key will only be displayed once. Make sure to copy and store it securely.'
        });
            
    } catch (error) {
        console.error('Error retrieving API key:', error);
        return NextResponse.json({ error: 'An error occurred' }, { status: 500 });
    }
}
