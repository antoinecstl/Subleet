import OpenAI from 'openai';
import dotenv from 'dotenv';

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
      throw new Error(`L'ajout du fichier au vector store a échoué: ${(vectorStoreFile as any).error_message || "Erreur inconnue"}`);
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