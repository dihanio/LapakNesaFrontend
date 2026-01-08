import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
    X, MessageSquare, User, Image, ArrowLeft, BadgeCheck, Search, Bell, BellOff,
    Minimize2, Maximize2, MessagesSquare, Loader2, WifiOff, Lock, Smile, Camera,
    Send, Trash2, Undo2, Copy, Ban, ChevronRight, Pin
} from 'lucide-react';
import useAuthStore from '../store/authStore';
import chatService from '../services/chatService';
import socketService from '../services/socketService';
import encryptionService from '../services/encryptionService';
import { setActiveConversation } from '../services/chatState';
import { formatLastActive, formatTime, formatDateGroup, groupMessagesByDate, parseLinks } from '../utils/chatUtils.jsx';

import { EMOJI_CATEGORIES } from './chat/emojiData';
import EmojiPicker from './chat/EmojiPicker';
import MessageItem from './chat/MessageItem';
import EncryptedImageMessage from './chat/EncryptedImageMessage';
import ConversationList from './chat/ConversationList';
import CameraCapture from './chat/CameraCapture';
import ImageViewer from './chat/ImageViewer';
import ConfirmDialog from './chat/ConfirmDialog';





function ChatBubble() {
    const { user, isAuthenticated, token } = useAuthStore();
    const [isOpen, setIsOpen] = useState(false);
    const [conversations, setConversations] = useState([]);
    const [selectedConversation, setSelectedConversation] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [sending, setSending] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isTyping, setIsTyping] = useState(false);
    const [socketConnected, setSocketConnected] = useState(false);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [replyTo, setReplyTo] = useState(null);
    const [contextMenu, setContextMenu] = useState({ show: false, x: 0, y: 0, message: null });
    const [conversationContextMenu, setConversationContextMenu] = useState({ show: false, x: 0, y: 0, conversation: null });
    const [deletingConversation, setDeletingConversation] = useState(null);
    const [justDeletedConversation, setJustDeletedConversation] = useState(null); // Backup for undo
    const undoTimeoutRef = useRef(null);
    const [viewMode, setViewMode] = useState('active'); // 'active' or 'archived'
    const [selectedImage, setSelectedImage] = useState(null);
    const [uploadingImage, setUploadingImage] = useState(false);
    const [viewImage, setViewImage] = useState(null);
    const [emojiCategory, setEmojiCategory] = useState('smileys');
    const [loadingMessages, setLoadingMessages] = useState(false);
    const [showProductCard, setShowProductCard] = useState(true);
    const [showCamera, setShowCamera] = useState(false);

    const [isDragging, setIsDragging] = useState(false); // Drag and drop state
    const [partnerTyping, setPartnerTyping] = useState(false); // Typing indicator from partner
    const [searchQuery, setSearchQuery] = useState(''); // Search conversations
    const [messageSearchQuery, setMessageSearchQuery] = useState(''); // Search within messages
    const [showMessageSearch, setShowMessageSearch] = useState(false); // Toggle message search UI
    const [isExpanded, setIsExpanded] = useState(false); // Expanded/fullscreen mode
    const [soundEnabled, setSoundEnabled] = useState(() => {
        // Load from localStorage, default true
        const saved = localStorage.getItem('chatSoundEnabled');
        return saved !== null ? saved === 'true' : true;
    });
    const [pinnedConversations, setPinnedConversations] = useState(() => {
        // Load pinned conversations from localStorage
        const saved = localStorage.getItem('pinnedConversations');
        return saved ? JSON.parse(saved) : [];
    });
    const messagesEndRef = useRef(null);
    const notificationAudioRef = useRef(null);
    const typingTimeoutRef = useRef(null);
    const prevConversationRef = useRef(null);
    const fileInputRef = useRef(null);
    const emojiPickerRef = useRef(null);
    const selectedConversationRef = useRef(null);
    const typingSentRef = useRef(false); // Track if typing indicator was sent
    const loadConversationsTimeoutRef = useRef(null);
    const loadUnreadCountTimeoutRef = useRef(null);


    // Keep ref in sync with state for socket callbacks
    useEffect(() => {
        selectedConversationRef.current = selectedConversation;
    }, [selectedConversation]);

    // Save sound preference to localStorage
    useEffect(() => {
        localStorage.setItem('chatSoundEnabled', soundEnabled.toString());
    }, [soundEnabled]);

    // Save pinned conversations to localStorage
    useEffect(() => {
        localStorage.setItem('pinnedConversations', JSON.stringify(pinnedConversations));
    }, [pinnedConversations]);

    // Toggle pin conversation
    const togglePinConversation = useCallback((conversationId) => {
        setPinnedConversations(prev => {
            if (prev.includes(conversationId)) {
                return prev.filter(id => id !== conversationId);
            } else {
                return [...prev, conversationId];
            }
        });
    }, []);

    // Play notification sound
    const playNotificationSound = useCallback(() => {
        if (soundEnabled && notificationAudioRef.current) {
            notificationAudioRef.current.currentTime = 0;
            notificationAudioRef.current.play().catch(() => {
                // Ignore autoplay errors
            });
        }
    }, [soundEnabled]);

    const loadUnreadCount = useCallback(async () => {
        if (!isAuthenticated) return;
        try {
            const response = await chatService.getUnreadCount();
            setUnreadCount(response.data?.unreadCount || 0);
        } catch {
            // Silent fail
        }
    }, [isAuthenticated]);

    // Load conversations from API
    const loadConversations = useCallback(async () => {
        if (!isAuthenticated) return;
        try {
            setLoading(true);
            const response = viewMode === 'archived'
                ? await chatService.getHiddenConversations()
                : await chatService.getConversations();

            if (response.success) {
                setConversations(response.data);
            }
        } catch (error) {
            console.error('Failed to load conversations:', error);
        } finally {
            setLoading(false);
        }
    }, [viewMode, isAuthenticated]);

    // Initial load of conversations and unread count
    useEffect(() => {
        if (isAuthenticated) {
            loadConversations();
            loadUnreadCount();
        }
    }, [isAuthenticated, loadConversations, loadUnreadCount]);

    const loadMessages = useCallback(async (conversationId) => {
        if (!conversationId) return;
        setLoadingMessages(true);
        try {
            const response = await chatService.getMessages(conversationId);
            setMessages(response.data || []);
            loadUnreadCount();
        } catch {
            console.error('Failed to load messages');
        } finally {
            setLoadingMessages(false);
        }
    }, [loadUnreadCount]);

    // Connect to WebSocket when authenticated
    useEffect(() => {
        if (isAuthenticated && token) {
            socketService.connect(token);

            // Listen for connection status
            const checkConnection = setInterval(() => {
                setSocketConnected(socketService.isConnected());
            }, 1000);

            return () => {
                clearInterval(checkConnection);
            };
        }
        return () => {
            socketService.disconnect();
        };
    }, [isAuthenticated, token]);

    const debouncedLoadConversations = useCallback(() => {
        if (loadConversationsTimeoutRef.current) clearTimeout(loadConversationsTimeoutRef.current);
        loadConversationsTimeoutRef.current = setTimeout(loadConversations, 500);
    }, [loadConversations]);

    const debouncedLoadUnreadCount = useCallback(() => {
        if (loadUnreadCountTimeoutRef.current) clearTimeout(loadUnreadCountTimeoutRef.current);
        loadUnreadCountTimeoutRef.current = setTimeout(loadUnreadCount, 500);
    }, [loadUnreadCount]);

    // Listen for new messages via WebSocket
    useEffect(() => {
        const unsubNewMessage = socketService.on('new_message', async (data) => {
            // Use ref to get current value (avoids stale closure)
            const currentConversation = selectedConversationRef.current;

            if (currentConversation?._id === data.conversationId) {
                // Skip adding message if it's our own (already added optimistically)
                if (data.message.sender._id !== user?._id) {
                    // Decrypt message if encrypted
                    let processedMessage = { ...data.message };
                    if (data.message.encrypted && data.message.ciphertext) {
                        try {
                            // Store session key if provided
                            if (data.message.sessionKey) {
                                try {
                                    await encryptionService.storeSessionKey(data.conversationId, data.message.sessionKey);
                                } catch {
                                    // Session key might be for the other user
                                }
                            }

                            const { content } = await encryptionService.decryptMessage(
                                { ciphertext: data.message.ciphertext, iv: data.message.iv },
                                data.conversationId
                            );
                            processedMessage = { ...processedMessage, content, _encrypted: true };
                        } catch (e) {
                            console.warn('Failed to decrypt message:', e);
                        }
                    }

                    // Decrypt replyTo content if encrypted
                    if (data.message.replyTo?.encrypted && data.message.replyTo?.ciphertext) {
                        try {
                            const { content: replyContent } = await encryptionService.decryptMessage(
                                { ciphertext: data.message.replyTo.ciphertext, iv: data.message.replyTo.iv },
                                data.conversationId
                            );
                            processedMessage = {
                                ...processedMessage,
                                replyTo: { ...data.message.replyTo, content: replyContent, _encrypted: true }
                            };
                        } catch (e) {
                            console.warn('Failed to decrypt replyTo:', e);
                        }
                    }

                    setMessages(prev => {
                        // Avoid duplicates
                        if (prev.some(m => m._id === processedMessage._id)) return prev;
                        return [...prev, processedMessage];
                    });

                    // Play notification sound for new messages from others
                    playNotificationSound();

                    // Auto mark as read if user is viewing this conversation
                    socketService.markAsRead(data.conversationId);
                    // Also update via REST to ensure persistence
                    chatService.markAsRead(data.conversationId).catch(() => { });
                }
            } else {
                // Message for different conversation - play sound
                if (data.message.sender._id !== user?._id) {
                    playNotificationSound();
                }
            }
            debouncedLoadConversations(); // Update conversation list
            debouncedLoadUnreadCount(); // Update badge count
        });

        const unsubNotification = socketService.on('message_notification', () => {
            debouncedLoadUnreadCount();
            debouncedLoadConversations();
        });

        const unsubTyping = socketService.on('user_typing', (data) => {
            const currentConversation = selectedConversationRef.current;
            if (currentConversation?._id === data.conversationId && data.userId !== user?._id) {
                setIsTyping(true);
            }
        });

        const unsubStopTyping = socketService.on('user_stop_typing', (data) => {
            const currentConversation = selectedConversationRef.current;
            if (currentConversation?._id === data.conversationId) {
                setIsTyping(false);
            }
        });

        // Listen for user status changes (online/offline)
        const unsubStatusChange = socketService.on('user_status_change', (data) => {
            // Update conversations list with new status
            setConversations(prev => prev.map(conv => ({
                ...conv,
                participants: conv.participants.map(p =>
                    p._id === data.userId
                        ? { ...p, isOnline: data.isOnline, lastActive: data.lastActive || p.lastActive }
                        : p
                )
            })));

            // Update selected conversation if the other participant status changed
            setSelectedConversation(prev => prev ? ({
                ...prev,
                participants: prev.participants.map(p =>
                    p._id === data.userId
                        ? { ...p, isOnline: data.isOnline, lastActive: data.lastActive || p.lastActive }
                        : p
                )
            }) : prev);
        });

        // Listen for read receipts
        const unsubReadReceipt = socketService.on('messages_read', (data) => {
            const currentConversation = selectedConversationRef.current;
            if (currentConversation?._id === data.conversationId && data.readBy !== user?._id) {
                // Mark all own messages as read
                setMessages(prev => prev.map(msg =>
                    msg.sender._id === user?._id ? { ...msg, read: true } : msg
                ));
            }
        });

        // Listen for typing indicator (from API-based typing)
        const unsubTypingIndicator = socketService.on('typing_indicator', (data) => {
            const currentConversation = selectedConversationRef.current;
            if (currentConversation?._id === data.conversationId && data.userId !== user?._id) {
                setPartnerTyping(data.isTyping);
                // Auto-clear typing after 3 seconds
                if (data.isTyping) {
                    setTimeout(() => setPartnerTyping(false), 3000);
                }
            }
        });

        // Listen for message deletion
        const unsubMessageDeleted = socketService.on('message_deleted', (data) => {
            const currentConversation = selectedConversationRef.current;
            if (currentConversation?._id === data.conversationId) {
                setMessages(prev => prev.map(msg =>
                    msg._id === data.messageId
                        ? { ...msg, isDeleted: true, content: null, image: null }
                        : msg
                ));
            }
        });

        return () => {
            unsubNewMessage();
            unsubNotification();
            unsubTyping();
            unsubStopTyping();
            unsubStatusChange();
            unsubReadReceipt();
            unsubTypingIndicator();
            unsubMessageDeleted();
        };
    }, [user?._id, debouncedLoadConversations, debouncedLoadUnreadCount, playNotificationSound]);

    // Join/leave conversation room when selected conversation changes
    useEffect(() => {
        if (prevConversationRef.current) {
            socketService.leaveConversation(prevConversationRef.current);
        }
        if (selectedConversation?._id) {
            socketService.joinConversation(selectedConversation._id);
            loadMessages(selectedConversation._id);
            setActiveConversation(selectedConversation._id); // Track active conversation
            setShowProductCard(true); // Reset product card visibility when switching conversations

            // Mark messages as read when entering conversation
            socketService.markAsRead(selectedConversation._id);
            chatService.markAsRead(selectedConversation._id).catch(() => { });
        } else {
            setActiveConversation(null);
        }
        prevConversationRef.current = selectedConversation?._id;

        const conversationIdForCleanup = selectedConversation?._id;
        return () => {
            if (conversationIdForCleanup) {
                socketService.leaveConversation(conversationIdForCleanup);
                setActiveConversation(null);
            }
        };
    }, [selectedConversation?._id, loadMessages]);

    // Listen for custom event to open chat bubble
    useEffect(() => {
        const handleOpenChat = () => {
            setIsOpen(true);
            loadConversations();
        };

        const handleOpenChatWithConversation = async (event) => {
            const { conversation, conversationId, prefillMessage } = event.detail || {};
            setIsOpen(true);
            await loadConversations();

            let targetConversation = conversation;

            if (!targetConversation && conversationId) {
                // Try to fetch fresh conversations and find it
                try {
                    // Try searching in list first
                    const response = await chatService.getConversations();
                    const freshConversations = response.data || [];
                    setConversations(freshConversations);
                    targetConversation = freshConversations.find(c => c._id === conversationId);

                    // If still not found (e.g. deleted), fetch by ID directly
                    if (!targetConversation) {
                        try {
                            const singleResponse = await chatService.getConversationById(conversationId);
                            if (singleResponse && singleResponse.data) {
                                targetConversation = singleResponse.data;
                            }
                        } catch (err) {
                            console.error('Failed to fetch individual conversation:', err);
                        }
                    }
                } catch {
                    console.error('Failed to find conversation');
                }
            }

            if (targetConversation) {
                setSelectedConversation(targetConversation);
                // Always load messages when opening chat
                await loadMessages(targetConversation._id);
                // Set prefill message if provided
                if (prefillMessage) {
                    setNewMessage(prefillMessage);
                }
            }
        };

        window.addEventListener('openChatBubble', handleOpenChat);
        window.addEventListener('openChatWithConversation', handleOpenChatWithConversation);
        return () => {
            window.removeEventListener('openChatBubble', handleOpenChat);
            window.removeEventListener('openChatWithConversation', handleOpenChatWithConversation);
        };
    }, [loadConversations, loadMessages]);

    useEffect(() => {
        if (isAuthenticated) {
            loadUnreadCount();
            // Poll for unread count every 30 seconds (backup)
            const interval = setInterval(loadUnreadCount, 30000);
            return () => clearInterval(interval);
        }
    }, [isAuthenticated, loadUnreadCount]);

    useEffect(() => {
        if (isOpen && !selectedConversation) {
            loadConversations();
        }
    }, [isOpen, selectedConversation, loadConversations]);

    // Only scroll to bottom when opening a conversation (not on every message update)
    const hasScrolledRef = useRef(false);
    useEffect(() => {
        // Only scroll if we just selected a new conversation
        if (selectedConversation && !loadingMessages && messages.length > 0 && !hasScrolledRef.current) {
            messagesEndRef.current?.scrollIntoView({ behavior: 'auto' });
            hasScrolledRef.current = true;
        }
    }, [selectedConversation, loadingMessages, messages.length]);

    // Reset scroll flag when conversation changes
    useEffect(() => {
        hasScrolledRef.current = false;
    }, [selectedConversation?._id]);

    // Handle send message (with optional image)
    const isSubmittingRef = useRef(false);

    const handleSendMessage = async (e) => {
        e.preventDefault();

        // Must have either text or image
        if (!newMessage.trim() && !selectedImage) return;
        if (!selectedConversation || sending || uploadingImage) return;

        // Prevent double submission (React StrictMode protection)
        if (isSubmittingRef.current) return;
        isSubmittingRef.current = true;

        let messageContent = newMessage.trim();
        const replyToMessage = replyTo;
        const imageToSend = selectedImage;

        // Handle /wa slash command - replace with WhatsApp link
        if (messageContent.toLowerCase() === '/wa') {
            if (user?.whatsapp) {
                // Format WA number for link
                const waNumber = user.whatsapp.replace(/\D/g, '');
                messageContent = `📱 WhatsApp saya: wa.me/${waNumber}`;
            } else {
                // User hasn't set WA number
                alert('Kamu belum mengisi nomor WhatsApp di profil. Silakan lengkapi profil terlebih dahulu.');
                isSubmittingRef.current = false;
                return;
            }
        }

        setNewMessage('');
        setReplyTo(null);
        setSelectedImage(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }

        // Stop typing indicator
        if (selectedConversation._id) {
            socketService.stopTyping(selectedConversation._id);
        }

        // If we have an image, send image message (with optional caption)
        if (imageToSend) {
            setUploadingImage(true);
            try {
                const formData = new FormData();
                formData.append('image', imageToSend);
                if (messageContent) {
                    formData.append('content', messageContent);
                }
                const response = await chatService.sendImageMessage(selectedConversation._id, formData);
                // Add message from response (socket listener will skip own messages to prevent duplicates)
                setMessages(prev => [...prev, response.data]);
                loadConversations();
            } catch (error) {
                console.error('Failed to send image message:', error);
                alert('Gagal mengirim gambar');
                // Restore on error
                setNewMessage(messageContent);
                setSelectedImage(imageToSend);
            } finally {
                setUploadingImage(false);
                isSubmittingRef.current = false;
            }
            return;
        }

        // Text-only message
        setSending(true);
        try {
            // Try WebSocket first
            if (socketService.isConnected()) {
                // Optimistic update - add message to UI immediately
                const optimisticMessage = {
                    _id: `temp_${Date.now()}`,
                    content: messageContent,
                    sender: { _id: user._id, nama: user.nama, avatar: user.avatar },
                    createdAt: new Date().toISOString(),
                    replyTo: replyToMessage || null,
                    _optimistic: true, // Mark as optimistic
                };
                setMessages(prev => [...prev, optimisticMessage]);

                socketService.sendMessage(
                    selectedConversation._id,
                    messageContent,
                    replyToMessage?._id
                );
                loadConversations();
                // Add a delayed refresh to ensure "undeleted" conversations reappear if backend is slow
                setTimeout(() => loadConversations(), 1000);
                setSending(false);
                isSubmittingRef.current = false;
            } else {
                // Fallback to REST API
                const response = await chatService.sendMessage(
                    selectedConversation._id,
                    messageContent,
                    replyToMessage?._id
                );
                setMessages(prev => [...prev, response.data]);
                loadConversations();
                setSending(false);
                isSubmittingRef.current = false;
            }
        } catch (error) {
            console.error('Failed to send message:', error);
            setNewMessage(messageContent); // Restore message on error
            setReplyTo(replyToMessage);
            setSending(false);
            isSubmittingRef.current = false;
        }
    };

    const handleInputChange = (e) => {
        setNewMessage(e.target.value);

        // Send typing indicator via socket
        if (selectedConversation?._id && socketService.isConnected()) {
            socketService.startTyping(selectedConversation._id);

            // Clear existing timeout
            if (typingTimeoutRef.current) {
                clearTimeout(typingTimeoutRef.current);
            }

            // Stop typing after 2 seconds of no input
            typingTimeoutRef.current = setTimeout(() => {
                socketService.stopTyping(selectedConversation._id);
            }, 2000);
        }

        // Also send via API (for reliability)
        if (selectedConversation?._id && !typingSentRef.current) {
            typingSentRef.current = true;
            sendTypingIndicator(true);
            setTimeout(() => {
                typingSentRef.current = false;
                sendTypingIndicator(false);
            }, 2500);
        }
    };

    const getOtherParticipant = (conv) => {
        return conv.participants?.find(p => p._id !== user?._id);
    };



    const handleBack = () => {
        setSelectedConversation(null);
        setMessages([]);
        setReplyTo(null);
        setShowEmojiPicker(false);
    };



    // Handle emoji selection
    const handleEmojiSelect = (emoji) => {
        setNewMessage(prev => prev + emoji);
        setShowEmojiPicker(false);
    };

    // Handle image upload
    const handleImageSelect = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file
        if (!file.type.startsWith('image/')) {
            alert('Hanya file gambar yang diperbolehkan');
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            alert('Ukuran file maksimal 5MB');
            return;
        }

        setSelectedImage(file);
    };

    // Handle drag and drop for images
    const handleDragEnter = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        if (selectedConversation) {
            setIsDragging(true);
        }
    }, [selectedConversation]);

    const handleDragLeave = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        // Only set to false if we're leaving the drop zone (not entering a child element)
        if (e.currentTarget.contains(e.relatedTarget)) return;
        setIsDragging(false);
    }, []);

    const handleDragOver = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
    }, []);

    const handleDrop = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);

        if (!selectedConversation) return;

        const files = e.dataTransfer?.files;
        if (!files || files.length === 0) return;

        const file = files[0];

        // Validate file
        if (!file.type.startsWith('image/')) {
            alert('Hanya file gambar yang diperbolehkan');
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            alert('Ukuran file maksimal 5MB');
            return;
        }

        setSelectedImage(file);
    }, [selectedConversation]);

    // Note: Image sending is now handled by handleSendMessage

    // Cancel image selection
    const cancelImage = () => {
        setSelectedImage(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };


    // Handle message context menu
    const handleMessageContextMenu = (e, msg) => {
        e.preventDefault();
        setContextMenu({
            show: true,
            x: e.clientX,
            y: e.clientY,
            message: msg
        });
    };

    // Copy message to clipboard
    const copyMessage = (content) => {
        navigator.clipboard.writeText(content);
        setContextMenu({ show: false, x: 0, y: 0, message: null });
    };

    // Reply to message
    const handleReply = (msg) => {
        setReplyTo(msg);
        setContextMenu({ show: false, x: 0, y: 0, message: null });
    };

    // Cancel reply
    const cancelReply = () => {
        setReplyTo(null);
    };

    // Delete message handler
    const handleDeleteMessage = async (messageId) => {
        // Skip if it's a temporary ID (not yet saved to server)
        if (messageId.startsWith('temp_')) {
            // For temp messages, just remove from local state
            setMessages(prev => prev.filter(msg => msg._id !== messageId));
            setContextMenu({ show: false, x: 0, y: 0, message: null });
            return;
        }

        try {
            await chatService.deleteMessage(messageId);
            setMessages(prev => prev.map(msg =>
                msg._id === messageId
                    ? { ...msg, isDeleted: true, content: null, image: null }
                    : msg
            ));
            setContextMenu({ show: false, x: 0, y: 0, message: null });
        } catch (error) {
            console.error('Failed to delete message:', error);
            alert('Gagal menghapus pesan');
        }
    };

    // Delete conversation handler with Undo capability
    const handleDeleteConversation = async () => {
        if (!deletingConversation) return;

        const conversationToDelete = deletingConversation;

        // 1. Optimistic removal
        setConversations(prev => prev.filter(c => c._id !== conversationToDelete._id));
        setJustDeletedConversation(conversationToDelete);
        setDeletingConversation(null);

        // Close conversation if it was selected
        if (selectedConversation?._id === conversationToDelete._id) {
            setSelectedConversation(null);
            setMessages([]);
        }

        // 2. Set timeout for permanent deletion
        if (undoTimeoutRef.current) clearTimeout(undoTimeoutRef.current);

        undoTimeoutRef.current = setTimeout(async () => {
            try {
                await chatService.deleteConversation(conversationToDelete._id);
                setJustDeletedConversation(null);
            } catch (error) {
                console.error('Failed to delete conversation:', error);
                // Restore if failed
                loadConversations();
            }
        }, 5000); // 5 seconds to undo
    };

    const handleUndoDelete = () => {
        if (undoTimeoutRef.current) {
            clearTimeout(undoTimeoutRef.current);
            undoTimeoutRef.current = null;
        }

        if (justDeletedConversation) {
            setConversations(prev => {
                const updated = [...prev, justDeletedConversation];
                // Sort again
                return updated.sort((a, b) => new Date(b.lastMessageAt || 0) - new Date(a.lastMessageAt || 0));
            });
            setJustDeletedConversation(null);
        }
    };

    // Restore conversation handler
    const handleRestoreConversation = async (conversationId) => {
        try {
            await chatService.restoreConversation(conversationId);
            // Optimistic update
            setConversations(prev => prev.filter(c => c._id !== conversationId));

            // Show success toast (optional)
            // notify('Percakapan dipulihkan');
        } catch (error) {
            console.error('Failed to restore conversation:', error);
            alert('Gagal memulihkan chat');
        }
    };

    // Hard Delete (Clear History) handler
    const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, conversationId: null });
    const [archiveDialog, setArchiveDialog] = useState({ isOpen: false, conversation: null });

    const handleHardDeleteConversation = (conversationId) => {
        setConfirmDialog({ isOpen: true, conversationId });
    };

    const handleArchiveConversation = (conversation) => {
        setArchiveDialog({ isOpen: true, conversation });
    };

    const executeArchive = () => {
        if (!archiveDialog.conversation) return;
        setDeletingConversation(archiveDialog.conversation);
        setTimeout(() => handleDeleteConversation(), 0);
    };

    const executeHardDelete = async () => {
        const conversationId = confirmDialog.conversationId;
        if (!conversationId) return;

        try {
            await chatService.hardDeleteConversation(conversationId);
            setConversations(prev => prev.filter(c => c._id !== conversationId));
        } catch (error) {
            console.error('Failed to hard delete conversation:', error);
            alert('Gagal menghapus percakapan');
        }
    };

    // Send typing indicator
    const sendTypingIndicator = useCallback(async (typing) => {
        if (!selectedConversation?._id) return;
        try {
            await chatService.sendTyping(selectedConversation._id, typing);
        } catch {
            // Ignore errors for typing indicator
        }
    }, [selectedConversation?._id]);

    // Close context menu when clicking outside
    useEffect(() => {
        const handleClickOutside = () => {
            setContextMenu({ show: false, x: 0, y: 0, message: null });
        };
        if (contextMenu.show) {
            document.addEventListener('click', handleClickOutside);
            return () => document.removeEventListener('click', handleClickOutside);
        }
    }, [contextMenu.show]);

    // Close conversation context menu when clicking outside
    useEffect(() => {
        const handleClickOutside = () => {
            setConversationContextMenu({ show: false, x: 0, y: 0, conversation: null });
        };
        if (conversationContextMenu.show) {
            document.addEventListener('click', handleClickOutside);
            return () => document.removeEventListener('click', handleClickOutside);
        }
    }, [conversationContextMenu.show]);

    // Close emoji picker when clicking outside
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (emojiPickerRef.current && !emojiPickerRef.current.contains(e.target)) {
                setShowEmojiPicker(false);
            }
        };
        if (showEmojiPicker) {
            document.addEventListener('mousedown', handleClickOutside);
            return () => document.removeEventListener('mousedown', handleClickOutside);
        }
    }, [showEmojiPicker]);

    // Cleanup typing timeout on unmount
    useEffect(() => {
        return () => {
            if (typingTimeoutRef.current) {
                clearTimeout(typingTimeoutRef.current);
            }
        };
    }, []);

    // Cleanup object URL for image preview
    useEffect(() => {
        let objectUrl;
        if (selectedImage) {
            objectUrl = URL.createObjectURL(selectedImage);
        }
        return () => {
            if (objectUrl) {
                URL.revokeObjectURL(objectUrl);
            }
        };
    }, [selectedImage]);



    // Don't render if not authenticated
    if (!isAuthenticated || !user) return null;

    return (
        <>
            {/* Floating Pill Button - hidden on mobile when chat is open */}
            {/* Floating Pill Button - hidden on mobile when chat is open */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`group fixed bottom-6 right-6 z-50 transition-all duration-200 ${isOpen
                    ? 'size-14 bg-white text-slate-800 hover:bg-slate-50 border border-slate-100 rounded-full shadow-lg flex items-center justify-center hidden sm:flex'
                    : 'h-14 bg-gradient-to-r from-[#0d59f2] to-[#3b82f6] hover:shadow-blue-500/20 text-white rounded-full shadow-lg shadow-blue-500/20 pl-5 pr-2 flex items-center justify-between gap-6 min-w-[200px]'
                    }`}
                aria-label={isOpen ? 'Tutup chat' : 'Buka chat'}
            >
                {isOpen ? (
                    <X className="w-6 h-6" />
                ) : (
                    <>
                        {/* Left Side: Icon & Text */}
                        <div className="flex items-center gap-3">
                            <div className="relative mt-1">
                                <MessageSquare className="w-6 h-6" />
                                {unreadCount > 0 && (
                                    <span className="absolute -top-1.5 -right-1.5 size-4 bg-red-500 border-2 border-blue-600 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                                        {unreadCount > 9 ? '9+' : unreadCount}
                                    </span>
                                )}
                            </div>
                            <span className="font-bold text-base tracking-wide pt-0.5">Pesan</span>
                        </div>

                        {/* Right Side: Avatar Stack */}
                        <div className="flex -space-x-2.5 items-center">
                            {conversations.length > 0 ? (
                                conversations.slice(0, 3).map((conv) => {
                                    const other = getOtherParticipant(conv);
                                    return (
                                        <div key={conv._id} className="relative shrink-0">
                                            {other?.avatar ? (
                                                <img
                                                    src={other.avatar}
                                                    alt={other.nama}
                                                    className="size-9 rounded-full border-2 border-blue-500 object-cover bg-slate-200"
                                                />
                                            ) : (
                                                <div className="size-9 rounded-full border-2 border-blue-500 bg-blue-800 flex items-center justify-center text-white/70 text-[10px]">
                                                    <User className="w-4 h-4" />
                                                </div>
                                            )}
                                        </div>
                                    );
                                })
                            ) : (
                                // Empty state placeholder
                                <div className="flex -space-x-2.5">
                                    {[1, 2].map(i => (
                                        <div key={i} className="size-9 rounded-full border-2 border-blue-500 bg-blue-800/50 flex items-center justify-center">
                                            <User className="w-4 h-4 text-white/50" />
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </>
                )}
            </button>

            {/* Notification Sound Audio */}
            <audio
                ref={notificationAudioRef}
                src="https://assets.mixkit.co/active_storage/sfx/2354/2354-preview.mp3"
                preload="auto"
            />

            {/* Chat Widget */}
            {isOpen && (
                <div
                    role="dialog"
                    aria-label="Chat"
                    aria-modal="false"
                    className={`fixed z-50 bg-white shadow-2xl flex flex-col overflow-hidden animate-slide-in transition-all duration-300 ${isExpanded
                        ? 'inset-0 sm:inset-4 rounded-none sm:rounded-3xl'
                        : 'inset-0 sm:bottom-24 sm:right-6 sm:inset-auto sm:w-96 sm:h-[500px] rounded-none sm:rounded-2xl sm:border sm:border-slate-200'
                        }`}
                    onDragEnter={handleDragEnter}
                    onDragLeave={handleDragLeave}
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                >
                    {isDragging && selectedConversation && (
                        <div className="absolute inset-0 z-[60] bg-[#0d59f2]/90 flex flex-col items-center justify-center gap-3 rounded-2xl pointer-events-none">
                            <Image className="w-10 h-10 text-white" />
                            <p className="text-white font-semibold">Lepas gambar di sini</p>
                            <p className="text-blue-200 text-sm">Maks. 5MB</p>
                        </div>
                    )}

                    {/* Header */}
                    <div className="bg-[#0d59f2] text-white p-4 flex items-center gap-3">
                        {selectedConversation ? (
                            <>
                                <button onClick={handleBack} className="p-1 hover:bg-white/20 rounded-lg transition-colors" aria-label="Kembali">
                                    <ArrowLeft className="w-5 h-5" />
                                </button>
                                {(() => {
                                    const other = getOtherParticipant(selectedConversation);
                                    return (
                                        <>
                                            <div className="relative">
                                                {other?.avatar ? (
                                                    <img src={other.avatar} alt={other.nama} className="size-8 rounded-full object-cover" referrerPolicy="no-referrer" />
                                                ) : (
                                                    <div className="size-8 rounded-full bg-white/20 flex items-center justify-center">
                                                        <User className="w-4 h-4" />
                                                    </div>
                                                )}
                                                {other?.isOnline && (
                                                    <span className="absolute bottom-0 right-0 size-2.5 bg-green-400 border-2 border-[#0d59f2] rounded-full"></span>
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-bold text-base truncate leading-tight flex items-center gap-1">
                                                    {other?.nama || 'User'}
                                                    {(other?.role === 'admin' || other?.role === 'super_admin') && (
                                                        <BadgeCheck className="w-3.5 h-3.5 text-blue-300" />
                                                    )}
                                                </p>
                                                <p className="text-xs text-blue-100/90 truncate font-medium">
                                                    {(isTyping || partnerTyping) ? (
                                                        <span className="flex items-center gap-1">
                                                            <span className="animate-pulse">sedang mengetik</span>
                                                            <span className="flex gap-0.5">
                                                                <span className="size-1 bg-white rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                                                                <span className="size-1 bg-white rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                                                                <span className="size-1 bg-white rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                                                            </span>
                                                        </span>
                                                    ) : selectedConversation.product ? (
                                                        selectedConversation.product.namaBarang
                                                    ) : (
                                                        formatLastActive(other?.lastActive, other?.isOnline)
                                                    )}
                                                </p>
                                            </div>
                                        </>
                                    );
                                })()}
                                {/* Expand button */}
                                {/* Search messages button */}
                                <button
                                    onClick={() => setShowMessageSearch(!showMessageSearch)}
                                    className={`p-1.5 hover:bg-white/20 rounded-lg transition-colors ml-auto ${showMessageSearch ? 'bg-white/20' : ''}`}
                                    aria-label="Cari pesan"
                                    title="Cari dalam percakapan"
                                >
                                    <Search className="w-5 h-5" />
                                </button>
                                {/* Sound toggle button */}
                                <button
                                    onClick={() => setSoundEnabled(!soundEnabled)}
                                    className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
                                    aria-label={soundEnabled ? 'Matikan suara' : 'Nyalakan suara'}
                                    title={soundEnabled ? 'Notifikasi suara aktif' : 'Notifikasi suara mati'}
                                >
                                    <i className={`fi ${soundEnabled ? 'fi-rr-bell' : 'fi-rr-bell-slash'}`}></i>
                                </button>
                                {/* Expand button - only show on desktop */}
                                <button
                                    onClick={() => setIsExpanded(!isExpanded)}
                                    className="hidden sm:flex p-1.5 hover:bg-white/20 rounded-lg transition-colors"
                                    aria-label={isExpanded ? 'Perkecil' : 'Perbesar'}
                                >
                                    <i className={`fi ${isExpanded ? 'fi-rr-compress' : 'fi-rr-expand'}`}></i>
                                </button>
                                {/* Close button - only on mobile */}
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="sm:hidden p-1.5 hover:bg-white/20 rounded-lg transition-colors"
                                    aria-label="Tutup chat"
                                >
                                    <X className="w-6 h-6" />
                                </button>
                            </>
                        ) : (
                            <>
                                {/* Close button on mobile - show at start */}
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="sm:hidden p-1 hover:bg-white/20 rounded-lg transition-colors"
                                    aria-label="Tutup chat"
                                >
                                    <ArrowLeft className="w-5 h-5" />
                                </button>
                                <MessagesSquare className="w-6 h-6" />
                                <div className="flex-1 flex items-center justify-between mr-2">
                                    <div>
                                        <p className="font-bold">{viewMode === 'archived' ? 'Arsip' : 'Pesan'}</p>
                                        <p className="text-xs text-blue-100">{conversations.length} {viewMode === 'archived' ? 'tersembunyi' : 'percakapan'}</p>
                                    </div>
                                    <button
                                        onClick={() => setViewMode(prev => prev === 'active' ? 'archived' : 'active')}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${viewMode === 'archived'
                                            ? 'bg-white text-[#0d59f2] border-white'
                                            : 'bg-white/10 text-white border-white/30 hover:bg-white/20'
                                            }`}
                                    >
                                        {viewMode === 'archived' ? 'Utama' : 'Arsip'}
                                    </button>
                                </div>
                                {/* Sound toggle button */}
                                <button
                                    onClick={() => setSoundEnabled(!soundEnabled)}
                                    className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
                                    aria-label={soundEnabled ? 'Matikan suara' : 'Nyalakan suara'}
                                    title={soundEnabled ? 'Notifikasi suara aktif' : 'Notifikasi suara mati'}
                                >
                                    {soundEnabled ? <Bell className="w-5 h-5" /> : <BellOff className="w-5 h-5" />}
                                </button>
                                {/* Expand button - only show on desktop */}
                                <button
                                    onClick={() => setIsExpanded(!isExpanded)}
                                    className="hidden sm:flex p-1.5 hover:bg-white/20 rounded-lg transition-colors"
                                    aria-label={isExpanded ? 'Perkecil' : 'Perbesar'}
                                >
                                    {isExpanded ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
                                </button>
                            </>
                        )}
                    </div>

                    {/* Search Bar - only show in conversation list */}
                    {!selectedConversation && conversations.length > 0 && (
                        <div className="px-3 py-2 border-b border-slate-100 bg-slate-50/50">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Cari percakapan..."
                                    className="w-full pl-9 pr-8 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-[#0d59f2] focus:ring-1 focus:ring-[#0d59f2]/20"
                                />
                                {searchQuery && (
                                    <button
                                        onClick={() => setSearchQuery('')}
                                        className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-slate-100 rounded text-slate-400"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto">
                        {selectedConversation ? (
                            /* Messages View */
                            <div className="flex flex-col h-full">
                                {/* Message Search Bar */}
                                {showMessageSearch && (
                                    <div className="p-2 bg-slate-50 border-b border-slate-200">
                                        <div className="relative">
                                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                                            <input
                                                type="text"
                                                value={messageSearchQuery}
                                                onChange={(e) => setMessageSearchQuery(e.target.value)}
                                                placeholder="Cari dalam percakapan..."
                                                className="w-full pl-9 pr-8 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-[#0d59f2] focus:ring-1 focus:ring-[#0d59f2]/20"
                                                autoFocus
                                            />
                                            {messageSearchQuery && (
                                                <button
                                                    onClick={() => setMessageSearchQuery('')}
                                                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-slate-100 rounded text-slate-400"
                                                >
                                                    <X className="w-4 h-4" />
                                                </button>
                                            )}
                                        </div>
                                        {messageSearchQuery && (
                                            <p className="text-xs text-slate-500 mt-1 px-1">
                                                {messages.filter(m => m.content?.toLowerCase().includes(messageSearchQuery.toLowerCase())).length} hasil ditemukan
                                            </p>
                                        )}
                                    </div>
                                )}
                                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                                    {/* Product Card - if conversation has product and not hidden */}
                                    {selectedConversation.product && showProductCard && (
                                        <div className="relative p-3 bg-white rounded-xl border border-slate-100 shadow-sm animate-slide-in-right hover:shadow-md transition-shadow">
                                            <button
                                                onClick={() => setShowProductCard(false)}
                                                className="absolute -top-2 -right-2 size-6 bg-white rounded-full shadow-md border border-slate-100 flex items-center justify-center hover:bg-slate-50 text-slate-400 hover:text-red-500 transition-colors z-10"
                                                aria-label="Tutup info produk"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                            <Link
                                                to={`/produk/${selectedConversation.product._id}`}
                                                className="flex items-center gap-3 group"
                                            >
                                                {(selectedConversation.product.gambar || selectedConversation.product.gambar?.[0]) && (
                                                    <img
                                                        src={Array.isArray(selectedConversation.product.gambar) ? selectedConversation.product.gambar[0] : selectedConversation.product.gambar}
                                                        alt={selectedConversation.product.namaBarang}
                                                        className="size-12 rounded-lg object-cover border border-slate-100 group-hover:opacity-90 transition-opacity"
                                                    />
                                                )}
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold mb-0.5">Produk Terkait</p>
                                                    <p className="font-semibold text-slate-900 text-sm truncate group-hover:text-[#0d59f2] transition-colors">{selectedConversation.product.namaBarang}</p>
                                                    <p className="text-sm font-bold text-[#0d59f2]">
                                                        {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(selectedConversation.product.harga)}
                                                    </p>
                                                </div>
                                                <div className="size-8 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-[#0d59f2]/10 group-hover:text-[#0d59f2] transition-colors">
                                                    <ChevronRight className="w-5 h-5" />
                                                </div>
                                            </Link>
                                        </div>
                                    )}

                                    {loadingMessages ? (
                                        <div className="flex items-center justify-center py-8">
                                            <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
                                        </div>
                                    ) : messages.length === 0 ? (
                                        <div className="text-center text-slate-400 py-8">
                                            <MessageSquare className="w-10 h-10 mb-2 mx-auto" />
                                            <p className="text-sm">Belum ada pesan</p>
                                            <p className="text-xs">Mulai percakapan!</p>
                                        </div>
                                    ) : (() => {
                                        // Filter messages if searching
                                        const filteredMessages = messageSearchQuery
                                            ? messages.filter(m => m.content?.toLowerCase().includes(messageSearchQuery.toLowerCase()))
                                            : messages;

                                        // Find first unread message index (from others)
                                        const firstUnreadIdx = messages.findIndex(m =>
                                            m.sender._id !== user._id && !m.read
                                        );

                                        return groupMessagesByDate(filteredMessages).map((item, index) => {
                                            if (item.type === 'date') {
                                                return (
                                                    <div key={`date-${index}`} className="flex justify-center my-4">
                                                        <span className="px-3 py-1 bg-slate-100 text-slate-500 text-xs rounded-full">
                                                            {formatDateGroup(item.date)}
                                                        </span>
                                                    </div>
                                                );
                                            }

                                            const msg = item.data;
                                            const msgIdx = messages.findIndex(m => m._id === msg._id);
                                            const showUnreadDivider = msgIdx === firstUnreadIdx && firstUnreadIdx > 0;

                                            return (
                                                <React.Fragment key={msg._id}>
                                                    {/* Unread messages divider */}
                                                    {showUnreadDivider && (
                                                        <div className="flex items-center gap-2 my-3">
                                                            <div className="flex-1 h-px bg-blue-200"></div>
                                                            <span className="text-xs text-blue-500 font-medium px-2">Pesan baru</span>
                                                            <div className="flex-1 h-px bg-blue-200"></div>
                                                        </div>
                                                    )}
                                                    <MessageItem
                                                        msg={msg}
                                                        user={user}
                                                        handleReply={handleReply}
                                                        handleContextMenu={handleMessageContextMenu}
                                                        setViewImage={setViewImage}
                                                        renderEncryptedImage={(message, isMsgOwn) => (
                                                            <EncryptedImageMessage msg={message} isOwn={isMsgOwn} setViewImage={setViewImage} />
                                                        )}
                                                    />
                                                </React.Fragment>
                                            );
                                        });
                                    })()}
                                    <div ref={messagesEndRef} />
                                </div>
                            </div>
                        ) : (
                            /* Conversation List */
                            <ConversationList
                                conversations={conversations}
                                loading={loading}
                                selectedConversation={selectedConversation}
                                onSelectConversation={setSelectedConversation}
                                searchQuery={searchQuery}
                                user={user}
                                pinnedConversations={pinnedConversations}
                                onContextMenu={(e, conv) => {
                                    e.preventDefault();
                                    setConversationContextMenu({
                                        show: true,
                                        x: e.clientX,
                                        y: e.clientY,
                                        conversation: conv
                                    });
                                }}
                                onDeleteClick={setDeletingConversation}
                                onArchiveConversation={(conv) => {
                                    setDeletingConversation(conv);
                                    handleDeleteConversation();
                                }}
                                onRestoreConversation={handleRestoreConversation}
                                onHardDeleteConversation={handleHardDeleteConversation}
                                viewMode={viewMode}
                            />
                        )}

                    </div>

                    {/* Input (only when conversation is selected) */}
                    {selectedConversation && (
                        <div className="border-t border-slate-200">
                            {/* Typing indicator */}
                            {isTyping && (
                                <div className="px-4 py-2 text-xs text-slate-500 flex items-center gap-2">
                                    <span className="flex gap-1">
                                        <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                                        <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                                        <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                                    </span>
                                    <span>sedang mengetik...</span>
                                </div>
                            )}

                            {/* Connection status */}
                            {!socketConnected && (
                                <div className="px-4 py-1 text-[10px] text-amber-600 bg-amber-50 flex items-center gap-1">
                                    <WifiOff className="w-3 h-3" />
                                    <span>Reconnecting...</span>
                                </div>
                            )}

                            {/* Reply preview */}
                            {replyTo && (
                                <div className="px-3 pt-2 flex items-start gap-2 bg-slate-50">
                                    <div className="flex-1 pl-2 border-l-2 border-[#0d59f2]">
                                        <p className="text-xs font-medium text-[#0d59f2]">
                                            Membalas {replyTo.sender._id === user._id ? 'diri sendiri' : replyTo.sender.nama}
                                        </p>
                                        {replyTo.image || replyTo.encryptedImage ? (
                                            <p className="text-xs text-slate-500 truncate flex items-center gap-1">
                                                <Image className="w-3 h-3" />
                                                {replyTo.encryptedImage && <Lock className="w-2.5 h-2.5" />}
                                                Foto
                                            </p>
                                        ) : replyTo.encrypted && !replyTo.content ? (
                                            <p className="text-xs text-slate-500 truncate flex items-center gap-1">
                                                <Lock className="w-3 h-3" /> Pesan terenkripsi
                                            </p>
                                        ) : (
                                            <p className="text-xs text-slate-500 truncate">{replyTo.content || 'Pesan'}</p>
                                        )}
                                    </div>
                                    <button onClick={cancelReply} className="p-1 hover:bg-slate-200 rounded" aria-label="Batalkan balas">
                                        <X className="w-4 h-4 text-slate-400" />
                                    </button>
                                </div>
                            )}

                            {/* Image preview */}
                            {selectedImage && (
                                <div className="px-3 pt-2 flex items-center gap-2 bg-slate-50 border-t border-slate-200">
                                    <div className="relative shrink-0">
                                        <img
                                            src={selectedImage ? URL.createObjectURL(selectedImage) : ''}
                                            alt="Preview"
                                            className="h-12 w-12 object-cover rounded-lg"
                                        />
                                        <button
                                            onClick={cancelImage}
                                            className="absolute -top-1 -right-1 size-4 bg-red-500 text-white rounded-full text-[10px] flex items-center justify-center hover:bg-red-600"
                                            aria-label="Hapus gambar"
                                        >
                                            <X className="w-3 h-3" />
                                        </button>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs text-slate-600 truncate">{selectedImage.name}</p>
                                        <p className="text-[10px] text-slate-400">Tambahkan caption di kolom chat</p>
                                    </div>
                                </div>
                            )}

                            {/* Emoji picker */}
                            <EmojiPicker
                                show={showEmojiPicker}
                                pickerRef={emojiPickerRef}
                                currentCategory={emojiCategory}
                                onCategoryChange={setEmojiCategory}
                                onEmojiSelect={handleEmojiSelect}
                            />


                            <form onSubmit={handleSendMessage} className="p-3 bg-white flex gap-2 items-center">
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleImageSelect}
                                    accept="image/*"
                                    className="hidden"
                                />

                                {/* Action buttons group */}
                                <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-full transition-all hover:bg-slate-200/80">
                                    <button
                                        type="button"
                                        onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                                        className={`size-9 rounded-full flex items-center justify-center transition-colors ${showEmojiPicker ? 'bg-white text-[#0d59f2] shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                                        aria-label="Emoji picker"
                                        aria-expanded={showEmojiPicker}
                                    >
                                        <Smile className="w-5 h-5" />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => fileInputRef.current?.click()}
                                        className="size-9 rounded-full flex items-center justify-center text-slate-500 hover:text-slate-700 hover:bg-white hover:shadow-sm transition-colors"
                                        aria-label="Pilih gambar"
                                    >
                                        <Image className="w-5 h-5" />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setShowCamera(true)}
                                        className="size-9 rounded-full flex items-center justify-center text-slate-500 hover:text-slate-700 hover:bg-white hover:shadow-sm transition-colors"
                                        aria-label="Kamera"
                                    >
                                        <Camera className="w-5 h-5" />
                                    </button>
                                </div>

                                <div className="flex-1 relative">
                                    <input
                                        type="text"
                                        value={newMessage}
                                        onChange={handleInputChange}
                                        placeholder={selectedImage ? "Tambahkan caption..." : "Ketik pesan..."}
                                        className="w-full pl-5 pr-4 py-3 rounded-full bg-slate-50 border-0 focus:ring-2 focus:ring-[#0d59f2]/20 focus:bg-white transition-all text-sm placeholder:text-slate-400"
                                        aria-label="Tulis pesan"
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={(!newMessage.trim() && !selectedImage) || sending || uploadingImage}
                                    className="size-11 flex items-center justify-center bg-[#0d59f2] hover:bg-blue-700 text-white rounded-full shadow-lg shadow-blue-500/20 transition-all disabled:opacity-50 disabled:shadow-none hover:scale-105 active:scale-95"
                                    aria-label="Kirim pesan"
                                >
                                    {(sending || uploadingImage) ? (
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                    ) : (
                                        <Send className="w-5 h-5 translate-x-px translate-y-px" />
                                    )}
                                </button>
                            </form>
                        </div>
                    )}

                    {/* Delete Conversation Confirmation Modal - Inside bubble */}
                    {deletingConversation && (
                        <div className="absolute inset-0 z-[60] flex items-center justify-center p-4 bg-black/40 rounded-2xl">
                            <div className="bg-white rounded-2xl p-5 max-w-[320px] w-full shadow-xl">
                                <div className="text-center">
                                    <div className="size-12 mx-auto mb-3 bg-red-100 rounded-full flex items-center justify-center">
                                        <Trash2 className="w-6 h-6 text-red-500" />
                                    </div>
                                    <h3 className="text-base font-bold text-slate-900 mb-1.5">Hapus Chat?</h3>
                                    <p className="text-xs text-slate-500 mb-4 leading-relaxed">
                                        Chat dengan <span className="font-medium text-slate-700">{getOtherParticipant(deletingConversation)?.nama || 'pengguna ini'}</span> akan dihapus. Chat muncul lagi jika ada pesan baru.
                                    </p>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => setDeletingConversation(null)}
                                            className="flex-1 py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-medium text-sm transition-colors"
                                        >
                                            Batal
                                        </button>
                                        <button
                                            onClick={handleDeleteConversation}
                                            className="flex-1 py-2 px-3 bg-red-500 hover:bg-red-600 text-white rounded-xl font-medium text-sm transition-colors"
                                        >
                                            Hapus
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Context Menu */}
                    {contextMenu.show && (
                        <div
                            className="fixed bg-white rounded-lg shadow-xl border border-slate-200 py-1 z-[100] min-w-[140px]"
                            style={{ top: contextMenu.y, left: Math.min(contextMenu.x, window.innerWidth - 160) }}
                        >
                            <button
                                onClick={() => handleReply(contextMenu.message)}
                                className="w-full px-4 py-2 text-left text-sm hover:bg-slate-50 flex items-center gap-2"
                            >
                                <Undo2 className="w-4 h-4 text-slate-400" />
                                Balas
                            </button>
                            <button
                                onClick={() => copyMessage(contextMenu.message.content)}
                                className="w-full px-4 py-2 text-left text-sm hover:bg-slate-50 flex items-center gap-2"
                            >
                                <Copy className="w-4 h-4 text-slate-400" />
                                Salin
                            </button>
                            {contextMenu.message?.sender?._id === user?._id && !contextMenu.message?.isDeleted && (
                                <button
                                    onClick={() => handleDeleteMessage(contextMenu.message._id)}
                                    className="w-full px-4 py-2 text-left text-sm hover:bg-red-50 text-red-600 flex items-center gap-2"
                                >
                                    <Trash2 className="w-4 h-4" />
                                    Hapus
                                </button>
                            )}
                        </div>
                    )}

                    {/* Confirm Dialog for Hard Delete - Inside bubble */}
                    <ConfirmDialog
                        isOpen={confirmDialog.isOpen}
                        onClose={() => setConfirmDialog({ isOpen: false, conversationId: null })}
                        onConfirm={executeHardDelete}
                        type="danger"
                        title="Hapus Percakapan?"
                        message="Riwayat pesan akan dihapus permanen."
                        confirmText="Hapus"
                        cancelText="Batal"
                        inline
                    />

                    {/* Confirm Dialog for Archive - Inside bubble */}
                    <ConfirmDialog
                        isOpen={archiveDialog.isOpen}
                        onClose={() => setArchiveDialog({ isOpen: false, conversation: null })}
                        onConfirm={executeArchive}
                        type="warning"
                        title="Arsipkan Chat?"
                        message="Chat akan muncul kembali saat ada pesan baru."
                        confirmText="Arsipkan"
                        cancelText="Batal"
                        inline
                    />
                </div>
            )}

            {/* Image Viewer Popup */}
            <ImageViewer
                imageUrl={viewImage}
                onClose={() => setViewImage(null)}
            />

            {/* Camera Modal */}
            {showCamera && (
                <CameraCapture
                    onCapture={(file) => {
                        setSelectedImage(file);
                        setShowCamera(false);
                    }}
                    onClose={() => setShowCamera(false)}
                />
            )}


            {/* Undo Toast */}
            {justDeletedConversation && (
                <div className="absolute bottom-20 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 z-[70] min-w-[300px] animate-fade-in-up">
                    <span className="text-sm flex-1">Percakapan dihapus</span>
                    <button
                        onClick={handleUndoDelete}
                        className="text-blue-400 font-bold text-sm hover:text-blue-300 transition-colors"
                    >
                        BATALKAN
                    </button>
                    <button
                        onClick={() => setJustDeletedConversation(null)}
                        className="text-slate-400 hover:text-white transition-colors"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
            )}


            {/* Conversation Context Menu */}
            {conversationContextMenu.show && (
                <div
                    className="fixed bg-white rounded-xl shadow-2xl border border-slate-200 py-1 z-[100] min-w-[140px]"
                    style={{
                        top: Math.min(conversationContextMenu.y, window.innerHeight - 140),
                        left: Math.min(conversationContextMenu.x, window.innerWidth - 160)
                    }}
                    onClick={() => setConversationContextMenu({ show: false, x: 0, y: 0, conversation: null })}
                >
                    {viewMode === 'active' ? (
                        <>
                            <button
                                onClick={() => {
                                    togglePinConversation(conversationContextMenu.conversation._id);
                                }}
                                className="w-full px-4 py-2 text-left text-sm hover:bg-slate-50 flex items-center gap-3"
                            >
                                <i className={`fi ${pinnedConversations.includes(conversationContextMenu.conversation._id) ? 'fi-sr-thumbtack text-amber-500' : 'fi-rr-thumbtack text-slate-400'}`}></i>
                                <span className="text-slate-700">{pinnedConversations.includes(conversationContextMenu.conversation._id) ? 'Lepas Pin' : 'Sematkan'}</span>
                            </button>
                            <button
                                onClick={() => {
                                    handleArchiveConversation(conversationContextMenu.conversation);
                                }}
                                className="w-full px-4 py-2 text-left text-sm hover:bg-slate-50 flex items-center gap-3"
                            >
                                <i className="fi fi-rr-box text-slate-400"></i>
                                <span className="text-slate-700">Arsipkan</span>
                            </button>
                            <button
                                onClick={() => {
                                    handleHardDeleteConversation(conversationContextMenu.conversation._id);
                                }}
                                className="w-full px-4 py-2 text-left text-sm hover:bg-red-50 flex items-center gap-3 text-red-600"
                            >
                                <i className="fi fi-rr-trash"></i>
                                <span>Hapus</span>
                            </button>
                        </>
                    ) : (
                        <>
                            <button
                                onClick={() => {
                                    handleRestoreConversation(conversationContextMenu.conversation._id);
                                }}
                                className="w-full px-4 py-2 text-left text-sm hover:bg-green-50 flex items-center gap-3 text-green-600"
                            >
                                <i className="fi fi-rr-undo"></i>
                                <span>Pulihkan</span>
                            </button>
                            <button
                                onClick={() => {
                                    handleHardDeleteConversation(conversationContextMenu.conversation._id);
                                }}
                                className="w-full px-4 py-2 text-left text-sm hover:bg-red-50 flex items-center gap-3 text-red-600"
                            >
                                <i className="fi fi-rr-trash"></i>
                                <span>Hapus</span>
                            </button>
                        </>
                    )}
                </div>
            )}
        </>
    );
}

export default ChatBubble;
