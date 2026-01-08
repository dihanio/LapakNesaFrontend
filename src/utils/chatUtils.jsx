import React from 'react';

// Format last active status
export const formatLastActive = (lastActive, isOnline) => {
    if (isOnline) return 'Online';
    if (!lastActive) return '';

    const now = new Date();
    const lastActiveDate = new Date(lastActive);
    const diffMs = now - lastActiveDate;
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return 'Baru saja aktif';
    if (diffMins < 60) return `Aktif ${diffMins} menit lalu`;
    if (diffHours < 24) return `Aktif ${diffHours} jam lalu`;
    if (diffDays === 1) return 'Aktif kemarin';
    if (diffDays < 7) return `Aktif ${diffDays} hari lalu`;
    return `Aktif ${lastActiveDate.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}`;
};

// Format concise time for message bubble
export const formatTime = (date) => {
    const d = new Date(date);
    const now = new Date();
    const diffDays = Math.floor((now - d) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
        return d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
    } else if (diffDays === 1) {
        return 'Kemarin';
    }
    return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
};

// Format date for message grouping header
export const formatDateGroup = (date) => {
    const d = new Date(date);
    const now = new Date();
    const diffDays = Math.floor((now - d) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Hari ini';
    if (diffDays === 1) return 'Kemarin';
    if (diffDays < 7) return d.toLocaleDateString('id-ID', { weekday: 'long' });
    return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
};

// Group messages by date
export const groupMessagesByDate = (msgs) => {
    const groups = [];
    let currentDate = null;

    msgs.forEach((msg) => {
        const msgDate = new Date(msg.createdAt).toDateString();
        if (msgDate !== currentDate) {
            currentDate = msgDate;
            groups.push({ type: 'date', date: msg.createdAt });
        }
        groups.push({ type: 'message', data: msg });
    });

    return groups;
};

// Parse URLs in message content and make them clickable
export const parseLinks = (text) => {
    if (!text) return null;
    // Match URLs including wa.me, https://, http://, and www.
    const urlRegex = /(https?:\/\/[^\s]+|wa\.me\/[^\s]+|www\.[^\s]+)/gi;
    const parts = text.split(urlRegex);

    return parts.map((part, index) => {
        if (part.match(urlRegex)) {
            let href = part;
            // Add https:// if missing
            if (!href.startsWith('http')) {
                href = 'https://' + href;
            }
            return (
                <a
                    key={index}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 underline hover:text-blue-300"
                    onClick={(e) => e.stopPropagation()}
                >
                    {part}
                </a>
            );
        }
        return part;
    });
};
