/**
 * End-to-End Encryption Service
 * Uses Web Crypto API for secure message encryption
 * 
 * Flow:
 * 1. Each user generates RSA key pair (public/private)
 * 2. Public key stored on server, private key in localStorage
 * 3. For each conversation, generate AES session key
 * 4. AES key encrypted with recipient's public key
 * 5. Messages encrypted with AES key
 */

const ALGORITHM = {
    RSA: {
        name: 'RSA-OAEP',
        modulusLength: 2048,
        publicExponent: new Uint8Array([1, 0, 1]),
        hash: 'SHA-256',
    },
    AES: {
        name: 'AES-GCM',
        length: 256,
    },
};

// Helper: Convert ArrayBuffer to Base64
const arrayBufferToBase64 = (buffer) => {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
};

// Helper: Convert Base64 to ArrayBuffer
const base64ToArrayBuffer = (base64) => {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
    }
    return bytes.buffer;
};

// Helper: Generate random IV for AES
const generateIV = () => {
    return crypto.getRandomValues(new Uint8Array(12));
};

class EncryptionService {
    constructor() {
        this.privateKey = null;
        this.publicKey = null;
        this.sessionKeys = new Map(); // conversationId -> AES key
    }

    /**
     * Initialize encryption - load or generate keys
     */
    async init(userId) {
        try {
            // Try to load existing keys from localStorage
            const storedKeys = localStorage.getItem(`e2e_keys_${userId}`);

            if (storedKeys) {
                const { publicKey, privateKey } = JSON.parse(storedKeys);
                this.publicKey = await this.importPublicKey(publicKey);
                this.privateKey = await this.importPrivateKey(privateKey);
                return { publicKey, isNew: false };
            }

            // Generate new key pair
            const keyPair = await this.generateKeyPair();
            const exportedPublic = await this.exportPublicKey(keyPair.publicKey);
            const exportedPrivate = await this.exportPrivateKey(keyPair.privateKey);

            // Store in localStorage
            localStorage.setItem(`e2e_keys_${userId}`, JSON.stringify({
                publicKey: exportedPublic,
                privateKey: exportedPrivate,
            }));

            this.publicKey = keyPair.publicKey;
            this.privateKey = keyPair.privateKey;

            return { publicKey: exportedPublic, isNew: true };
        } catch (error) {
            console.error('Failed to initialize encryption:', error);
            throw error;
        }
    }

    /**
     * Generate RSA key pair
     */
    async generateKeyPair() {
        return await crypto.subtle.generateKey(
            ALGORITHM.RSA,
            true, // extractable
            ['encrypt', 'decrypt']
        );
    }

    /**
     * Export public key to JWK format
     */
    async exportPublicKey(key) {
        const exported = await crypto.subtle.exportKey('jwk', key);
        return JSON.stringify(exported);
    }

    /**
     * Export private key to JWK format
     */
    async exportPrivateKey(key) {
        const exported = await crypto.subtle.exportKey('jwk', key);
        return JSON.stringify(exported);
    }

    /**
     * Import public key from JWK
     */
    async importPublicKey(jwkString) {
        const jwk = JSON.parse(jwkString);
        return await crypto.subtle.importKey(
            'jwk',
            jwk,
            ALGORITHM.RSA,
            true,
            ['encrypt']
        );
    }

    /**
     * Import private key from JWK
     */
    async importPrivateKey(jwkString) {
        const jwk = JSON.parse(jwkString);
        return await crypto.subtle.importKey(
            'jwk',
            jwk,
            ALGORITHM.RSA,
            true,
            ['decrypt']
        );
    }

    /**
     * Generate AES session key for a conversation
     */
    async generateSessionKey() {
        return await crypto.subtle.generateKey(
            ALGORITHM.AES,
            true,
            ['encrypt', 'decrypt']
        );
    }

    /**
     * Export AES key to raw format
     */
    async exportSessionKey(key) {
        const exported = await crypto.subtle.exportKey('raw', key);
        return arrayBufferToBase64(exported);
    }

    /**
     * Import AES key from raw format
     */
    async importSessionKey(base64Key) {
        const keyBuffer = base64ToArrayBuffer(base64Key);
        return await crypto.subtle.importKey(
            'raw',
            keyBuffer,
            ALGORITHM.AES,
            true,
            ['encrypt', 'decrypt']
        );
    }

    /**
     * Encrypt session key with recipient's public key
     */
    async encryptSessionKey(sessionKey, recipientPublicKey) {
        const exportedKey = await crypto.subtle.exportKey('raw', sessionKey);
        const publicKey = typeof recipientPublicKey === 'string'
            ? await this.importPublicKey(recipientPublicKey)
            : recipientPublicKey;

        const encrypted = await crypto.subtle.encrypt(
            { name: 'RSA-OAEP' },
            publicKey,
            exportedKey
        );

        return arrayBufferToBase64(encrypted);
    }

