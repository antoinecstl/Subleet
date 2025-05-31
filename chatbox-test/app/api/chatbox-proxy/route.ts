import { NextResponse } from 'next/server';

// Seuls les appels POST sont autorisés
export async function POST(request: Request) {
  try {    // Vérifier que la clé API est configurée
    if (!process.env.CHATBOX_API_KEY) {
      console.error('CHATBOX_API_KEY is not configured');
      return NextResponse.json(
        { error: 'Internal Server Error: API key not configured' },
        { status: 500 }
      );
    }

    // Vérifier que l'URL de l'Edge Function est configurée
    const edgeFunctionUrl = process.env.EDGE_FUNCTION_URL;
    if (!edgeFunctionUrl) {
      console.error('EDGE_FUNCTION_URL is not configured');
      return NextResponse.json(
        { error: 'Internal Server Error: Edge Function URL not configured' },
        { status: 500 }
      );
    }

    // Lire le corps de la requête
    const requestData = await request.json();    // Relayer la requête vers l'Edge Function avec l'API key sécurisée
    const response = await fetch(edgeFunctionUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.CHATBOX_API_KEY
      },
      body: JSON.stringify(requestData)
    });

    // Si nous recevons une réponse textuelle (SSE/stream)
    if (response.headers.get('Content-Type')?.includes('text/event-stream')) {
      // Propager les headers SSE et le stream
      const responseStream = new ReadableStream({
        async start(controller) {
          const reader = response.body?.getReader();
          if (!reader) {
            controller.close();
            return;
          }

          try {
            while (true) {
              const { done, value } = await reader.read();
              if (done) break;
              controller.enqueue(value);
            }
          } catch (e) {
            console.error('Error reading stream:', e);
          } finally {
            controller.close();
            reader.releaseLock();
          }
        }
      });

      return new Response(responseStream, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive'
        },
        status: response.status
      });
    }

    // Sinon, c'est une réponse JSON normale
    const responseData = await response.json();
    
    // Renvoyer le même statut et corps de réponse
    return NextResponse.json(responseData, { status: response.status });
    
  } catch (error) {
    console.error('Proxy error:', error);
    return NextResponse.json(
      { error: 'Proxy request failed' },
      { status: 500 }
    );
  }
}

// Répondre avec 405 Method Not Allowed pour les autres méthodes
export async function GET() {
  return NextResponse.json(
    { error: 'Method Not Allowed' },
    { status: 405 }
  );
}

export async function PUT() {
  return NextResponse.json(
    { error: 'Method Not Allowed' },
    { status: 405 }
  );
}

export async function DELETE() {
  return NextResponse.json(
    { error: 'Method Not Allowed' },
    { status: 405 }
  );
}

export async function PATCH() {
  return NextResponse.json(
    { error: 'Method Not Allowed' },
    { status: 405 }
  );
}
