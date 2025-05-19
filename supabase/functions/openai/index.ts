import OpenAI from "npm:openai";

// Définir les en-têtes CORS communs
const corsHeaders = {
  'Access-Control-Allow-Origin': '*', // En production, utilisez le domaine spécifique
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
    const { query, vector_store_id, assistant_id, thread_id } = requestData;
    
    if (!query) {
      return new Response('Query parameter is required', {
        status: 400,
        headers: corsHeaders
      });
    }

    // Vérifier si un vector_store_id est fourni
    if (!vector_store_id) {
      return new Response('Vector store ID is required', {
        status: 400,
        headers: corsHeaders
      });
    }

    // Vérifier si un assistant_id est fourni
    if (!assistant_id) {
      return new Response('Assistant ID is required', {
        status: 400,
        headers: corsHeaders
      });
    }

    const openai = new OpenAI({
      apiKey: apiKey,
    })

    let reply = "";
    let newThreadId = null;
    
    try {
      // Créer un thread s'il n'existe pas déjà, sinon utiliser celui fourni
      let threadObj;
      let isNewThread = false;
      
      if (thread_id) {
        // Utiliser le thread existant
        try {
          // Vérifier que le thread existe
          threadObj = await openai.beta.threads.retrieve(thread_id);
        } catch (error) {
          // Si le thread n'existe pas ou est expiré, on en crée un nouveau
          console.log(`Thread ${thread_id} not found or expired, creating a new one`);
          threadObj = await openai.beta.threads.create();
          isNewThread = true;
          newThreadId = threadObj.id;
        }
      } else {
        // Créer un nouveau thread
        threadObj = await openai.beta.threads.create();
        isNewThread = true;
        newThreadId = threadObj.id;
      }

      // Ajouter le message de l'utilisateur au thread
      await openai.beta.threads.messages.create(
        threadObj.id,
        {
          role: "user",
          content: query
        }
      );

      // Créer un run pour obtenir la réponse
      const run = await openai.beta.threads.runs.createAndPoll(
        threadObj.id,
        {
          assistant_id: assistant_id,
          tool_resources: {
            file_search: {
              vector_store_ids: [vector_store_id]
            }
          }
        }
      );

      // Récupérer les messages de la conversation
      const messages = await openai.beta.threads.messages.list(
        threadObj.id
      );

      // Extraire la réponse de l'assistant (le message le plus récent)
      if (messages.data.length > 0) {
        const assistantMessage = messages.data.find(msg => msg.role === "assistant");
        if (assistantMessage && assistantMessage.content.length > 0) {
          const textContent = assistantMessage.content.find(content => content.type === "text");
          if (textContent && textContent.type === "text") {
            reply = textContent.text.value;
          }
        }
      }

      if (!reply) {
        throw new Error("Aucune réponse textuelle reçue de l'API");
      }
      
    } catch (error) {
      console.error("File search error:", error);
      return new Response(JSON.stringify({ error: error.message }), { 
        status: 500,
        headers: { 
          'Content-Type': 'application/json',
          ...corsHeaders 
        }
      });
    }

    // Préparer la réponse
    const responseBody = {
      reply: reply,
      thread_id: newThreadId // Inclure le nouveau thread_id uniquement s'il a été créé
    };

    return new Response(JSON.stringify(responseBody), {
      headers: { 
        'Content-Type': 'application/json',
        ...corsHeaders
      }
    });
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