    /**
     * Decrypt session key with own private key
     */
    async decryptSessionKey(encryptedKey) {
        if (!this.privateKey) {
            throw new Error('Private key not initialized');
        }

        const keyBuffer = base64ToArrayBuffer(encryptedKey);
        const decrypted = await crypto.subtle.decrypt(
            { name: 'RSA-OAEP' },
            this.privateKey,
            keyBuffer
        );

        return await crypto.subtle.importKey(
            'raw',
            decrypted,
            ALGORITHM.AES,
            true,
            ['encrypt', 'decrypt']
        );
    }

    /**
     * Get or create session key for a conversation
     */
    async getSessionKey(conversationId, recipientPublicKey = null) {
        // Check if we already have a session key
        if (this.sessionKeys.has(conversationId)) {
            return this.sessionKeys.get(conversationId);
        }

        // Check localStorage for stored session key
        const storedKey = localStorage.getItem(`e2e_session_${conversationId}`);
        if (storedKey) {
            try {
                const sessionKey = await this.importSessionKey(storedKey);
                this.sessionKeys.set(conversationId, sessionKey);
                return sessionKey;
            } catch (e) {
                console.warn('Failed to import stored session key:', e);
            }
        }

        // Generate new session key if we have recipient's public key
        if (recipientPublicKey) {
            const sessionKey = await this.generateSessionKey();
            const exportedKey = await this.exportSessionKey(sessionKey);

            // Store locally
            localStorage.setItem(`e2e_session_${conversationId}`, exportedKey);
            this.sessionKeys.set(conversationId, sessionKey);

            return sessionKey;
        }

        return null;
    }

    /**
     * Store session key received from another user
     */
    async storeSessionKey(conversationId, encryptedSessionKey) {
        try {
            const sessionKey = await this.decryptSessionKey(encryptedSessionKey);
            const exportedKey = await this.exportSessionKey(sessionKey);

            localStorage.setItem(`e2e_session_${conversationId}`, exportedKey);
            this.sessionKeys.set(conversationId, sessionKey);

            return sessionKey;
        } catch (error) {
            // This error is expected when the session key is encrypted for the other user
            // The sender cannot decrypt a key they encrypted for the recipient
            // Only log in debug mode, not as error
            if (process.env.NODE_ENV === 'development' && error.name !== 'OperationError') {
                console.warn('Failed to store session key (may be encrypted for other user):', error.message);
            }
            throw error;
        }
    }

    /**
     * Encrypt a message
     */
    async encryptMessage(message, conversationId) {
        const sessionKey = this.sessionKeys.get(conversationId);
        if (!sessionKey) {
            throw new Error('No session key for conversation');
        }

        const iv = generateIV();
        const encoder = new TextEncoder();
        const messageBuffer = encoder.encode(message);

        const encrypted = await crypto.subtle.encrypt(
            { name: 'AES-GCM', iv },
            sessionKey,
            messageBuffer
        );

        return {
            ciphertext: arrayBufferToBase64(encrypted),
            iv: arrayBufferToBase64(iv),
        };
    }

    /**
     * Decrypt a message
     */
    async decryptMessage(encryptedData, conversationId) {
        try {
            let sessionKey = this.sessionKeys.get(conversationId);

            // Try to load from localStorage if not in memory
            if (!sessionKey) {
                const storedKey = localStorage.getItem(`e2e_session_${conversationId}`);
                if (storedKey) {
                    sessionKey = await this.importSessionKey(storedKey);
                    this.sessionKeys.set(conversationId, sessionKey);
                }
            }

            if (!sessionKey) {
                return { decrypted: false, content: '[Pesan terenkripsi - kunci tidak tersedia]' };
            }

            const ciphertext = base64ToArrayBuffer(encryptedData.ciphertext);
            const iv = base64ToArrayBuffer(encryptedData.iv);

            const decrypted = await crypto.subtle.decrypt(
                { name: 'AES-GCM', iv },
                sessionKey,
                ciphertext
            );

            const decoder = new TextDecoder();
            return { decrypted: true, content: decoder.decode(decrypted) };
        } catch (error) {
            // OperationError is expected when trying to decrypt with wrong key (e.g., keys regenerated)
            // Only log unexpected errors
            if (error.name !== 'OperationError') {
                console.error('Decryption failed:', error);
            }
            return { decrypted: false, content: '[Gagal mendekripsi pesan]' };
        }
    }

