import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import productService from '../services/productService';
import chatService from '../services/chatService';
import wishlistService from '../services/wishlistService';
import reportService from '../services/reportService';
import ProductCard from '../components/ProductCard';
import useAuthStore from '../store/authStore';
import useLoginModalStore from '../store/loginModalStore';
import { useToast } from '../components/ToastProvider';
import { formatPrice, timeAgo } from '../utils/formatUtils';
import {
    Home, ChevronRight, Heart, Share2, SlidersHorizontal, Package, MapPin,
    PenLine, BookOpen, Calendar, QrCode, Tag, ShieldCheck, Cpu, Ruler, Palette,
    Layers, Car, Settings, PenTool, Timer, Banknote, PiggyBank,
    Hourglass, FileText, Eye, Ban, Edit, MessageCircle, Flag, ArrowRight, X, AlertCircle
} from 'lucide-react';

const SPEC_ICON_MAP = {
    category: SlidersHorizontal,
    verified: ShieldCheck, // Using ShieldCheck for 'Kondisi' here as it was 'verified' in previous mapping context, or keep it generic
    inventory_2: Package,
    location_on: MapPin,
    edit_note: PenLine,
    menu_book: BookOpen,
    calendar_month: Calendar,
    qr_code: QrCode,
    branding_watermark: Tag,
    security: ShieldCheck,
    memory: Cpu,
    straighten: Ruler,
    palette: Palette,
    texture: Layers,
    two_wheeler: Car, // Using Car for general vehicle
    calendar_today: Calendar,
    settings: Settings,
    design_services: PenTool,
    timer: Timer,
    payments: Banknote,
    savings: PiggyBank,
    hourglass_bottom: Hourglass,
    hourglass_top: Hourglass,
};

const reportCategories = [
    { value: 'penipuan', label: 'Penipuan' },
    { value: 'produk_palsu', label: 'Produk Palsu / Tidak Sesuai' },
    { value: 'konten_tidak_pantas', label: 'Konten Tidak Pantas' },
    { value: 'harga_tidak_wajar', label: 'Harga Tidak Wajar' },
    { value: 'spam', label: 'Spam / Iklan Berlebihan' },
    { value: 'lainnya', label: 'Lainnya' },
];

