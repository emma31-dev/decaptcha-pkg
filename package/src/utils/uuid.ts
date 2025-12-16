/**
 * UUID Generation Utilities
 * 
 * Provides cryptographically secure UUID generation for nonce signing
 * and other security-critical operations.
 */

/**
 * Generates a cryptographically secure UUID v4
 * @returns {string} UUID v4 string
 */
export function generateUUID(): string {
  // Use crypto.randomUUID if available (modern browsers)
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  
  // Fallback implementation using crypto.getRandomValues
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    const array = new Uint8Array(16);
    crypto.getRandomValues(array);
    
    // Set version (4) and variant bits
    array[6] = (array[6] & 0x0f) | 0x40; // Version 4
    array[8] = (array[8] & 0x3f) | 0x80; // Variant 10
    
    // Convert to hex string with hyphens
    const hex = Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
    return [
      hex.slice(0, 8),
      hex.slice(8, 12),
      hex.slice(12, 16),
      hex.slice(16, 20),
      hex.slice(20, 32)
    ].join('-');
  }
  
  // Final fallback for environments without crypto (should not happen in modern browsers)
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

/**
 * Generates a short UUID for use as nonce (first 8 characters)
 * @returns {string} Short UUID string
 */
export function generateShortUUID(): string {
  return generateUUID().split('-')[0];
}

/**
 * Generates a secure nonce for wallet signing
 * @returns {string} Secure nonce string
 */
export function generateSecureNonce(): string {
  const uuid = generateUUID();
  const timestamp = Date.now().toString(36);
  return `${uuid}-${timestamp}`;
}

/**
 * Validates UUID format
 * @param {string} uuid - UUID string to validate
 * @returns {boolean} True if valid UUID format
 */
export function isValidUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

export default {
  generateUUID,
  generateShortUUID,
  generateSecureNonce,
  isValidUUID
};