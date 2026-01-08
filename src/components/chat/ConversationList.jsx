import React from 'react';
import { formatTime } from '../../utils/chatUtils.jsx';
import { Loader2, PackageOpen, MessageSquare, Search, User, Pin, BadgeCheck, Image, CheckCircle } from 'lucide-react';

const ConversationList = ({
    conversations,
    loading,
    selectedConversation,
    onSelectConversation,
    searchQuery,
    user,
    pinnedConversations,
    onContextMenu,
    onDeleteClick,
    onArchiveConversation,
    onRestoreConversation,
    onHardDeleteConversation,
    viewMode = 'active'
}) => {
    // Helper to get other participant
    const getOtherParticipant = (conv) => {
        return conv.participants?.find(p => p._id !== user?._id);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full">
                <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
            </div>
        );
    }

    if (conversations.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-slate-400 p-6 text-center">
                {viewMode === 'archived' ? (
                    <>
                        <div className="size-20 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                            <PackageOpen className="w-10 h-10 text-slate-400" />
                        </div>
                        <p className="font-semibold text-slate-600">Arsip Kosong</p>
                        <p className="text-sm mt-1">Chat yang dihapus akan muncul di sini</p>
                    </>
                ) : (
                    <>
                        <div className="size-20 bg-gradient-to-br from-blue-100 to-blue-50 rounded-full flex items-center justify-center mb-4 shadow-sm">
                            <MessageSquare className="w-10 h-10 text-[#0d59f2]" />
                        </div>
                        <p className="font-semibold text-slate-700 text-lg">Mulai Percakapan!</p>
                        <p className="text-sm mt-2 max-w-[200px] text-slate-500">
                            Kunjungi halaman produk dan klik tombol "Chat Penjual" untuk memulai
                        </p>
                    </>
                )}
            </div>
        );
    }

    // Filter conversations based on search query
    const filteredConversations = conversations.filter((conv) => {
        if (!searchQuery?.trim()) return true;
        const other = getOtherParticipant(conv);
        const query = searchQuery.toLowerCase();
        // Search by name, product name, or last message
        return (
            other?.nama?.toLowerCase().includes(query) ||
            conv.product?.namaBarang?.toLowerCase().includes(query) ||
            (conv.lastMessage?.content && conv.lastMessage.content.toLowerCase().includes(query))
        );
    });

    // Sort: pinned first, then by lastMessageAt
    const sortedConversations = [...filteredConversations].sort((a, b) => {
        const aPinned = pinnedConversations.includes(a._id);
        const bPinned = pinnedConversations.includes(b._id);
        if (aPinned && !bPinned) return -1;
        if (!aPinned && bPinned) return 1;
        // Sort by lastMessageAt within same group
        return new Date(b.lastMessageAt || 0) - new Date(a.lastMessageAt || 0);
    });

    if (sortedConversations.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-slate-400 py-8">
                <Search className="w-10 h-10 mb-2" />
                <p className="font-medium text-sm">Tidak ditemukan</p>
                <p className="text-xs">Coba kata kunci lain</p>
            </div>
        );
    }

    return (
        <div className="h-full">
            {sortedConversations.map((conv) => {
                const other = getOtherParticipant(conv);
                const isPinned = pinnedConversations.includes(conv._id);
                const isSelected = selectedConversation?._id === conv._id;

                return (
                    <div
                        key={conv._id}
                        className={`relative ${isPinned ? 'bg-amber-50/50' : ''} ${isSelected ? 'bg-blue-50' : ''}`}
                    >
                        <button
                            onClick={() => onSelectConversation(conv)}
                            onContextMenu={(e) => onContextMenu(e, conv)}
                            className="w-full p-4 flex items-start gap-3 hover:bg-slate-50 transition-colors border-b border-slate-100 text-left"
                        >
                            <div className="relative shrink-0">
                                {other?.avatar ? (
                                    <img src={other.avatar} alt={other.nama} className="size-10 rounded-full object-cover" referrerPolicy="no-referrer" />
                                ) : (
                                    <div className="size-10 rounded-full bg-[#0d59f2]/10 flex items-center justify-center text-[#0d59f2]">
                                        <User className="w-5 h-5" />
                                    </div>
                                )}
                                {other?.isOnline && (
                                    <span className="absolute bottom-0 right-0 size-3 bg-green-500 border-2 border-white rounded-full"></span>
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between gap-2">
                                    <div className="flex items-center gap-1.5 min-w-0">
                                        {isPinned && (
                                            <Pin className="w-3 h-3 text-amber-500 fill-amber-500 shrink-0" />
                                        )}
                                        <p className="font-semibold text-slate-900 truncate text-sm flex items-center gap-1">
                                            {other?.nama || 'User'}
                                            {(other?.role === 'admin' || other?.role === 'super_admin') && (
                                                <BadgeCheck className="w-3.5 h-3.5 text-blue-500" />
                                            )}
                                            {other?.role === 'penjual' && (
                                                <BadgeCheck className="w-3.5 h-3.5 text-blue-500" />
                                            )}
                                        </p>
                                        {other?.isOnline && (
                                            <span className="text-[10px] text-green-500 font-medium shrink-0">● Online</span>
                                        )}
                                    </div>
                                    {conv.lastMessageAt && (
                                        <span className="text-[10px] text-slate-400 shrink-0">
                                            {formatTime(conv.lastMessageAt)}
                                        </span>
                                    )}
                                </div>
                                {conv.product && (
                                    <p className="text-xs text-[#0d59f2] truncate">{conv.product.namaBarang}</p>
                                )}
                                {conv.lastMessage && (
                                    <p className="text-xs text-slate-500 truncate flex items-center gap-1">
                                        {conv.lastMessage.image || conv.lastMessage.encryptedImage ? (
                                            <>
                                                <Image className="w-3 h-3" />
                                                <span>Foto</span>
                                            </>
                                        ) : (
                                            conv.lastMessage.content || 'Pesan'
                                        )}
                                    </p>
                                )}
                            </div>
                            {conv.unreadCount > 0 && (
                                <span className="size-5 rounded-full bg-[#0d59f2] text-white text-[10px] flex items-center justify-center shrink-0">
                                    {conv.unreadCount}
                                </span>
                            )}
                        </button>

                    </div>
                );
            })}
        </div>
    );
};

export default ConversationList;