function ProductDetailPage() {
    const { id } = useParams();
    const toast = useToast();
    const { user } = useAuthStore();
    const { openLoginModal } = useLoginModalStore();
    const [product, setProduct] = useState(null);
    const [relatedProducts, setRelatedProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedImage, setSelectedImage] = useState(0);
    const [copied, setCopied] = useState(false);
    const [saved, setSaved] = useState(false);
    const [processingChat, setProcessingChat] = useState(false);
    const [processingWishlist, setProcessingWishlist] = useState(false);

    // Report modal states
    const [showReportModal, setShowReportModal] = useState(false);
    const [reportCategory, setReportCategory] = useState('');
    const [reportSubject, setReportSubject] = useState('');
    const [reportDescription, setReportDescription] = useState('');
    const [reportEvidence, setReportEvidence] = useState([]);
    const [submittingReport, setSubmittingReport] = useState(false);

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                setLoading(true);
                const response = await productService.getProduct(id);
                setProduct(response.data);

                // Fetch related products from same category
                const relatedRes = await productService.getProducts({ kategori: response.data.kategori });
                setRelatedProducts((relatedRes.data || []).filter(p => p._id !== id).slice(0, 4));

                // Check if product is in wishlist
                if (user) {
                    try {
                        const wishlistCheck = await wishlistService.checkWishlist(id);
                        setSaved(wishlistCheck.inWishlist);
                    } catch {
                        setSaved(false);
                    }
                } else {
                    const wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
                    setSaved(wishlist.includes(id));
                }

                // Track product view and save to recently viewed
                if (user) {
                    // For logged-in users, track via API (data persisted in database)
                    productService.trackProductView(id);
                } else {
                    // For guests, save to localStorage
                    const recentlyViewed = JSON.parse(localStorage.getItem('recentlyViewed') || '[]');
                    const productData = {
                        _id: response.data._id,
                        namaBarang: response.data.namaBarang,
                        harga: response.data.harga,
                        gambar: response.data.gambar,
                        kondisi: response.data.kondisi,
                        lokasi: response.data.lokasi,
                        penjual: response.data.penjual,
                    };
                    const filtered = recentlyViewed.filter(p => p._id !== id);
                    const updated = [productData, ...filtered].slice(0, 10);
                    localStorage.setItem('recentlyViewed', JSON.stringify(updated));
                }
            } catch (err) {
                setError(err.response?.data?.message || 'Produk tidak ditemukan');
            } finally {
                setLoading(false);
            }
        };

        fetchProduct();
    }, [id, user]);

    const getConditionBadge = (kondisi) => {
        const styles = {
            'Baru': 'bg-green-500 text-white',
            'Seperti Baru': 'bg-emerald-500 text-white',
            'Bekas - Mulus': 'bg-blue-500 text-white',
            'Lecet Pemakaian': 'bg-amber-500 text-white',
        };
        return styles[kondisi] || 'bg-slate-500 text-white';
    };

    const handleShare = async () => {
        const shareUrl = window.location.href;
        const shareText = `Lihat ${product.namaBarang} di LapakNesa - ${formatPrice(product.harga)}`;

        if (navigator.share) {
            try {
                await navigator.share({
                    title: product.namaBarang,
                    text: shareText,
                    url: shareUrl,
                });
            } catch {
                // User cancelled or error
            }
        } else {
            await navigator.clipboard.writeText(shareUrl);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const handleSaveWishlist = async () => {
        if (!user) {
            const wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
            if (saved) {
                const newWishlist = wishlist.filter(item => item !== id);
                localStorage.setItem('wishlist', JSON.stringify(newWishlist));
                setSaved(false);
            } else {
                wishlist.push(id);
                localStorage.setItem('wishlist', JSON.stringify(wishlist));
                setSaved(true);
            }
            return;
        }

        if (processingWishlist) return;
        setProcessingWishlist(true);
        try {
            const response = await wishlistService.toggleWishlist(id);
            setSaved(response.inWishlist);
        } catch (error) {
            console.error('Wishlist error:', error);
        } finally {
            setProcessingWishlist(false);
        }
    };

    const handleStartChat = async () => {
        if (!user) {
            openLoginModal();
            return;
        }
        if (processingChat) return;

        setProcessingChat(true);
        try {
            const response = await chatService.createConversation(product.penjual?._id, product._id);
            const conversation = response.data;

            const prefillMessage = `Halo, apakah ${product.namaBarang} masih tersedia?`;
            window.dispatchEvent(new CustomEvent('openChatWithConversation', {
                detail: { conversation: conversation, prefillMessage }
            }));
        } catch (error) {
            console.error('Failed to start chat:', error);
            alert('Gagal memulai chat');
        } finally {
            setProcessingChat(false);
        }
    };

    // Report handlers
    const resetReportForm = () => {
        setReportCategory('');
        setReportSubject('');
        setReportDescription('');
        setReportEvidence([]);
    };

    const handleCloseReportModal = () => {
        setShowReportModal(false);
        resetReportForm();
    };

    const handleReportImageUpload = (e) => {
        const files = Array.from(e.target.files);
        if (files.length + reportEvidence.length > 3) {
            toast.error('Maksimal 3 gambar');
            return;
        }

        files.forEach(file => {
            const reader = new FileReader();
            reader.onload = (ev) => {
                setReportEvidence(prev => [...prev, ev.target.result]);
            };
            reader.readAsDataURL(file);
        });
    };

    const removeReportImage = (index) => {
        setReportEvidence(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmitReport = async (e) => {
        e.preventDefault();

        if (!reportCategory) {
            toast.error('Pilih kategori masalah');
            return;
        }
        if (!reportSubject.trim()) {
            toast.error('Judul laporan wajib diisi');
            return;
        }
        if (!reportDescription.trim()) {
            toast.error('Deskripsi wajib diisi');
            return;
        }

        setSubmittingReport(true);
        try {
            await reportService.createReport({
                type: 'product',
                targetProductId: product._id,
                category: reportCategory,
                subject: reportSubject,
                description: reportDescription,
                evidence: reportEvidence,
            });
            toast.success('Laporan berhasil dikirim! Tim kami akan meninjau.');
            handleCloseReportModal();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Gagal mengirim laporan');
        } finally {
            setSubmittingReport(false);
        }
    };

    const isSold = product?.status === 'terjual';
    const isOwner = user && product?.penjual?._id === user._id;

    // Loading & Error States
    if (loading) return <LoadingState />;
    if (error) return <ErrorState error={error} />;

    const images = product.gambar ? [product.gambar] : [];
    const hasImage = images.length > 0;
    const placeholderImage = 'https://placehold.co/600x450?text=No+Image';
    const isSewa = product.tipeTransaksi === 'sewa';
    const isJasa = product.tipeTransaksi === 'jasa';

    return (
        <main className="flex-grow w-full bg-slate-50 min-h-screen pb-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">

                {/* 1. Breadcrumb */}
                <nav aria-label="Breadcrumb" className="flex mb-6 overflow-x-auto whitespace-nowrap pb-2">
                    <ol className="inline-flex items-center space-x-1 md:space-x-2 text-sm text-slate-500">
                        <li className="inline-flex items-center">
                            <Link className="hover:text-blue-600 transition-colors flex items-center gap-1" to="/">
                                <Home className="w-4 h-4" />
                                Home
                            </Link>
                        </li>
                        <li>
                            <div className="flex items-center">
                                <ChevronRight className="w-4 h-4 mx-1 text-slate-400" />
                                <Link className="hover:text-blue-600 transition-colors" to={`/jelajah?kategori=${product.kategori}`}>
                                    {product.kategori}
                                </Link>
                            </div>
                        </li>
                        <li aria-current="page">
                            <div className="flex items-center">
                                <ChevronRight className="w-4 h-4 mx-1 text-slate-400" />
                                <span className="font-medium text-slate-900 truncate max-w-[200px]">{product.namaBarang}</span>
                            </div>
                        </li>
                    </ol>
                </nav>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">

                    {/* LEFT COLUMN: Gallery & Specs */}
                    <div className="lg:col-span-8 space-y-8">

                        {/* 2. Hero Gallery */}
                        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
                            <div className="aspect-[16/10] w-full bg-slate-100 relative group">
                                <img
                                    src={hasImage ? images[selectedImage] : placeholderImage}
                                    alt={product.namaBarang}
                                    className={`w-full h-full object-contain mix-blend-multiply ${isSold ? 'grayscale opacity-70' : ''}`}
                                />
                                {/* Wishlist & Share Overlay */}
                                <div className="absolute top-4 right-4 flex flex-col gap-2">
                                    <button
                                        onClick={handleSaveWishlist}
                                        className={`p-3 rounded-full shadow-lg transition-all transform hover:scale-105 ${saved ? 'bg-red-500 text-white' : 'bg-white text-slate-400 hover:text-red-500'
                                            }`}
                                    >
                                        <Heart className={`w-5 h-5 ${saved ? 'fill-current' : ''}`} />
                                    </button>
                                    <button
                                        onClick={handleShare}
                                        className="p-3 bg-white rounded-full shadow-lg text-slate-400 hover:text-blue-500 transition-all transform hover:scale-105"
                                    >
                                        <Share2 className="w-5 h-5" />
                                    </button>
                                </div>

                                {/* Status Badges */}
                                <div className="absolute top-4 left-4 flex flex-col gap-2">
                                    <span className={`px-4 py-1.5 text-xs font-bold rounded-full shadow-lg backdrop-blur-md uppercase tracking-wider ${getConditionBadge(product.kondisi)}`}>
                                        {product.kondisi}
                                    </span>
                                    {product.tipeTransaksi && product.tipeTransaksi !== 'jual' && (
                                        <span className="px-4 py-1.5 text-xs font-bold rounded-full shadow-lg bg-indigo-500 text-white uppercase tracking-wider backdrop-blur-md">
                                            {product.tipeTransaksi === 'sewa' ? 'Disewakan' : 'Jasa'}
                                        </span>
                                    )}
                                </div>

                                {isSold && (
                                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[2px]">
                                        <div className="bg-red-600 text-white text-3xl font-black px-10 py-4 rounded-2xl shadow-2xl transform -rotate-6 border-4 border-white">
                                            TERJUAL
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* 3. Product Specifications (Category Specific) */}
                        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm">
                            <h3 className="text-xl font-bold text-slate-900 mb-6">
                                Spesifikasi Produk
                            </h3>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-12">
                                <SpecItem label="Kategori" value={product.kategori} icon="category" />
                                <SpecItem label="Kondisi" value={product.kondisi} icon="verified" />
                                {product.stok > 0 && <SpecItem label="Stok" value={`${product.stok} unit`} icon="inventory_2" />}
                                <SpecItem label="Lokasi COD" value={product.lokasi} icon="location_on" />

                                {/* Dynamic Details */}
                                {product.kategori === 'Buku' && product.bukuDetails && (
                                    <>
                                        <SpecItem label="Penulis" value={product.bukuDetails.author} icon="edit_note" />
                                        <SpecItem label="Penerbit" value={product.bukuDetails.publisher} icon="menu_book" />
                                        <SpecItem label="Tahun Terbit" value={product.bukuDetails.year} icon="calendar_month" />
                                        <SpecItem label="ISBN" value={product.bukuDetails.isbn} icon="qr_code" />
                                    </>
                                )}
                                {product.kategori === 'Elektronik' && product.elektronikDetails && (
                                    <>
                                        <SpecItem label="Merek" value={product.elektronikDetails.brand} icon="branding_watermark" />
                                        <SpecItem label="Garansi" value={product.elektronikDetails.warranty} icon="security" />
                                        <SpecItem label="Spesifikasi" value={product.elektronikDetails.specs} icon="memory" fullWidth />
                                    </>
                                )}
                                {product.kategori === 'Fashion' && product.fashionDetails && (
                                    <>
                                        <SpecItem label="Merek" value={product.fashionDetails.brand} icon="branding_watermark" />
                                        <SpecItem label="Ukuran" value={product.fashionDetails.size} icon="straighten" />
                                        <SpecItem label="Warna" value={product.fashionDetails.color} icon="palette" />
                                        <SpecItem label="Bahan" value={product.fashionDetails.material} icon="texture" />
                                    </>
                                )}
                                {product.kategori === 'Otomotif' && product.otomotifDetails && (
                                    <>
                                        <SpecItem label="Tipe" value={product.otomotifDetails.tipeOtomotif} icon="two_wheeler" className="capitalize" />
                                        <SpecItem label="Merek" value={product.otomotifDetails.brand} icon="branding_watermark" />
                                        {product.otomotifDetails.year && <SpecItem label="Tahun" value={product.otomotifDetails.year} icon="calendar_today" />}
                                        {product.otomotifDetails.transmission && <SpecItem label="Transmisi" value={product.otomotifDetails.transmission} icon="settings" />}
                                    </>
                                )}
                                {product.kategori === 'Jasa' && product.jasaDetails && (
                                    <>
                                        <SpecItem label="Jenis Layanan" value={product.jasaDetails.serviceType} icon="design_services" />
                                        <SpecItem label="Durasi" value={product.jasaDetails.duration} icon="timer" />
                                        <SpecItem label="Tipe Harga" value={product.jasaDetails.priceType} icon="payments" className="capitalize" />
                                    </>
                                )}
                                {/* Rental Details */}
                                {isSewa && product.rentalDetails && (
                                    <>
                                        <SpecItem label="Deposit" value={product.rentalDetails.deposit ? formatPrice(product.rentalDetails.deposit) : '-'} icon="savings" />
                                        <SpecItem label="Min. Sewa" value={`${product.rentalDetails.minDuration} Hari`} icon="hourglass_bottom" />
                                        <SpecItem label="Max. Sewa" value={`${product.rentalDetails.maxDuration} Hari`} icon="hourglass_top" />
                                    </>
                                )}
                            </div>
                        </div>

                        {/* 4. Description */}
                        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm">
                            <h3 className="text-xl font-bold text-slate-900 mb-4">
                                Deskripsi
                            </h3>
                            <div className="prose prose-slate max-w-none text-slate-600 leading-relaxed whitespace-pre-line">
                                {product.deskripsi || 'Tidak ada deskripsi yang disertakan oleh penjual.'}
                            </div>
                        </div>
                    </div>

                    {/* RIGHT COLUMN: Sticky Sidebar */}
                    <div className="lg:col-span-4 min-w-0">
                        <div className="sticky top-24 space-y-6">

                            {/* Main Info Card */}
                            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
                                <h1 className="text-2xl font-bold text-slate-900 mb-2 leading-snug">
                                    {product.namaBarang}
                                </h1>
                                <div className="flex items-center gap-3 text-sm text-slate-500 mb-6">
                                    <span className="flex items-center gap-1">
                                        <Calendar className="w-4 h-4" />
                                        {timeAgo(product.createdAt)}
                                    </span>
                                    <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                                    <span className="flex items-center gap-1">
                                        <Eye className="w-4 h-4" />
                                        {product.viewCount} dilihat
                                    </span>
                                </div>

                                <div className="mb-6">
                                    {product.originalPrice && product.originalPrice > product.harga && (
                                        <div className="mb-1">
                                            <div className="flex items-center gap-3 mb-1">
                                                <span className="text-lg text-slate-400 line-through decoration-slate-400/50 font-medium">
                                                    {formatPrice(product.originalPrice)}
                                                </span>
                                                <span className="text-xs font-bold text-red-600 bg-red-50 px-2 py-1 rounded-lg border border-red-100">
                                                    Hemat {Math.round(((product.originalPrice - product.harga) / product.originalPrice) * 100)}%
                                                </span>
                                            </div>
                                        </div>
                                    )}
                                    <div className="text-3xl font-extrabold text-blue-600 flex items-baseline flex-wrap">
                                        {formatPrice(product.harga)}
                                        {isJasa && product.jasaDetails?.priceType && <span className="text-sm font-medium text-slate-500 ml-1">/{product.jasaDetails.priceType.replace('per ', '')}</span>}
                                        {isSewa && <span className="text-sm font-medium text-slate-500 ml-1">/hari</span>}
                                    </div>
                                    {isSewa && (
                                        <div className="mt-2 text-sm text-slate-500 space-y-1">
                                            {product.rentalDetails?.pricePerWeek && <div className="flex justify-between"><span>Mingguan:</span> <span className="font-semibold text-slate-700">{formatPrice(product.rentalDetails.pricePerWeek)}</span></div>}
                                            {product.rentalDetails?.pricePerMonth && <div className="flex justify-between"><span>Bulanan:</span> <span className="font-semibold text-slate-700">{formatPrice(product.rentalDetails.pricePerMonth)}</span></div>}
                                        </div>
                                    )}
                                </div>

                                {/* Seller Profile */}
                                <div className="p-4 bg-slate-50 rounded-2xl mb-6">
                                    <Link to={`/penjual/${product.penjual?._id}`} className="flex items-center gap-3 group">
                                        <div className="size-12 rounded-full bg-white ring-2 ring-white shadow-sm overflow-hidden flex-shrink-0">
                                            {product.penjual?.avatar ? (
                                                <img src={product.penjual.avatar} alt="" className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold">
                                                    {(product.penjual?.nama || 'U').charAt(0)}
                                                </div>
                                            )}
                                        </div>
                                        <div className="min-w-0">
                                            <h4 className="font-bold text-slate-900 text-sm flex items-center gap-1 group-hover:text-blue-600 transition-colors">
                                                <span className="truncate">{product.penjual?.nama}</span>
                                                {product.penjual?.verification?.status === 'verified' && (
                                                    <ShieldCheck className="w-4 h-4 text-blue-500 shrink-0" fill="currentColor" fillOpacity={0.1} />
                                                )}
                                            </h4>
                                            <p className="text-xs text-slate-500 truncate">{product.penjual?.fakultas || 'Mahasiswa UNESA'}</p>
                                        </div>
                                        <ChevronRight className="w-5 h-5 text-slate-400 ml-auto group-hover:translate-x-1 transition-transform" />
                                    </Link>
                                </div>

                                {/* Actions */}
                                <div className="flex flex-col gap-3">
                                    {isSold ? (
                                        <button disabled className="w-full py-3.5 bg-slate-100 text-slate-400 font-bold rounded-xl flex items-center justify-center gap-2 cursor-not-allowed">
                                            <Ban className="w-5 h-5" />
                                            Stok Habis
                                        </button>
                                    ) : isOwner ? (
                                        <Link to={`/dashboard?tab=edit-product&productId=${product._id}`} className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-200 transition-all flex items-center justify-center gap-2">
                                            <Edit className="w-5 h-5" />
                                            Edit Barang
                                        </Link>
                                    ) : (
                                        <button
                                            onClick={handleStartChat}
                                            disabled={processingChat}
                                            className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-200 transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
                                        >
                                            <MessageCircle className="w-5 h-5" />
                                            {processingChat ? 'Memuat...' : 'Chat Penjual'}
                                        </button>
                                    )}

                                    {!isOwner && (
                                        <button
                                            onClick={() => {
                                                if (!user) openLoginModal();
                                                else setShowReportModal(true);
                                            }}
                                            className="w-full py-3.5 bg-white border border-slate-200 hover:bg-red-50 hover:border-red-200 text-slate-600 hover:text-red-600 font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
                                        >
                                            <Flag className="w-5 h-5" />
                                            Laporkan
                                        </button>
                                    )}
                                </div>
                            </div>

                        </div>
                    </div>

                </div>

                {/* 5. Related Products */}
                {relatedProducts.length > 0 && (
                    <div className="mt-16 pt-10 border-t border-slate-200">
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-2xl font-bold text-slate-900">Mungkin Kamu Suka</h2>
                            <Link to={`/jelajah?kategori=${product.kategori}`} className="text-blue-600 font-semibold hover:underline flex items-center gap-1">
                                Lihat Semua <ArrowRight className="w-5 h-5" />
                            </Link>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
                            {relatedProducts.map(p => <ProductCard key={p._id} product={p} />)}
                        </div>
                    </div>
                )}

                {/* Report Modal Component (Can be extracted) */}
                {showReportModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={handleCloseReportModal} />
                        <div className="relative bg-white rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl">
                            <div className="sticky top-0 bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between z-10">
                                <h2 className="text-lg font-bold text-slate-900">Laporkan Produk</h2>
                                <button onClick={handleCloseReportModal} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                            <form onSubmit={handleSubmitReport} className="p-6 space-y-5">
                                <div className="p-3 bg-red-50 border border-red-100 rounded-xl flex items-center gap-3">
                                    <img src={product.gambar || placeholderImage} alt="" className="size-14 rounded-lg object-cover" />
                                    <div>
                                        <p className="text-xs text-red-600 font-bold uppercase tracking-wide">Melaporkan</p>
                                        <p className="font-semibold text-slate-900 text-sm line-clamp-1">{product.namaBarang}</p>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">Alasan</label>
                                    <select
                                        value={reportCategory}
                                        onChange={(e) => setReportCategory(e.target.value)}
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none bg-slate-50"
                                    >
                                        <option value="">Pilih Alasan...</option>
                                        {reportCategories.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">Judul</label>
                                    <input type="text" value={reportSubject} onChange={e => setReportSubject(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none" placeholder="Masalah utama..." />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">Deskripsi</label>
                                    <textarea value={reportDescription} onChange={e => setReportDescription(e.target.value)} rows={4} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none resize-none" placeholder="Ceritakan lebih detail..." />
                                </div>
                                <button type="submit" disabled={submittingReport} className="w-full py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold shadow-lg shadow-red-200 transition-all">
                                    {submittingReport ? 'Mengirim...' : 'Kirim Laporan'}
                                </button>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </main>
    );
}

// Sub-component for Spec Items
const SpecItem = ({ label, value, icon, fullWidth, className = '' }) => {
    if (!value) return null;
    const Icon = SPEC_ICON_MAP[icon] || Tag;
    return (
        <div className={`flex items-start gap-4 ${fullWidth ? 'col-span-1 sm:col-span-2' : ''} ${className}`}>
            <div className="size-10 rounded-full bg-blue-50 flex items-center justify-center shrink-0 text-blue-600">
                <Icon className="w-5 h-5" />
            </div>
            <div>
                <p className="text-xs text-slate-500 font-medium uppercase tracking-wide mb-0.5">{label}</p>
                <p className="font-semibold text-slate-900 text-base leading-snug">{value}</p>
            </div>
        </div>
    );
};

const LoadingState = () => (
    <div className="min-h-screen bg-slate-50 py-12 px-4">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12">
            <div className="lg:col-span-8 space-y-8">
                <div className="aspect-[16/10] bg-slate-200 rounded-3xl animate-pulse"></div>
                <div className="h-40 bg-slate-200 rounded-3xl animate-pulse"></div>
            </div>
            <div className="lg:col-span-4">
                <div className="h-96 bg-slate-200 rounded-3xl animate-pulse"></div>
            </div>
        </div>
    </div>
);

const ErrorState = ({ error }) => (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
            <div className="size-20 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <AlertCircle className="w-10 h-10" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Produk Tidak Ditemukan</h2>
            <p className="text-slate-500 mb-8">{error}</p>
            <Link to="/" className="inline-flex h-12 items-center justify-center px-8 rounded-xl bg-slate-900 text-white font-bold hover:bg-slate-800 transition-all">
                Kembali ke Home
            </Link>
        </div>
    </div>
);

export default ProductDetailPage;
