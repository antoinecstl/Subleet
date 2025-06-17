import OpenAI from 'openai';
import dotenv from 'dotenv';
import { SUPPORTED_MODELS } from './constants';

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Interface pour les fichiers
export interface VectorFile {
  id: string;
  filename: string;
  size: number;
  created_at: string;
  purpose: string;
}

// Interface pour les assistants
export interface Assistant {
  id: string;
  name: string;
  model: string;
  created_at: string;
  instructions?: string;
}

// Réexporter les modèles supportés
export { SUPPORTED_MODELS };

/**
 * Crée un nouveau Vector Store
 * @param name Nom du Vector Store
 * @returns L'ID du Vector Store créé
 */
export async function createVectorStore(name: string): Promise<string> {
  try {
    const vectorStore = await openai.vectorStores.create({
      name
    });
    
    return vectorStore.id;
  } catch (error) {
    console.error('Error creating vector store:', error);
    throw error;
  }
}

/**
 * Supprime un Vector Store
 * @param vectorStoreId ID du Vector Store
 */
export async function deleteVectorStore(vectorStoreId: string): Promise<void> {
  try {
    await openai.vectorStores.del(vectorStoreId);
  } catch (error) {
    console.error('Error deleting vector store:', error);
    throw error;
  }
}

/**
 * Crée un nouveau Assistant
 * @param name Nom de l'Assistant
 * @param vectorStoreId ID du Vector Store à associer à l'assistant (optionnel)
 * @param model Le modèle à utiliser pour l'assistant (optionnel, par défaut gpt-4o-mini)
 * @returns L'ID de l'Assistant créé et ses détails
 */
export async function createAssistant(name: string, vectorStoreId?: string, model: string = 'gpt-4.1-nano'): Promise<Assistant> {
  try {
    // Vérifier que le modèle est supporté
    if (!SUPPORTED_MODELS.includes(model)) {
      console.warn(`Le modèle ${model} n'est pas dans la liste des modèles supportés. Utilisation du modèle par défaut gpt-4.1-nano.`);
      model = 'gpt-4.1-nano';
    }

    const instructions = `Tu es un assistant virtuel intelligent nommé Catalisia, créé par Catalisia SAS pour aider les utilisateurs à trouver des informations et répondre à leurs questions. Tu dois fournir des réponses précises, utiles et professionnelles.

Consignes:
1. Base tes réponses uniquement sur les informations disponibles dans le Vector Store.
2. Si tu ne connais pas la réponse, dis-le clairement et suggère à l'utilisateur de contacter l'équipe support.
3. Réponds en utilisant un ton professionnel et amical.
4. Utilise des phrases courtes et précises pour faciliter la lecture.
5. Adapte ton style pour répondre à des questions techniques comme des questions générales.
6. N'invente pas d'informations qui ne seraient pas dans le Vector Store.`;

    // Créer l'assistant avec l'outil file_search, mais sans associer de Vector Store spécifique
    // Le Vector Store sera associé lors de l'exécution du Run
    const assistant = await openai.beta.assistants.create({
      name,
      instructions,
      model,
      tools: [{ type: "file_search" }]
    });
    
    return {
      id: assistant.id,
      name: assistant.name ?? name,
      model: assistant.model,
      instructions: assistant.instructions ?? undefined,
      created_at: new Date().toISOString() // OpenAI ne fournit pas toujours la date de création
    };
  } catch (error) {
    console.error('Error creating assistant:', error);
    throw error;
  }
}

/**
 * Récupère les informations d'un assistant
 * @param assistantId ID de l'Assistant
 * @returns Les détails de l'assistant
 */
export async function getAssistant(assistantId: string): Promise<Assistant> {
  try {
    const assistant = await openai.beta.assistants.retrieve(assistantId);
    
    return {
      id: assistant.id,
      name: assistant.name ?? 'Assistant',
      model: assistant.model,
      instructions: assistant.instructions ?? '',
      created_at: new Date(assistant.created_at * 1000).toISOString()
    };
  } catch (error) {
    console.error('Error retrieving assistant:', error);
    throw error;
  }
}

/**
 * Met à jour les instructions et/ou le modèle d'un assistant existant
 * @param assistantId ID de l'Assistant
 * @param instructions Nouvelles instructions (optionnel)
 * @param model Nouveau modèle à utiliser (optionnel)
 * @returns L'assistant mis à jour
 */
export async function updateAssistant(
  assistantId: string, 
  instructions?: string,
  model?: string
): Promise<Assistant> {
  try {
    const updateParams: { instructions?: string; model?: string } = {};
    
    if (instructions !== undefined) {
      updateParams.instructions = instructions;
    }
    
    if (model !== undefined) {
      // Vérifier que le modèle est supporté
      if (!SUPPORTED_MODELS.includes(model)) {
        throw new Error(`Le modèle ${model} n'est pas supporté. Modèles disponibles: ${SUPPORTED_MODELS.join(', ')}`);
      }
      updateParams.model = model;
    }
    
    // Ne mettre à jour que si des paramètres sont fournis
    if (Object.keys(updateParams).length === 0) {
      // Si aucun paramètre de mise à jour, simplement récupérer l'assistant actuel
      return await getAssistant(assistantId);
    }
    
    const assistant = await openai.beta.assistants.update(assistantId, updateParams);
    
    return {
      id: assistant.id,
      name: assistant.name ?? 'Assistant',
      model: assistant.model,
      instructions: assistant.instructions ?? '',
      created_at: new Date(assistant.created_at * 1000).toISOString()
    };
  } catch (error) {
    console.error('Error updating assistant:', error);
    throw error;
  }
}

