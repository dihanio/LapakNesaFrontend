import React, { useState, useEffect } from 'react';
import encryptionService from '../../services/encryptionService';

const EncryptedImageMessage = ({ msg, isOwn, setViewImage }) => {
    const [decryptedImage, setDecryptedImage] = useState(null);
    const [error, setError] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        let isMounted = true;

        const decrypt = async () => {
            if (!msg.encryptedImageData || !msg.imageIv) return;

            try {
                if (isMounted) setLoading(true);

                // Try to store session key if present in message
                if (msg.sessionKey) {
                    try {
                        await encryptionService.storeSessionKey(msg.conversationId || msg.conversation, msg.sessionKey);
                    } catch (e) {
                        // Ignore error, key might already exist or be for other user
                    }
                }

                const url = await encryptionService.decryptImage(
                    msg.encryptedImageData,
                    msg.imageIv,
                    msg.conversationId || msg.conversation, // Conversation ID
                    msg.imageMimeType || 'image/jpeg'
                );

                if (isMounted) {
                    setDecryptedImage(url);
                    setLoading(false);
                }
            } catch (err) {
                console.error("Failed to decrypt image", err);
                if (isMounted) {
                    setError(true);
                    setLoading(false);
                }
            }
        };

        if (msg.encryptedImage && !decryptedImage) {
            decrypt();
        }

        return () => {
            isMounted = false;
            // Revoke object URL to avoid memory leaks
            if (decryptedImage) {
                URL.revokeObjectURL(decryptedImage);
            }
        };
    }, [msg, decryptedImage]);

    if (!msg.encryptedImage) return null;

    if (loading) {
        return (
            <div className={`w-48 h-48 bg-slate-200 rounded-lg animate-pulse flex items-center justify-center ${isOwn ? 'opacity-80' : ''}`}>
                <i className="fi fi-rr-lock text-slate-400 text-2xl"></i>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center w-48 h-48 bg-slate-200/50 rounded-lg text-slate-500 p-4 text-center border border-slate-300 border-dashed">
                <i className="fi fi-rr-file-corrupted text-2xl mb-2 text-slate-400"></i>
                <span className="text-xs">Gagal memuat gambar terenkripsi</span>
            </div>
        );
    }

    if (decryptedImage) {
        return (
            <div className="relative group/image">
                <img
                    src={decryptedImage}
                    alt="Encrypted Content"
                    className="max-w-full rounded-lg mb-1 cursor-pointer hover:opacity-95 transition-opacity bg-slate-100 min-w-[200px] min-h-[150px] object-cover"
                    onClick={() => setViewImage && setViewImage(decryptedImage)}
                />
                <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-sm text-white text-[10px] px-2 py-1 rounded-full flex items-center gap-1.5 opacity-0 group-hover/image:opacity-100 transition-opacity pointer-events-none">
                    <i className="fi fi-sr-lock text-[8px]"></i>
                    <span className="font-medium">End-to-End Encrypted</span>
                </div>
            </div>
        );
    }

    return null;
};

export default EncryptedImageMessage;
