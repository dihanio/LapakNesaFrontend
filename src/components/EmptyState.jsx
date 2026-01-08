import { Link } from 'react-router-dom';
import { PackageOpen, Heart, MessageSquare, Search, ShoppingBag, Bell } from 'lucide-react';

const emptyStates = {
    products: {
        icon: PackageOpen,
        title: 'Belum ada barang',
        description: 'Jadilah yang pertama pasang iklan!',
        action: { label: 'Pasang Iklan', to: '/jual' }
    },
    wishlist: {
        icon: Heart,
        title: 'Wishlist masih kosong',
        description: 'Simpan barang favoritmu di sini',
        action: { label: 'Jelajahi Barang', to: '/jelajah' }
    },
    chat: {
        icon: MessageSquare,
        title: 'Belum ada chat',
        description: 'Mulai percakapan dengan penjual',
        action: null
    },
    search: {
        icon: Search,
        title: 'Tidak ada hasil',
        description: 'Coba kata kunci lain atau kurangi filter',
        action: null
    },
    orders: {
        icon: ShoppingBag,
        title: 'Belum ada pesanan',
        description: 'Pesanan akan muncul di sini',
        action: { label: 'Jelajahi Barang', to: '/jelajah' }
    },
    notifications: {
        icon: Bell,
        title: 'Tidak ada notifikasi',
        description: 'Kamu sudah up to date!',
        action: null
    }
};

function EmptyState({
    type = 'products',
    title,
    description,
    icon,
    actionLabel,
    actionTo,
    onAction
}) {
    const state = emptyStates[type] || emptyStates.products;

    const displayTitle = title || state.title;
    const displayDesc = description || state.description;
    const DisplayIcon = icon || state.icon;
    const displayAction = actionLabel ? { label: actionLabel, to: actionTo } : state.action;

    return (
        <div className="text-center py-12 px-4">
            {/* Icon with gradient background */}
            <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-slate-100 to-slate-200 rounded-full flex items-center justify-center">
                <DisplayIcon className="w-8 h-8 text-slate-400" />
            </div>

            {/* Title */}
            <h3 className="text-lg font-bold text-slate-700 mb-1">
                {displayTitle}
            </h3>

            {/* Description */}
            <p className="text-sm text-slate-500 mb-6 max-w-xs mx-auto">
                {displayDesc}
            </p>

            {/* Action Button */}
            {displayAction && displayAction.to && (
                <Link
                    to={displayAction.to}
                    className="inline-flex items-center gap-2 bg-[#0d59f2] text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-blue-700 transition-colors text-sm"
                >
                    {displayAction.label}
                </Link>
            )}

            {onAction && !displayAction?.to && (
                <button
                    onClick={onAction}
                    className="inline-flex items-center gap-2 bg-[#0d59f2] text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-blue-700 transition-colors text-sm"
                >
                    {actionLabel || 'Coba Lagi'}
                </button>
            )}
        </div>
    );
}

export default EmptyState;
