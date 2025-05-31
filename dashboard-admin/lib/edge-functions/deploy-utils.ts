import { generateOpenAiFunctionCode, generateDisabledFunctionCode } from './openai-function';

/**
 * Déploie une fonction Edge sur Supabase
 * @param projectRef - Référence du projet Supabase
 * @param functionName - Nom de la fonction à déployer
 * @param projectUrl - URL du projet pour les CORS
 * @param active - État d'activation de la fonction
 * @param projectName - Nom du projet (pour les messages d'erreur)
 * @param vectorStoreId - ID du Vector Store à hardcoder (optionnel)
 * @param assistantId - ID de l'Assistant à hardcoder (optionnel)
 * @param apiKey - Clé API à hardcoder pour la sécurité (optionnel)
 * @returns Promise avec les détails de la fonction déployée
 */
export async function deployEdgeFunction(
  projectRef: string, 
  functionName: string, 
  projectUrl: string,
  active: boolean = true,
  projectName: string,
  vectorStoreId?: string,
  assistantId?: string,
  apiKey?: string
) {
  if (!process.env.SUPABASE_ACCESS_TOKEN) {
    throw new Error('SUPABASE_ACCESS_TOKEN is required to deploy Edge Functions');
  }
  // Préparer l'URL de l'API pour le déploiement de fonction
  const endpoint = `https://api.supabase.com/v1/projects/${projectRef}/functions/deploy?slug=${functionName}`;
  
  // Créer les métadonnées de la fonction
  const metadata = {
    name: functionName,
    version: "1",
    verify_jwt: false,
    import_map: {
      imports: {
        "openai": "npm:openai"
      }
    },
    entrypoint_path: "index.ts"
  };
  
  try {
    // Créer un FormData pour l'envoi multipart
    const formData = new FormData();
    
    // Ajouter les métadonnées (les convertir en JSON)
    formData.append('metadata', JSON.stringify(metadata));
      // Générer le code de fonction approprié selon l'état d'activation
    const functionCode = active 
      ? generateOpenAiFunctionCode(projectUrl, vectorStoreId, assistantId, apiKey)
      : generateDisabledFunctionCode(projectName);
    
    // Ajouter le fichier source (index.ts)
    const fileBlob = new Blob([functionCode], { type: 'application/typescript' });
    formData.append('file', fileBlob, 'index.ts');
    
    // Appel de l'API de déploiement de fonction
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.SUPABASE_ACCESS_TOKEN}`
      },
      body: formData
    });
    
    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
      } catch (e) {
        errorData = await response.text();
      }
      throw new Error(`Failed to deploy Edge Function: ${response.status} - ${typeof errorData === 'string' ? errorData : JSON.stringify(errorData)}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error deploying Edge Function:', error);
    throw error;
  }
}
