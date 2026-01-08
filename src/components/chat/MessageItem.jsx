import React, { useState, useRef } from 'react';
import { Undo2, Image, Lock, Ban, Loader2, Check, CheckCheck } from 'lucide-react';
import { formatTime, parseLinks } from '../../utils/chatUtils.jsx';

const MessageItem = ({
    msg,
    user,
    handleReply,
    handleContextMenu,
    setViewImage,
    renderEncryptedImage
}) => {
    const isOwn = msg.sender._id === user._id;
    const [swipeOffset, setSwipeOffset] = useState(0);
    const touchStartX = useRef(0);
    const threshold = 60; // Pixels to swipe to trigger reply

    const handleTouchStart = (e) => {
        touchStartX.current = e.touches[0].clientX;
    };

    const handleTouchMove = (e) => {
        const currentX = e.touches[0].clientX;
        const diff = isOwn
            ? touchStartX.current - currentX  // Swipe left for own messages
            : currentX - touchStartX.current; // Swipe right for others

        if (diff > 0 && diff <= 100) {
            setSwipeOffset(diff);
        }
    };

    const handleTouchEnd = () => {
        if (swipeOffset >= threshold) {
            handleReply(msg);
        }
        setSwipeOffset(0);
    };

    return (
        <div
            className={`flex ${isOwn ? 'justify-end' : 'justify-start'} group animate-message-in origin-bottom relative`}
            onContextMenu={(e) => handleContextMenu(e, msg)}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
        >
            {/* Swipe indicator */}
            {swipeOffset > 0 && (
                <div
                    className={`absolute ${isOwn ? 'right-0' : 'left-0'} top-1/2 -translate-y-1/2 flex items-center justify-center text-[#0d59f2] transition-opacity ${swipeOffset >= threshold ? 'opacity-100' : 'opacity-50'}`}
                    style={{ [isOwn ? 'right' : 'left']: -30 }}
                >
                    <Undo2 className={`w-5 h-5 ${swipeOffset >= threshold ? 'scale-125' : ''} transition-transform`} />
                </div>
            )}
            <div
                className={`max-w-[85%] sm:max-w-[75%] px-4 py-3 rounded-3xl relative shadow-sm transition-transform ${isOwn
                    ? 'bg-[#0d59f2] text-white rounded-tr-none'
                    : 'bg-white border border-slate-100 text-slate-900 rounded-tl-none'
                    }`}
                style={{ transform: `translateX(${isOwn ? -swipeOffset : swipeOffset}px)` }}
            >
                {/* Reply preview */}
                {msg.replyTo && (
                    <div className={`mb-2 px-2 py-1 rounded border-l-2 text-xs ${isOwn ? 'bg-blue-600/50 border-blue-300' : 'bg-slate-200 border-slate-400'
                        }`}>
                        <p className="font-medium truncate">{msg.replyTo.sender?.nama}</p>
                        {msg.replyTo.image || msg.replyTo.encryptedImage ? (
                            <p className="truncate opacity-80 flex items-center gap-1">
                                <Image className="w-3 h-3" />
                                {msg.replyTo.encryptedImage && <Lock className="w-2.5 h-2.5" />}
                                Foto
                            </p>
                        ) : msg.replyTo.encrypted && !msg.replyTo.content ? (
                            <p className="truncate opacity-80 flex items-center gap-1">
                                <Lock className="w-3 h-3" /> Pesan terenkripsi
                            </p>
                        ) : (
                            <p className="truncate opacity-80">{msg.replyTo.content || 'Pesan'}</p>
                        )}
                    </div>
                )}

                {/* Deleted message */}
                {msg.isDeleted ? (
                    <p className={`text-sm italic ${isOwn ? 'text-blue-200' : 'text-slate-400'}`}>
                        <Ban className="w-4 h-4 mr-1 inline" />
                        Pesan ini telah dihapus
                    </p>
                ) : (
                    <>
                        {/* Image message (unencrypted) */}
                        {msg.image && (
                            <img
                                src={msg.image}
                                alt="Shared"
                                className="max-w-full rounded-lg mb-1 cursor-pointer hover:opacity-90 transition-opacity"
                                onClick={() => setViewImage(msg.image)}
                            />
                        )}

                        {/* Encrypted image message */}
                        {msg.encryptedImage && renderEncryptedImage && (
                            renderEncryptedImage(msg, isOwn)
                        )}

                        {/* Text content */}
                        {msg.content && (
                            <p className="text-sm whitespace-pre-line">{parseLinks(msg.content)}</p>
                        )}
                    </>
                )}

                {/* Time and read status */}
                <div className={`flex items-center gap-1 mt-1 ${isOwn ? 'justify-end' : ''}`}>
                    {/* Encryption indicator */}
                    {(msg.encrypted || msg._encrypted) && (
                        <Lock className={`w-2.5 h-2.5 ${isOwn ? 'text-blue-200' : 'text-slate-400'}`} />
                    )}
                    <p className={`text-[10px] ${isOwn ? 'text-blue-200' : 'text-slate-400'}`}>
                        {formatTime(msg.createdAt)}
                    </p>
                    {isOwn && (
                        msg._optimistic ? (
                            <span className="flex items-center gap-0.5 text-blue-200">
                                <Loader2 className="w-3 h-3 animate-spin" />
                            </span>
                        ) : (
                            <span className={`text-[10px] ${msg.read ? 'text-blue-200' : 'text-blue-300/50'}`}>
                                {msg.read ? <CheckCheck className="w-3 h-3" /> : <Check className="w-3 h-3" />}
                            </span>
                        )
                    )}
                </div>
            </div>

            {/* Quick actions on hover */}
            <div className={`flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity ${isOwn ? 'mr-1 order-first' : 'ml-1'}`}>
                <button
                    onClick={() => handleReply(msg)}
                    className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-slate-600"
                    title="Balas"
                >
                    <Undo2 className="w-3 h-3" />
                </button>
            </div>
        </div >
    );
};

export default MessageItem;
