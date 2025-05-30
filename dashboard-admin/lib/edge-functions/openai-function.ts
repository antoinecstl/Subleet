// Code de la fonction Edge pour Supabase
export const generateOpenAiFunctionCode = (projectUrl: string) => `import OpenAI from "npm:openai";
// Définir les en-têtes CORS communs
const corsHeaders = {
  'Access-Control-Allow-Origin': '${projectUrl}',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type'
};
Deno.serve(async (req)=>{
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: corsHeaders
    });
  }
  try {
    const apiKey = Deno.env.get('OPENAI_API_KEY');
    if (!apiKey) {
      return new Response('OpenAI API key is required', {
        status: 500,
        headers: corsHeaders
      });
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
      apiKey: apiKey
    });
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
          console.log(\`Thread \${thread_id} not found or expired, creating a new one\`);
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
      await openai.beta.threads.messages.create(threadObj.id, {
        role: "user",
        content: query
      });
      // Créer la réponse en Stream
      const encoder = new TextEncoder();
      const stream = new ReadableStream({
        async start (controller) {
          // Créer un run pour obtenir la réponse en mode streaming
          const runStream = await openai.beta.threads.runs.createAndStream(threadObj.id, {
            assistant_id: assistant_id,
            tool_resources: {
              file_search: {
                vector_store_ids: [
                  vector_store_id
                ]
              }
            }
          });
          // Traiter les événements du stream
          for await (const chunk of runStream){
            try {
              // Si c'est un événement de type thread.message.delta
              if (chunk.event === "thread.message.delta") {
                // Récupérer le contenu textuel du delta
                if (chunk.data?.delta?.content && chunk.data.delta.content.length > 0) {
                  const content = chunk.data.delta.content[0];
                  if (content.type === "text" && content.text?.value) {
                    const text = content.text.value;
                    // Envoyer le texte dans le stream de réponse
                    controller.enqueue(encoder.encode(\`data: \${JSON.stringify({
                      content: text
                    })}\\n\\n\`));
                  }
                }
              } else if (chunk.event === "thread.run.completed") {
                // On envoie un événement final qui contient l'ID du thread si c'est nouveau
                if (isNewThread) {
                  controller.enqueue(encoder.encode(\`data: \${JSON.stringify({
                    threadId: threadObj.id,
                    done: true
                  })}\\n\\n\`));
                } else {
                  controller.enqueue(encoder.encode(\`data: \${JSON.stringify({
                    done: true
                  })}\\n\\n\`));
                }
              } else if (chunk.event === "thread.run.failed") {
                controller.enqueue(encoder.encode(\`data: \${JSON.stringify({
                  error: "Run failed"
                })}\\n\\n\`));
                controller.close();
              }
            } catch (error) {
              console.error("Error processing stream chunk:", error);
              controller.enqueue(encoder.encode(\`data: \${JSON.stringify({
                error: "Error processing response"
              })}\\n\\n\`));
            }
          }
          controller.close();
        }
      });
      // Retourner le stream comme réponse SSE (Server-Sent Events)
      return new Response(stream, {
        headers: {
          ...corsHeaders,
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive'
        }
      });
    } catch (error) {
      console.error("File search error:", error);
      return new Response(JSON.stringify({
        error: error.message
      }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      });
    }
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({
      error: error.message
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders
      }
    });
  }
});`;

/**
 * Génère un code pour une fonction Edge désactivée
 * @param projectName - Nom du projet
 * @returns Code source pour la fonction Edge désactivée
 */
export const generateDisabledFunctionCode = (projectName: string) => `
Deno.serve(async (req) => {
  // Définir les en-têtes CORS
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  };

  // Pour les requêtes OPTIONS (pre-flight)
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: corsHeaders
    });
  }

  // Pour toutes les autres requêtes, renvoyer un message d'erreur
  return new Response(JSON.stringify({
    error: "Ce chatbot est actuellement désactivé. Veuillez contacter l'administrateur du projet '${projectName}' pour plus d'informations."  }), {
    status: 403,
    headers: {
      'Content-Type': 'application/json',
      ...corsHeaders
    }
  });
});
`;
