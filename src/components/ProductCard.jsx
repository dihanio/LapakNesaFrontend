import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useToast } from './ToastProvider';
import useAuthStore from '../store/authStore';
import wishlistService from '../services/wishlistService';
import { formatPrice, timeAgoShort } from '../utils/formatUtils';
import { Heart, BadgeCheck, CheckCheck, MapPin, Clock } from 'lucide-react';

function ProductCard({ product }) {
    const toast = useToast();
    const { isAuthenticated } = useAuthStore();
    const [saved, setSaved] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const checkWishlistStatus = async () => {
            // Prevent checking wishlist for preview/mock products
            if (!isAuthenticated || !product?._id || product._id === 'preview') return;
            try {
                const response = await wishlistService.checkWishlist(product._id);
                setSaved(response.inWishlist || false);
            } catch (error) {
                // Silently fail - might not be logged in
            }
        };
        checkWishlistStatus();
    }, [product._id, isAuthenticated]);

    const handleToggleWishlist = async (e) => {
        e.preventDefault();
        e.stopPropagation();

        if (!isAuthenticated) {
            toast.error('Silakan login untuk menyimpan ke wishlist');
            return;
        }

        // Prevent toggling for preview products
        if (product._id === 'preview') return;

        if (loading) return;

        try {
            setLoading(true);
            const response = await wishlistService.toggleWishlist(product._id);
            setSaved(response.inWishlist || false);
            if (response.inWishlist) {
                toast.success('Disimpan ke Wishlist');
            } else {
                toast.info('Dihapus dari Wishlist');
            }
        } catch (error) {
            toast.error('Gagal mengupdate wishlist');
        } finally {
            setLoading(false);
        }
    };

    const isSold = product.status === 'terjual';
    const isVerified = product.penjual?.verification?.status === 'verified';

    const getConditionStyle = (kondisi) => {
        const styles = {
            'Baru': 'bg-gradient-to-r from-emerald-500 to-green-500 text-white',
            'Seperti Baru': 'bg-gradient-to-r from-amber-400 to-yellow-400 text-slate-900',
            'Bekas - Mulus': 'bg-gradient-to-r from-sky-400 to-blue-400 text-white',
            'Lecet Pemakaian': 'bg-gradient-to-r from-slate-400 to-slate-500 text-white',
        };
        return styles[kondisi] || 'bg-gradient-to-r from-slate-400 to-slate-500 text-white';
    };

    return (
        <Link
            to={`/produk/${product._id}`}
            className="group block bg-white rounded-2xl overflow-hidden border border-slate-100 hover:border-blue-300 hover:shadow-2xl hover:shadow-blue-500/20 hover:-translate-y-1 transition-all duration-300"
        >
            {/* Image Container */}
            <div className="aspect-square w-full overflow-hidden bg-gradient-to-br from-slate-50 to-slate-100 relative">
                <img
                    src={product.gambar || 'https://placehold.co/400x400?text=No+Image'}
                    alt={product.namaBarang}
                    loading="lazy"
                    className={`w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out ${isSold ? 'grayscale' : ''}`}
                />

                {/* Hover Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                {/* Wishlist Button */}
                <button
                    className={`absolute top-3 right-3 z-10 w-9 h-9 rounded-xl flex items-center justify-center backdrop-blur-md transition-all duration-300 tooltip ${saved
                        ? 'bg-gradient-to-br from-red-500 to-pink-500 text-white shadow-xl shadow-red-500/40 scale-110'
                        : 'bg-white/80 text-slate-400 hover:bg-gradient-to-br hover:from-red-500 hover:to-pink-500 hover:text-white hover:shadow-xl hover:shadow-red-500/40 hover:scale-110'
                        }`}
                    onClick={handleToggleWishlist}
                    aria-label={saved ? 'Hapus dari wishlist' : 'Simpan ke wishlist'}
                    data-tooltip={saved ? 'Hapus dari wishlist' : 'Simpan ke wishlist'}
                >
                    <Heart
                        className={`w-6 h-6 transition-all ${saved ? 'fill-current' : ''}`}
                    />
                </button>

                {/* Bottom Info on Image - Shows on hover */}
                <div className="absolute bottom-0 left-0 right-0 p-3 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                    <div className="flex items-center gap-2">
                        {product.penjual?.avatar ? (
                            <img
                                src={product.penjual.avatar}
                                alt={`Foto profil ${product.penjual.nama}`}
                                loading="lazy"
                                className="w-7 h-7 rounded-full object-cover border-2 border-white shadow-md"
                                referrerPolicy="no-referrer"
                            />
                        ) : (
                            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center border-2 border-white shadow-md">
                                <span className="text-[10px] text-white font-bold">{product.penjual?.nama?.charAt(0) || 'U'}</span>
                            </div>
                        )}
                        <span className="text-white text-xs font-medium drop-shadow-lg truncate flex items-center gap-1">
                            {product.penjual?.nama || 'Penjual'}
                            {isVerified && <BadgeCheck className="w-3.5 h-3.5 text-blue-400 fill-blue-400/10" />}
                        </span>
                    </div>
                </div>

                {/* Sold Overlay */}
                {isSold && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/70 backdrop-blur-sm z-20">
                        <div className="bg-gradient-to-r from-slate-800 to-slate-900 text-white text-sm font-bold px-6 py-2.5 rounded-full shadow-2xl border border-white/10">
                            <span className="flex items-center gap-2">
                                <CheckCheck className="w-5 h-5" />
                                TERJUAL
                            </span>
                        </div>
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="p-3.5">
                {/* Product Name */}
                <h3 className="font-semibold text-slate-800 text-sm leading-snug line-clamp-2 mb-2 min-h-[2.5rem] group-hover:text-blue-600 transition-colors duration-200">
                    {product.namaBarang}
                </h3>

                {/* Price - Big and Bold */}
                {/* Price Section */}
                <div className="mb-3">
                    {product.originalPrice && product.originalPrice > product.harga ? (
                        <div className="flex flex-col">
                            <div className="flex items-center gap-2 mb-0.5">
                                <span className="text-xs text-slate-400 line-through decoration-slate-400/50">
                                    {formatPrice(product.originalPrice)}
                                </span>
                                <span className="text-[10px] font-bold text-red-500 bg-red-50 px-1.5 py-0.5 rounded-md">
                                    {Math.round(((product.originalPrice - product.harga) / product.originalPrice) * 100)}% Save
                                </span>
                            </div>
                            <div className={`text-xl font-extrabold tracking-tight ${isSold ? 'text-slate-400 line-through' : 'text-blue-600'}`}>
                                {formatPrice(product.harga)}
                            </div>
                        </div>
                    ) : (
                        <div className={`text-xl font-extrabold tracking-tight ${isSold ? 'text-slate-400 line-through' : 'bg-gradient-to-r from-blue-600 to-blue-500 bg-clip-text text-transparent'}`}>
                            {formatPrice(product.harga)}
                        </div>
                    )}
                </div>

                {/* Footer Row */}
                <div className="flex items-center justify-between gap-2 pt-3 border-t border-slate-100">
                    {/* Location */}
                    <div className="flex items-center gap-1 text-slate-500 bg-slate-50 px-2 py-1 rounded-full">
                        <MapPin className="w-3.5 h-3.5 text-blue-500" />
                        <span className="text-[11px] font-medium">{product.lokasi || 'UNESA'}</span>
                    </div>

                    {/* Time */}
                    {product.createdAt && (
                        <div className="flex items-center gap-1 text-slate-400">
                            <Clock className="w-3 h-3" />
                            <span className="text-[10px] font-medium">{timeAgoShort(product.createdAt)}</span>
                        </div>
                    )}
                </div>
            </div>
        </Link>
    );
}

export default ProductCard;
