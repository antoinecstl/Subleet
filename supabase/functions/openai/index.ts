import OpenAI from 'https://deno.land/x/openai@v4.24.0/mod.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// Définir les en-têtes CORS communs
const corsHeaders = {
  'Access-Control-Allow-Origin': '*', // En production, utilisez votre domaine spécifique
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// Fonction pour déchiffrer et vérifier la clé API
async function verifyApiKey(encryptedKey: string): Promise<boolean> {
  try {
    // Déchiffrer la clé
    let decodedString;
    try {
      decodedString = atob(encryptedKey);
    } catch (error) {
      console.error("Error decoding base64:", error);
      return false;
    }
    
    console.log("Decoded string:", decodedString);
    
    const parts = decodedString.split(':');
    
    if (parts.length !== 3) {
      console.error("Invalid key format, parts:", parts.length);
      return false;
    }
    
    const [apiKey, timeSignature, timestamp] = parts;
    
    // Vérifier que les valeurs sont valides
    if (!apiKey || !timeSignature || !timestamp) {
      console.error("Missing key components");
      return false;
    }
    
    const currentTime = new Date().getTime();
    const receivedTime = parseInt(timestamp);
    
    // Vérifier que le timestamp est un nombre valide
    if (isNaN(receivedTime)) {
      console.error("Invalid timestamp:", timestamp);
      return false;
    }
    
    // Vérifier si la clé n'a pas expiré (5 minutes max)
    if (currentTime - receivedTime > 5 * 60 * 1000) {
      console.error("Key expired");
      return false;
    }
    
    // Initialiser le client Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase configuration missing');
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // 1. Récupérer l'ID du client par email
    const { data: clientData, error: clientError } = await supabase
      .from('clients')
      .select('id')
      .eq('email', 'antoine.castel@ipsa.fr')
      .single();
    
    if (clientError || !clientData) {
      console.error("Client not found:", clientError);
      return false;
    }
    
    // 2. Récupérer les clés API actives du client
    const { data: apiKeysData, error: apiKeysError } = await supabase
      .from('api_keys')
      .select('key, created_at, revoked')
      .eq('client_id', clientData.id)
      .eq('revoked', false);
    
    if (apiKeysError) {
      console.error("API keys query error:", apiKeysError);
      return false;
    }
    
    if (!apiKeysData || apiKeysData.length === 0) {
      console.error("No active API keys found");
      return false;
    }
    
    // Récupérer la première clé active
    const storedKey = apiKeysData[0].key;
    const createdAt = apiKeysData[0].created_at;
    
    console.log("Stored key:", storedKey);
    console.log("Received key:", apiKey);
    
    // Vérifier si la clé correspond
    if (storedKey !== apiKey) {
      console.error("Key mismatch");
      return false;
    }
    
    // Vérification temporelle
    const creationTimestamp = new Date(createdAt).getTime();
    
    // Recalculer la signature temporelle pour vérifier
    const calculatedTimeSignature = Math.floor((parseInt(timestamp) - creationTimestamp) / 1000);
    const expectedTimeSignature = parseInt(timeSignature);
    
    // Une marge d'erreur de 5 secondes est tolérée
    const isValidSignature = Math.abs(calculatedTimeSignature - expectedTimeSignature) < 5;
    
    console.log("Time signature validation:", {
      isValidSignature,
      calculatedTimeSignature,
      expectedTimeSignature
    });
    
    return isValidSignature;
    
  } catch (error) {
    console.error('Error verifying API key:', error);
    return false;
  }
}

Deno.serve(async (req) => {
  // Gérer les requêtes OPTIONS (preflight)
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: corsHeaders,
    })
  }

  try {
    const { query, encryptedKey } = await req.json()
    
    // Vérifier la clé API chiffrée
    const isValidKey = await verifyApiKey(encryptedKey);
    if (!isValidKey) {
      return new Response('Unauthorized: Invalid API key', { 
        status: 401, 
        headers: corsHeaders 
      });
    }

    const apiKey = Deno.env.get('OPENAI_API_KEY')
    
    if (!apiKey) {
      return new Response('API key is required', { 
        status: 500, 
        headers: corsHeaders 
      })
    }

    const openai = new OpenAI({
      apiKey: apiKey,
    })

    // Documentation here: https://github.com/openai/openai-node
    const chatCompletion = await openai.chat.completions.create({
      messages: [{ role: 'user', content: query }],
      // Choose model from here: https://platform.openai.com/docs/models
      model: 'gpt-4o-mini',
      stream: false,
    })

    const reply = chatCompletion.choices[0].message.content

    return new Response(reply, {
      headers: { 
        'Content-Type': 'text/plain',
        ...corsHeaders
      }
    })
  } catch (error) {
    console.error(error)
    return new Response(JSON.stringify({ error: error.message }), { 
      status: 500,
      headers: { 
        'Content-Type': 'application/json',
        ...corsHeaders 
      }
    })
  }
})