    /**
     * Prepare encrypted message payload for sending
     */
    async prepareEncryptedPayload(content, conversationId, recipientPublicKey) {
        // Ensure we have a session key
        let sessionKey = await this.getSessionKey(conversationId, recipientPublicKey);

        if (!sessionKey && recipientPublicKey) {
            sessionKey = await this.generateSessionKey();
            const exportedKey = await this.exportSessionKey(sessionKey);
            localStorage.setItem(`e2e_session_${conversationId}`, exportedKey);
            this.sessionKeys.set(conversationId, sessionKey);
        }

        if (!sessionKey) {
            throw new Error('Cannot create session key without recipient public key');
        }

        // Encrypt the message
        const encrypted = await this.encryptMessage(content, conversationId);

        // Encrypt session key for recipient (include with first message or periodically)
        let encryptedSessionKey = null;
        if (recipientPublicKey) {
            encryptedSessionKey = await this.encryptSessionKey(sessionKey, recipientPublicKey);
        }

        return {
            encrypted: true,
            ciphertext: encrypted.ciphertext,
            iv: encrypted.iv,
            sessionKey: encryptedSessionKey,
        };
    }

    /**
     * Clear all stored keys (for logout)
     */
    clearKeys(userId) {
        localStorage.removeItem(`e2e_keys_${userId}`);
        // Clear all session keys
        for (const key of Object.keys(localStorage)) {
            if (key.startsWith('e2e_session_')) {
                localStorage.removeItem(key);
            }
        }
        this.privateKey = null;
        this.publicKey = null;
        this.sessionKeys.clear();
    }

    /**
     * Get public key string for sharing
     */
    async getPublicKeyString() {
        if (!this.publicKey) return null;
        return await this.exportPublicKey(this.publicKey);
    }

    /**
     * Encrypt an image file
     * @param {File} file - Image file to encrypt
     * @param {string} conversationId - Conversation ID
     * @returns {Promise<{encryptedData: string, iv: string, mimeType: string, fileName: string}>}
     */
    async encryptImage(file, conversationId) {
        const sessionKey = this.sessionKeys.get(conversationId);
        if (!sessionKey) {
            throw new Error('No session key for conversation');
        }

        // Read file as ArrayBuffer
        const arrayBuffer = await file.arrayBuffer();

        const iv = generateIV();

        const encrypted = await crypto.subtle.encrypt(
            { name: 'AES-GCM', iv },
            sessionKey,
            arrayBuffer
        );

        return {
            encryptedData: arrayBufferToBase64(encrypted),
            iv: arrayBufferToBase64(iv),
            mimeType: file.type,
            fileName: file.name,
        };
    }

    /**
     * Decrypt an image
     * @param {string} encryptedData - Base64 encrypted image data
     * @param {string} iv - Base64 IV
     * @param {string} conversationId - Conversation ID
     * @param {string} mimeType - Original MIME type
     * @returns {Promise<string>} - Blob URL for the decrypted image
     */
    async decryptImage(encryptedData, iv, conversationId, mimeType = 'image/jpeg') {
        try {
            let sessionKey = this.sessionKeys.get(conversationId);

            // Try to load from localStorage if not in memory
            if (!sessionKey) {
                const storedKey = localStorage.getItem(`e2e_session_${conversationId}`);
                if (storedKey) {
                    sessionKey = await this.importSessionKey(storedKey);
                    this.sessionKeys.set(conversationId, sessionKey);
                }
            }

            if (!sessionKey) {
                throw new Error('No session key available');
            }

            const ciphertextBuffer = base64ToArrayBuffer(encryptedData);
            const ivBuffer = base64ToArrayBuffer(iv);

            const decrypted = await crypto.subtle.decrypt(
                { name: 'AES-GCM', iv: ivBuffer },
                sessionKey,
                ciphertextBuffer
            );

            // Create blob and return URL
            const blob = new Blob([decrypted], { type: mimeType });
            return URL.createObjectURL(blob);
        } catch (error) {
            console.error('Image decryption failed:', error);
            throw error;
        }
    }

    /**
     * Prepare encrypted image payload for sending
     */
    async prepareEncryptedImagePayload(file, conversationId, recipientPublicKey) {
        // Ensure we have a session key
        let sessionKey = await this.getSessionKey(conversationId, recipientPublicKey);

        if (!sessionKey && recipientPublicKey) {
            sessionKey = await this.generateSessionKey();
            const exportedKey = await this.exportSessionKey(sessionKey);
            localStorage.setItem(`e2e_session_${conversationId}`, exportedKey);
            this.sessionKeys.set(conversationId, sessionKey);
        }

        if (!sessionKey) {
            throw new Error('Cannot create session key without recipient public key');
        }

        // Encrypt the image
        const encrypted = await this.encryptImage(file, conversationId);

        // Encrypt session key for recipient
        let encryptedSessionKey = null;
        if (recipientPublicKey) {
            encryptedSessionKey = await this.encryptSessionKey(sessionKey, recipientPublicKey);
        }

        return {
            encrypted: true,
            encryptedImageData: encrypted.encryptedData,
            imageIv: encrypted.iv,
            imageMimeType: encrypted.mimeType,
            imageFileName: encrypted.fileName,
            sessionKey: encryptedSessionKey,
        };
    }
}

const encryptionService = new EncryptionService();
export default encryptionService;
