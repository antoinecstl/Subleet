import crypto from 'crypto';

/**
 * Génère une clé API sécurisée
 * @returns Une chaîne aléatoire formatée comme clé API
 */
export function generateApiKey(): string {
  const apiKeyBytes = crypto.randomBytes(24); // 24 octets = 192 bits
  return `sleet_${apiKeyBytes.toString('hex')}`;
}

/**
 * Encrypte une clé API pour stockage sécurisé
 * @param apiKey - La clé API à encrypter
 * @param encryptionSecret - Le secret pour l'encryption (sera haché en SHA-256 pour générer une clé de 32 octets)
 * @returns La clé encryptée
 */
export function encryptApiKey(apiKey: string, encryptionSecret: string): string {
  // Générer un IV (vecteur d'initialisation) aléatoire
  const iv = crypto.randomBytes(16);
    // Convertir la clé secrète en clé de 32 octets (256 bits) avec SHA-256
  const key = crypto.createHash('sha256').update(String(encryptionSecret)).digest();
  
  // Créer un cipher avec l'algorithme, la clé secrète (maintenant de 32 octets) et l'IV
  const cipher = crypto.createCipheriv(
    'aes-256-cbc',
    key,
    iv
  );
  
  // Encrypter la clé API
  let encrypted = cipher.update(apiKey, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  // Concaténer l'IV avec le texte encrypté pour le stockage
  // L'IV doit être stocké pour permettre le déchiffrement plus tard
  return iv.toString('hex') + ':' + encrypted;
}

/**
 * Décrypte une clé API encryptée
 * @param encryptedApiKey - La clé API encryptée (au format iv:encryptedData)
 * @param encryptionSecret - Le secret pour l'encryption (sera haché en SHA-256 pour générer une clé de 32 octets)
 * @returns La clé API originale
 */
export function decryptApiKey(encryptedApiKey: string, encryptionSecret: string): string {
  // Séparer l'IV du texte encrypté
  const [ivHex, encryptedText] = encryptedApiKey.split(':');
  
  // Convertir l'IV en buffer
  const iv = Buffer.from(ivHex, 'hex');
    // Convertir la clé secrète en clé de 32 octets (256 bits) avec SHA-256
  const key = crypto.createHash('sha256').update(String(encryptionSecret)).digest();
  
  // Créer un decipher avec l'algorithme, la clé secrète (maintenant de 32 octets) et l'IV
  const decipher = crypto.createDecipheriv(
    'aes-256-cbc',
    key,
    iv
  );
  
  // Décrypter la clé API
  let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  
  return decrypted;
}
