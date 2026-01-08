import api from './api';
import encryptionService from './encryptionService';

export const chatService = {
    // Initialize encryption for a user
    initEncryption: async (userId) => {
        const result = await encryptionService.init(userId);

        // If new keys, upload public key to server
        if (result.isNew) {
            await api.post('/chat/public-key', { publicKey: result.publicKey });
        }

        return result;
    },

    // Upload public key to server
    uploadPublicKey: async (publicKey) => {
        const response = await api.post('/chat/public-key', { publicKey });
        return response.data;
    },

    // Get user's public key
    getPublicKey: async (userId) => {
        const response = await api.get(`/chat/public-key/${userId}`);
        return response.data;
    },

    // Get all conversations for current user
    getConversations: async () => {
        const response = await api.get('/chat/conversations');
        return response.data;
    },

    // Get single conversation by ID
    getConversationById: async (conversationId) => {
        const response = await api.get(`/chat/conversations/${conversationId}`);
        return response.data;
    },

    // Get hidden conversations
    getHiddenConversations: async () => {
        const response = await api.get('/chat/conversations/hidden');
        return response.data;
    },

    // Restore (unhide) conversation
    restoreConversation: async (conversationId) => {
        const response = await api.put(`/chat/conversations/${conversationId}/restore`);
        return response.data;
    },

    // Hard delete conversation (clear history)
    hardDeleteConversation: async (conversationId) => {
        const response = await api.delete(`/chat/conversations/${conversationId}/hard`);
        return response.data;
    },

    // Create or get existing conversation
    createConversation: async (recipientId, productId = null, clearProduct = false) => {
        const response = await api.post('/chat/conversations', { recipientId, productId, clearProduct });
        return response.data;
    },

    // Get messages for a conversation (with decryption)
    getMessages: async (conversationId) => {
        const response = await api.get(`/chat/conversations/${conversationId}/messages`);
        const messages = response.data?.data || [];

        // Decrypt messages
        const decryptedMessages = await Promise.all(
            messages.map(async (msg) => {
                let decryptedMsg = { ...msg };

                // Decrypt main message content
                if (msg.encrypted && msg.ciphertext) {
                    // If message has session key, try to store it
                    // This will only succeed if the key was encrypted for us (we're the recipient)
                    // It will fail silently if we're the sender (key encrypted for recipient)
                    if (msg.sessionKey) {
                        try {
                            await encryptionService.storeSessionKey(conversationId, msg.sessionKey);
                        } catch {
                            // Expected: Session key is encrypted for the other user, not us
                        }
                    }

                    try {
                        const { content } = await encryptionService.decryptMessage(
                            { ciphertext: msg.ciphertext, iv: msg.iv },
                            conversationId
                        );
                        decryptedMsg = { ...decryptedMsg, content, _encrypted: true };
                    } catch (e) {
                        console.warn('Failed to decrypt message:', e);
                    }
                }

                // Decrypt replyTo content if encrypted
                if (msg.replyTo?.encrypted && msg.replyTo?.ciphertext) {
                    try {
                        const { content: replyContent } = await encryptionService.decryptMessage(
                            { ciphertext: msg.replyTo.ciphertext, iv: msg.replyTo.iv },
                            conversationId
                        );
                        decryptedMsg = {
                            ...decryptedMsg,
                            replyTo: { ...msg.replyTo, content: replyContent, _encrypted: true }
                        };
                    } catch (e) {
                        console.warn('Failed to decrypt replyTo message:', e);
                    }
                }

                return decryptedMsg;
            })
        );

        return { ...response.data, data: decryptedMessages };
    },

    // Send a message (with encryption)
    sendMessage: async (conversationId, content, replyToId = null, recipientPublicKey = null) => {
        let payload = { content, replyToId };

        // Encrypt if we have recipient's public key
        if (recipientPublicKey) {
            try {
                const encryptedPayload = await encryptionService.prepareEncryptedPayload(
                    content,
                    conversationId,
                    recipientPublicKey
                );
                payload = { ...payload, ...encryptedPayload };
            } catch (error) {
                console.error('Encryption failed, sending unencrypted:', error);
            }
        }

        const response = await api.post(`/chat/conversations/${conversationId}/messages`, payload);
        return response.data;
    },

    // Send image message (unencrypted - fallback)
    sendImageMessage: async (conversationId, formData) => {
        const response = await api.post(`/chat/conversations/${conversationId}/image`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    },

    // Send encrypted image message with optional caption
    sendEncryptedImageMessage: async (conversationId, file, recipientPublicKey, caption = null) => {
        try {
            const encryptedPayload = await encryptionService.prepareEncryptedImagePayload(
                file,
                conversationId,
                recipientPublicKey
            );

            // If caption provided, encrypt it too
            if (caption && caption.trim()) {
                try {
                    const encryptedCaption = await encryptionService.prepareEncryptedPayload(
                        caption.trim(),
                        conversationId,
                        recipientPublicKey
                    );
                    encryptedPayload.ciphertext = encryptedCaption.ciphertext;
                    encryptedPayload.iv = encryptedCaption.iv;
                } catch (e) {
                    // Fallback to unencrypted caption
                    encryptedPayload.content = caption.trim();
                }
            }

            const response = await api.post(`/chat/conversations/${conversationId}/encrypted-image`, encryptedPayload);
            return response.data;
        } catch (error) {
            console.error('Failed to send encrypted image:', error);
            throw error;
        }
    },

    // Mark messages as read
    markAsRead: async (conversationId) => {
        const response = await api.put(`/chat/conversations/${conversationId}/read`);
        return response.data;
    },

    // Get total unread count
    getUnreadCount: async () => {
        const response = await api.get('/chat/unread');
        return response.data;
    },

    // Decrypt a single message
    decryptMessage: async (message, conversationId) => {
        if (message.encrypted && message.ciphertext) {
            if (message.sessionKey) {
                try {
                    await encryptionService.storeSessionKey(conversationId, message.sessionKey);
                } catch {
                    // Expected: Session key is encrypted for the other user, not us
                }
            }

            const { content } = await encryptionService.decryptMessage(
                { ciphertext: message.ciphertext, iv: message.iv },
                conversationId
            );
            return { ...message, content, _encrypted: true };
        }
        return message;
    },

    // Delete a message (soft delete)
    deleteMessage: async (messageId) => {
        const response = await api.delete(`/chat/messages/${messageId}`);
        return response.data;
    },

    // Hide/delete a conversation (will reappear if new message arrives)
    deleteConversation: async (conversationId) => {
        const response = await api.delete(`/chat/conversations/${conversationId}`);
        return response.data;
    },

    // Search messages
    searchMessages: async (query, conversationId = null) => {
        const params = { q: query };
        if (conversationId) params.conversationId = conversationId;
        const response = await api.get('/chat/search', { params });
        return response.data;
    },


    // Send typing indicator
    sendTyping: async (conversationId, isTyping = true) => {
        const response = await api.post(`/chat/conversations/${conversationId}/typing`, {
            isTyping,
        });
        return response.data;
    },

    // Get encryption service instance
    getEncryptionService: () => encryptionService,
};

export default chatService;
