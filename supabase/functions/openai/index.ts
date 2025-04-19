import OpenAI from 'https://deno.land/x/openai@v4.24.0/mod.ts'

// Définir les en-têtes CORS communs
const corsHeaders = {
  'Access-Control-Allow-Origin': 'http://localhost:3001', // En production, utilisez le domaine spécifique
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

Deno.serve(async (req) => {
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
    const { query, vector_store_id, context } = requestData;
    
    if (!query) {
      return new Response('Query parameter is required', {
        status: 400,
        headers: corsHeaders
      });
    }

    const openai = new OpenAI({
      apiKey: apiKey,
    })

    let reply = "";
    
    // Si un vector_store_id est fourni, utiliser file_search
    if (vector_store_id) {
      try {
        // Créer une réponse utilisant l'outil file_search
        const response = await openai.responses.create({
          model: "gpt-4o-mini",
          input: query,
          tools: [{
            type: "file_search",
            vector_store_ids: [vector_store_id],
            max_num_results: 10
          }]
        });
        
        // Chercher le message dans la réponse
        for (const output of response.output) {
          if (output.type === "message") {
            for (const content of output.content) {
              if (content.type === "output_text") {
                reply = content.text;
                break;
              }
            }
            break;
          }
        }
        
        if (!reply) {
          throw new Error("Aucune réponse textuelle reçue de l'API");
        }
        
      } catch (ragError) {
        console.error("File search error:", ragError);
        // Fallback à la méthode standard si la recherche échoue
        reply = "Erreur lors de la recherche dans la base de connaissances. Utilisation de la réponse standard.";
        
        // Utiliser le contexte s'il est fourni pour générer une réponse de secours
        if (context) {
          const chatCompletionFallback = await openai.chat.completions.create({
            messages: [
              { role: 'system', content: `Contexte: ${context}` },
              { role: 'user', content: query }
            ],
            model: 'gpt-4o-mini',
          });
          
          reply = chatCompletionFallback.choices[0].message.content;
        }
      }
    } else {
      // Utilisation standard sans RAG
      let messages = [];
      
      if (context) {
        messages = [
          { role: 'system', content: `Contexte: ${context}` },
          { role: 'user', content: query }
        ];
      } else {
        messages = [{ role: 'user', content: query }];
      }
      
      // Appel standard à l'API
      const chatCompletion = await openai.chat.completions.create({
        messages: messages,
        model: 'gpt-4o-mini',
      });

      reply = chatCompletion.choices[0].message.content;
    }

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