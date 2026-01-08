import { useState, useEffect, useCallback } from 'react';
import { X, Lock } from 'lucide-react';
import useAuthStore from '../store/authStore';
import socketService from '../services/socketService';
import { getActiveConversation } from '../services/chatState';
import encryptionService from '../services/encryptionService';

function ChatNotification() {
    const { isAuthenticated, user, token } = useAuthStore();
    const [notifications, setNotifications] = useState([]);

    const playNotificationSound = useCallback(() => {
        try {
            // Create a simple beep sound using Web Audio API
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);

            oscillator.frequency.value = 800;
            oscillator.type = 'sine';

            gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);

            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.3);
        } catch {
            // Silent fail if audio not supported
        }
    }, []);

    useEffect(() => {
        if (!isAuthenticated || !token) return;

        // Connect socket if not connected
        socketService.connect(token);

        // Listen for message notifications
        const unsubscribe = socketService.on('message_notification', async (data) => {
            const { message, conversationId } = data;

            // Don't show notification for own messages
            if (message.sender._id === user?._id) return;

            // Don't show notification if this conversation is currently open
            if (getActiveConversation() === conversationId) return;

            // Try to decrypt message if encrypted
            let displayContent = message.content;
            const isEncrypted = message.encrypted && message.ciphertext;

            if (isEncrypted) {
                try {
                    // Try to decrypt using stored session key
                    const result = await encryptionService.decryptMessage(
                        { ciphertext: message.ciphertext, iv: message.iv },
                        conversationId
                    );
                    displayContent = result.decrypted ? result.content : 'Pesan baru';
                } catch {
                    displayContent = 'Pesan baru';
                }
            }

            // Prevent duplicate notifications for the same message
            setNotifications(prev => {
                // Check if we already have a notification for this message
                if (prev.some(n => n.messageId === message._id)) return prev;

                // Create notification
                const notification = {
                    id: Date.now(),
                    messageId: message._id,
                    senderName: message.sender.nama || 'Seseorang',
                    senderAvatar: message.sender.avatar,
                    content: displayContent || 'Pesan baru',
                    isEncrypted: isEncrypted,
                    conversationId: conversationId,
                };

                // Play notification sound
                playNotificationSound();

                // Auto remove after 5 seconds
                setTimeout(() => {
                    setNotifications(p => p.filter(n => n.id !== notification.id));
                }, 5000);

                return [...prev, notification];
            });
        });

        return () => {
            unsubscribe();
        };
    }, [isAuthenticated, token, user?._id, playNotificationSound]);

    const handleNotificationClick = (notification) => {
        // Open chat bubble with this conversation
        window.dispatchEvent(new CustomEvent('openChatWithConversation', {
            detail: { conversationId: notification.conversationId }
        }));

        // Remove this notification
        setNotifications(prev => prev.filter(n => n.id !== notification.id));
    };

    const removeNotification = (id, e) => {
        e.stopPropagation();
        setNotifications(prev => prev.filter(n => n.id !== id));
    };

    if (notifications.length === 0) return null;

    return (
        <div className="fixed bottom-24 left-4 z-[60] flex flex-col-reverse gap-2 max-w-sm">
            {notifications.map((notification) => (
                <div
                    key={notification.id}
                    onClick={() => handleNotificationClick(notification)}
                    className="bg-white rounded-xl shadow-2xl border border-slate-200 p-4 cursor-pointer hover:shadow-xl transition-all animate-slide-in-left relative"
                >
                    <div className="flex items-start gap-3">
                        {/* Avatar */}
                        {notification.senderAvatar ? (
                            <img
                                src={notification.senderAvatar}
                                alt={notification.senderName}
                                className="size-10 rounded-full object-cover shrink-0"
                                referrerPolicy="no-referrer"
                            />
                        ) : (
                            <div className="size-10 rounded-full bg-gradient-to-br from-[#0d59f2] to-blue-400 flex items-center justify-center text-white font-bold shrink-0">
                                {notification.senderName.charAt(0).toUpperCase()}
                            </div>
                        )}

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2">
                                <p className="font-bold text-slate-900 text-sm">{notification.senderName}</p>
                                <button
                                    onClick={(e) => removeNotification(notification.id, e)}
                                    className="text-slate-400 hover:text-slate-600 p-1"
                                >
                                    <X className="w-3 h-3" />
                                </button>
                            </div>
                            <p className="text-sm text-slate-600 truncate">
                                {notification.isEncrypted && (
                                    <Lock className="w-2.5 h-2.5 inline mr-1 text-emerald-500" />
                                )}
                                {notification.content}
                            </p>
                            <p className="text-[10px] text-[#0d59f2] mt-1 font-medium">Klik untuk membuka chat</p>
                        </div>
                    </div>

                    {/* New message indicator */}
                    <div className="absolute top-2 left-2">
                        <span className="flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#0d59f2] opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#0d59f2]"></span>
                        </span>
                    </div>
                </div>
            ))}
        </div>
    );
}

export default ChatNotification;
