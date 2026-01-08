import { io } from 'socket.io-client';

const getSocketURL = () => {
    if (import.meta.env.VITE_API_URL) {
        return import.meta.env.VITE_API_URL.replace('/api', '');
    }
    const hostname = window.location.hostname;
    return `http://${hostname}:5000`;
};

class SocketService {
    socket = null;
    listeners = new Map();

    connect(token) {
        if (this.socket) return;

        this.socket = io(getSocketURL(), {
            auth: { token },
            transports: ['websocket', 'polling'],
        });

        this.socket.on('connect', () => {
            console.log('🔌 Socket connected');
        });

        this.socket.on('disconnect', () => {
            console.log('🔌 Socket disconnected');
        });

        this.socket.on('connect_error', (error) => {
            console.error('Socket connection error:', error.message);
        });

        // Re-emit events to registered listeners
        this.socket.onAny((eventName, ...args) => {
            const callbacks = this.listeners.get(eventName);
            if (callbacks) {
                callbacks.forEach(callback => callback(...args));
            }
        });
    }

    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
        }
    }

    // Join a conversation room
    joinConversation(conversationId) {
        if (this.socket?.connected) {
            this.socket.emit('join_conversation', conversationId);
        }
    }

    // Leave a conversation room
    leaveConversation(conversationId) {
        if (this.socket?.connected) {
            this.socket.emit('leave_conversation', conversationId);
        }
    }

    // Send a message via WebSocket (with E2E encryption support)
    sendMessage(conversationId, content, replyToId = null, encryptedData = null) {
        if (this.socket?.connected) {
            const payload = { conversationId, content, replyToId };

            // Add encryption data if provided
            if (encryptedData) {
                payload.encrypted = encryptedData.encrypted;
                payload.ciphertext = encryptedData.ciphertext;
                payload.iv = encryptedData.iv;
                payload.sessionKey = encryptedData.sessionKey;
            }

            this.socket.emit('send_message', payload);
            return true;
        }
        return false;
    }

    // Typing indicators
    startTyping(conversationId) {
        if (this.socket?.connected) {
            this.socket.emit('typing', { conversationId });
        }
    }

    stopTyping(conversationId) {
        if (this.socket?.connected) {
            this.socket.emit('stop_typing', { conversationId });
        }
    }

    // Mark messages as read
    markAsRead(conversationId) {
        if (this.socket?.connected) {
            this.socket.emit('mark_as_read', { conversationId });
        }
    }

    // Register event listener
    on(event, callback) {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, new Set());
        }
        this.listeners.get(event).add(callback);

        // Return unsubscribe function
        return () => {
            this.listeners.get(event)?.delete(callback);
        };
    }

    // Remove event listener
    off(event, callback) {
        this.listeners.get(event)?.delete(callback);
    }

    // Check if connected
    isConnected() {
        return this.socket?.connected || false;
    }
}

// Singleton instance
const socketService = new SocketService();
export default socketService;
