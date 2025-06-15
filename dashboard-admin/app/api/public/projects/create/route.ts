import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { currentUser } from '@clerk/nextjs/server';
import { auth } from '@clerk/nextjs/server';
import dotenv from 'dotenv';
import { createVectorStore, createAssistant, SUPPORTED_MODELS } from '@/lib/vector-store-utils';
import { deployEdgeFunction } from '@/lib/edge-functions/deploy-utils';
import { generateApiKey, encryptApiKey } from '@/lib/api-key-utils';

dotenv.config();

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
            // If the client does not exist, return an error
            return NextResponse.json({ error: 'Client not found. Please contact the administrator.' }, { status: 404 });
        }
        
        // Check if the user already has a project
        const { data: existingProjects } = await supabase
            .from('projects')
            .select('project_id')
            .eq('project_owner', clientData.id);
            
        if (existingProjects && existingProjects.length >= 1) {
            return NextResponse.json({ 
                error: 'You have reached the maximum number of allowed projects',
                maxProjectsReached: true
            }, { status: 403 });
        }
        
        // Check if the Supabase project identifier is available in the environment variables
        if (!process.env.SUPABASE_PROJECT_REF) {
            return NextResponse.json({ error: 'SUPABASE_PROJECT_REF environment variable is not set' }, { status: 500 });
        }
        
        // Retrieve the project data to be created
        const projectData = await request.json();
        
        // Validate the project data
        if (!projectData.name) {
            return NextResponse.json({ error: 'Project name is required' }, { status: 400 });
        }
        
        if (!projectData.url) {
            return NextResponse.json({ error: 'Project URL is required' }, { status: 400 });
        }

        // Check if the model is supported (use the default model if not specified)
        const model = 'gpt-4.1-nano';
        if (!SUPPORTED_MODELS.includes(model)) {
            return NextResponse.json({ 
                error: `The model ${model} is not supported.` 
            }, { status: 400 });
        }

        // Create a Vector Store for the project
        let vectorStoreId;
        try {
            vectorStoreId = await createVectorStore(projectData.name);
        } catch (error) {
            console.error('Failed to create vector store:', error);
            return NextResponse.json({ error: 'Failed to create vector store' }, { status: 500 });
        }

        // Create an Assistant for the project
        let assistantData;
        try {
            assistantData = await createAssistant(projectData.name, vectorStoreId, model);
        } catch (error) {
            console.error('Failed to create assistant:', error);
            return NextResponse.json({ error: 'Failed to create Assistant' }, { status: 500 });
        }

        // Generate a unique slug with timestamp
        const timestamp = Date.now().toString(36);
        const uniqueId = Math.random().toString(36).substring(2, 8);
        const edgeFunctionSlug = `Subleet-${projectData.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${timestamp}-${uniqueId}`;
        
        // Generate a unique API key for this project
        const apiKey = generateApiKey();
        
        // Check that the encryption key is properly configured
        if (!process.env.API_ENCRYPTION_SECRET || process.env.API_ENCRYPTION_SECRET.length < 32) {
            console.error('API_ENCRYPTION_SECRET is not properly configured');
            return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
        }
        
        // Encrypt the API key for secure storage
        const encryptedApiKey = encryptApiKey(apiKey, process.env.API_ENCRYPTION_SECRET);

        // Create the new project
        const newProject = {
            project_name: projectData.name,
            project_owner: clientData.id,
            project_url: projectData.url,
            working: true, // Active project by default
            edge_function_slug: edgeFunctionSlug // Unique slug with identifier
            // The fields creation_timestamp and project_id are generated automatically
        };
        
        const { data: createdProject, error: projectError } = await supabase
            .from('projects')
            .insert([newProject])
            .select()
            .single();
            
        if (projectError) {
            console.error('Error creating the project:', projectError);
            // If an error occurs, try to delete the vector store and assistant
            try {
                // Note: If necessary, add logic here to delete the deployed Edge Function
            } catch (cleanupError) {
                console.error('Failed to clean up resources after project creation failure:', cleanupError);
            }
            return NextResponse.json({ error: 'Project creation failed' }, { status: 500 });
        }

        // Save the Vector Store ID in the vector_stores table
        const { error: vectorStoreError } = await supabase
            .from('vector_stores')
            .insert([{
                project_id: createdProject.project_id,
                openai_vector_id: vectorStoreId,
                name: projectData.name
            }]);

        if (vectorStoreError) {
            console.error('Error saving vector store information:', vectorStoreError);
            // Continue despite the error, because the project was created successfully
        }
        
        // Save the encrypted API key in the api_keys table
        const { error: apiKeyError } = await supabase
            .from('api_keys')
            .insert([{
                project_id: createdProject.project_id,
                encrypted_key: encryptedApiKey,
                created_at: new Date().toISOString()
            }]);
        
        if (apiKeyError) {
            console.error('Error saving API key:', apiKeyError);
            // Do not block project creation in case of an error
        }

        // Save the Assistant ID in the assistants table if the assistant was created
        if (assistantData) {
            const { error: assistantError } = await supabase
                .from('assistants')
                .insert([{
                    project_id: createdProject.project_id,
                    openai_assistant_id: assistantData.id,
                    name: projectData.name,
                    model: assistantData.model,
                    created_at: assistantData.created_at
                }]);

            if (assistantError) {
                console.error('Error saving assistant information:', assistantError);
                // Continue despite the error, because the project and vector store were created successfully
            }
        }

        // Deploy the Edge Function on Supabase
        let edgeFunctionData;
        let edgeFunctionError;
        try {
            // Use the slug already stored in createdProject
            const functionName = createdProject.edge_function_slug;      
            
            edgeFunctionData = await deployEdgeFunction(
                process.env.SUPABASE_PROJECT_REF!, 
                functionName,
                projectData.url,          // Pass the project URL for CORS
                true,                     // Enabled by default
                projectData.name,         // Project name
                vectorStoreId,            // Hardcoded Vector Store ID
                assistantData?.id,        // Hardcoded Assistant ID (undefined if not available)
                apiKey                    // API key to be hardcoded in the function
            );
            
        } catch (error) {
            console.error('Failed to deploy Edge Function:', error);
            edgeFunctionError = error;
        }
        
        return NextResponse.json({
            success: true,
            message: 'Project created successfully.',
            project: createdProject,
            vector_store_id: vectorStoreId,
            assistant_id: assistantData?.id || null,
            edge_function: edgeFunctionData || null,
            edge_function_error: edgeFunctionError ? String(edgeFunctionError) : null,
            api_key: apiKey // Include the non-encrypted API key in the response for the user
        });
            
    } catch (error) {
        console.error('Project creation error:', error);
        return NextResponse.json({ error: 'An error occurred while creating the project' }, { status: 500 });
    }
}
