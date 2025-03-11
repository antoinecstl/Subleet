import OpenAI from 'https://deno.land/x/openai@v4.24.0/mod.ts'

// Définir les en-têtes CORS communs
const corsHeaders = {
  'Access-Control-Allow-Origin': 'http://localhost:3000', // En production, utilisez mon domaine spécifique
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

Deno.serve(async (req) => {
  // Gérer les requêtes OPTIONS (CORS pre-flight)
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: corsHeaders,
    });
  }

  try {
    const apiKey = Deno.env.get('OPENAI_API_KEY')
    
    if (!apiKey) {
      return new Response('OpenAI API key is required', { 
        status: 500, 
        headers: corsHeaders 
      })
    }

    // Lire le corps de la requête pour obtenir la requête de l'utilisateur
    const requestData = await req.json();
    const { query } = requestData;
    
    if (!query) {
      return new Response('Query parameter is required', {
        status: 400,
        headers: corsHeaders
      });
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