/**
 * Met à jour un assistant existant pour utiliser un Vector Store
 * @param assistantId ID de l'Assistant
 * @param vectorStoreId ID du Vector Store
 */
export async function updateAssistantVectorStore(assistantId: string, vectorStoreId: string): Promise<void> {
  try {
    await openai.beta.assistants.update(
      assistantId,
      {
        tool_resources: {
          file_search: {
            vector_store_ids: [vectorStoreId]
          }
        }
      }
    );
  } catch (error) {
    console.error('Error updating assistant with vector store:', error);
    throw error;
  }
}

/**
 * Supprime un Assistant
 * @param assistantId ID de l'Assistant
 */
export async function deleteAssistant(assistantId: string): Promise<void> {
  try {
    await openai.beta.assistants.del(assistantId);
  } catch (error) {
    console.error('Error deleting assistant:', error);
    throw error;
  }
}

/**
 * Ajoute un fichier au Vector Store
 * @param vectorStoreId ID du Vector Store
 * @param file Fichier à ajouter (Buffer)
 * @param filename Nom du fichier
 * @returns Informations sur le fichier ajouté
 */
export async function addFileToVectorStore(
  vectorStoreId: string,
  file: Buffer, 
  filename: string
): Promise<VectorFile> {
  try {
    // Créer un Blob à partir du buffer
    const blob = new Blob([file]);
    
    // Upload du fichier
    const uploadedFile = await openai.files.create({
      file: new File([blob], filename),
      purpose: "assistants",
    });

    // Attendre que le fichier soit traité
    let fileStatus = await openai.files.retrieve(uploadedFile.id);
    let attempts = 0;
    const maxAttempts = 10;
    
    while (fileStatus.status !== "processed" && attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 1000)); // Attendre 1 seconde
      fileStatus = await openai.files.retrieve(uploadedFile.id);
      attempts++;
    }
    
    if (fileStatus.status !== "processed") {
      throw new Error(`File processing timed out after ${maxAttempts} attempts`);
    }

    // Ajouter le fichier au vector store
    await openai.vectorStores.files.create(
      vectorStoreId,
      { file_id: uploadedFile.id }
    );

    // Vérifier le statut de l'intégration du fichier
    let vectorStoreFile = null;
    attempts = 0;
    
    do {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const filesInStore = [];
      for await (const file of openai.vectorStores.files.list(vectorStoreId)) {
        if (file.id === uploadedFile.id) {
          vectorStoreFile = file;
          break;
        }
        filesInStore.push(file);
      }
      
      attempts++;
    } while ((vectorStoreFile === null || vectorStoreFile.status === "in_progress") && attempts < maxAttempts);
    
    if (vectorStoreFile === null) {
      throw new Error("Le fichier n'a pas été trouvé dans le vector store après plusieurs tentatives");
    }
      if (vectorStoreFile.status === "failed") {
      const errorMessage = 'last_error' in vectorStoreFile && vectorStoreFile.last_error 
        ? vectorStoreFile.last_error.message || 'Erreur inconnue' : 'Erreur inconnue';
      throw new Error(`L'ajout du fichier au vector store a échoué: ${errorMessage}`);
    }

    return {
      id: uploadedFile.id,
      filename,
      size: uploadedFile.bytes,
      created_at: new Date(uploadedFile.created_at * 1000).toISOString(),
      purpose: uploadedFile.purpose,
    };
  } catch (error) {
    console.error('Error adding file to vector store:', error);
    throw error;
  }
}

/**
 * Supprime un fichier du Vector Store
 * @param vectorStoreId ID du Vector Store
 * @param fileId ID du fichier à supprimer
 */
export async function removeFileFromVectorStore(
  vectorStoreId: string,
  fileId: string
): Promise<void> {
  try {
    // Dissocier le fichier du vector store
    await openai.vectorStores.files.del(vectorStoreId, fileId);
    
    // Supprimer le fichier
    await openai.files.del(fileId);
  } catch (error) {
    console.error('Error removing file from vector store:', error);
    throw error;
  }
}

/**
 * Liste tous les fichiers dans un Vector Store
 * @param vectorStoreId ID du Vector Store
 * @returns Liste des fichiers
 */
export async function listFilesInVectorStore(vectorStoreId: string): Promise<VectorFile[]> {
  try {
    const fileDetails: VectorFile[] = [];
    
    // Récupérer tous les fichiers du vector store
    for await (const file of openai.vectorStores.files.list(vectorStoreId)) {
      try {
        const fileInfo = await openai.files.retrieve(file.id);
        fileDetails.push({
          id: fileInfo.id,
          filename: fileInfo.filename || 'Unknown',
          size: fileInfo.bytes,
          created_at: new Date(fileInfo.created_at * 1000).toISOString(),
          purpose: fileInfo.purpose,
        });
      } catch (fileError) {
        console.error(`Failed to retrieve file ${file.id}:`, fileError);
      }
    }

    return fileDetails;
  } catch (error) {
    console.error('Error listing files in vector store:', error);
    throw error;
  }
}