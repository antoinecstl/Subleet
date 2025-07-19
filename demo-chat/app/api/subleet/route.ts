import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    // Récupérer les données de la requête
    const body = await req.json();
    const { query, thread_id } = body;

    // Valider les paramètres requis
    if (!query) {
      return NextResponse.json({ error: 'Query parameter is required' }, { status: 400 });
    }

    // Récupérer les variables d'environnement
    const edgeFunctionUrl = process.env.NEXT_PUBLIC_SUBLEET_URL;
    const apiKey = process.env.SUBLEET_API_KEY;

    if (!edgeFunctionUrl) {
      return NextResponse.json({ error: 'Edge Function URL not configured' }, { status: 500 });
    }

    if (!apiKey) {
      return NextResponse.json({ error: 'API Key not configured' }, { status: 500 });
    }

    // Préparer les headers pour l'Edge Function
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'x-api-key': apiKey
    };

    // Appeler l'Edge Function
    const response = await fetch(edgeFunctionUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        query,
        thread_id
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Edge Function error:', errorText);
      return NextResponse.json(
        { error: 'Failed to process request' }, 
        { status: response.status }
      );
    }

    // Vérifier si c'est un stream (Server-Sent Events)
    const contentType = response.headers.get('content-type');
    if (contentType?.includes('text/event-stream')) {
      // Pour les streams, on retourne directement la response
      return new NextResponse(response.body, {
        status: response.status,
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive'
        }
      });
    } else {
      // Pour les réponses JSON normales
      const data = await response.json();
      return NextResponse.json(data);
    }

  } catch (error) {
    console.error('API Route error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function OPTIONS(req: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}