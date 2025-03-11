import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_ANON_KEY!);

// Fonction pour chiffrer la clé API avec des données temporelles
function encryptApiKey(apiKey: string, createdAt: string): string {
  // Conversion des timestamps pour être cohérent
  const creationTimestamp = new Date(createdAt).getTime();
  const currentTimestamp = Date.now(); // Utiliser Date.now() pour plus de clarté
  const timeSignature = Math.floor((currentTimestamp - creationTimestamp) / 1000); // différence en secondes
  
  // Combiner la clé avec la signature temporelle
  const combinedKey = `${apiKey}:${timeSignature}:${currentTimestamp}`;
  
  // Encoder en base64 standard (compatible avec atob)
  return Buffer.from(combinedKey).toString('base64');
}

export async function GET() {
  try {
    // Correction de la requête: La colonne revoked est dans api_keys, pas dans clients
    const { data, error } = await supabase
      .from('clients')
      .select(`
        id,
        email,
        api_keys (
          key,
          created_at,
          revoked
        )
      `)
      .eq('email', 'antoine.castel@ipsa.fr');

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }

    // Si aucun client n'est trouvé, renvoyer un tableau vide
    if (!data || data.length === 0 || !data[0].api_keys || data[0].api_keys.length === 0) {
      return NextResponse.json([]);
    }

    // Filtrer les clés non révoquées
    const activeKeys = data[0].api_keys.filter(key => key.revoked === false);
    
    // Si aucune clé active n'est trouvée
    if (activeKeys.length === 0) {
      return NextResponse.json([]);
    }

    // Récupérer la première clé active
    const apiKey = activeKeys[0].key;
    const createdAt = activeKeys[0].created_at;
    
    // Chiffrer la clé API avec des données temporelles
    const encryptedKey = encryptApiKey(apiKey, createdAt);

    // Renvoyer la clé chiffrée et sa date de création
    return NextResponse.json({
      encryptedKey,
      created_at: createdAt
    });

  } catch (error) {
    console.error('Server error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
