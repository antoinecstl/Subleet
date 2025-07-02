// Types pour le système d'affichage unique de clé API

export interface ApiKeyData {
  id: string;
  project_id: string;
  encrypted_key: string;
  is_displayed: boolean;
  created_at: string;
}

export interface ApiKeyResponse {
  success: boolean;
  api_key?: string;
  created_at?: string;
  message?: string;
  warning?: string;
  alreadyDisplayed?: boolean;
}

export interface ApiKeyStatusData {
  exists: boolean;
  isDisplayed: boolean;
  canBeViewed: boolean;
  createdAt?: string;
}

export interface ProjectCreationResponse {
  success: boolean;
  message: string;
  project: {
    project_id: string;
    project_name: string;
    project_url: string;
    working: boolean;
    edge_function_slug: string;
    creation_timestamp: string;
  };
  vector_store_id: string;
  assistant_id: string | null;
  edge_function: Record<string, unknown> | null;
  edge_function_error: string | null;
  api_key: string;
}

export interface ApiKeyDisplayProps {
  projectId: string;
  onApiKeyViewed?: () => void;
  showWarnings?: boolean;
  customMessages?: {
    warning?: string;
    success?: string;
    alreadyDisplayed?: string;
    error?: string;
  };
}

export interface ApiKeyState {
  apiKey: string | null;
  isRevealed: boolean;
  isLoading: boolean;
  alreadyDisplayed: boolean;
  copied: boolean;
  error: string | null;
}

export interface EncryptionConfig {
  algorithm: 'aes-256-cbc';
  keyLength: 32; // bytes
  ivLength: 16; // bytes
}

export interface ApiKeyGenerationOptions {
  prefix?: string;
  byteLength?: number;
  includeTimestamp?: boolean;
}

// Constantes
export const API_KEY_CONSTANTS = {
  PREFIX: 'sleet_',
  DEFAULT_BYTE_LENGTH: 24,
  MIN_SECRET_LENGTH: 32,
  ENCRYPTION_ALGORITHM: 'aes-256-cbc' as const,
} as const;

// Enum pour les statuts
export enum ApiKeyStatus {
  NOT_CREATED = 'not_created',
  AVAILABLE = 'available',
  DISPLAYED = 'displayed',
  ERROR = 'error',
}

// Types d'erreur
export interface ApiKeyError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

export class ApiKeyNotFoundError extends Error {
  constructor(projectId: string) {
    super(`API key not found for project ${projectId}`);
    this.name = 'ApiKeyNotFoundError';
  }
}

export class ApiKeyAlreadyDisplayedError extends Error {
  constructor(projectId: string) {
    super(`API key for project ${projectId} has already been displayed`);
    this.name = 'ApiKeyAlreadyDisplayedError';
  }
}

export class EncryptionError extends Error {
  constructor(operation: 'encrypt' | 'decrypt', details?: string) {
    super(`Failed to ${operation} API key${details ? `: ${details}` : ''}`);
    this.name = 'EncryptionError';
  }
}

// Utilitaires de validation
export function isValidProjectId(projectId: string): boolean {
  return typeof projectId === 'string' && projectId.length > 0;
}

export function isValidApiKey(apiKey: string): boolean {
  return typeof apiKey === 'string' && 
         apiKey.startsWith(API_KEY_CONSTANTS.PREFIX) &&
         apiKey.length > API_KEY_CONSTANTS.PREFIX.length + 10;
}

export function isValidEncryptionSecret(secret: string): boolean {
  return typeof secret === 'string' && 
         secret.length >= API_KEY_CONSTANTS.MIN_SECRET_LENGTH;
}
