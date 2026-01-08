import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
    BadgeCheck, School, UserPlus, UserCheck, MessageCircle, Flag, Settings,
    Package, ShoppingBag, Users, Calendar, Store, X, UserX
} from 'lucide-react';
import userService from '../services/userService';
import productService from '../services/productService';
import chatService from '../services/chatService';
import reportService from '../services/reportService';
import ProductCard from '../components/ProductCard';
import useAuthStore from '../store/authStore';
import useLoginModalStore from '../store/loginModalStore';
import { useToast } from '../components/ToastProvider';

const reportCategories = [
    { value: 'penipuan', label: 'Penipuan' },
    { value: 'pelecehan', label: 'Pelecehan' },
    { value: 'akun_palsu', label: 'Akun Palsu' },
    { value: 'spam', label: 'Spam' },
    { value: 'lainnya', label: 'Lainnya' },
];

function SellerPage() {
    const { id } = useParams();
    const toast = useToast();
    const { user } = useAuthStore();
    const { openLoginModal } = useLoginModalStore();

    const [seller, setSeller] = useState(null);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isFollowing, setIsFollowing] = useState(false);
    const [processingFollow, setProcessingFollow] = useState(false);
    const [processingChat, setProcessingChat] = useState(false);
    const [activeTab, setActiveTab] = useState('tersedia');

    // Report modal states
    const [showReportModal, setShowReportModal] = useState(false);
    const [reportCategory, setReportCategory] = useState('');
    const [reportSubject, setReportSubject] = useState('');
    const [reportDescription, setReportDescription] = useState('');
    const [reportEvidence, setReportEvidence] = useState([]);
    const [submittingReport, setSubmittingReport] = useState(false);

    useEffect(() => {
        const fetchSellerData = async () => {
            try {
                setLoading(true);

                // Fetch seller profile
                const profileRes = await userService.getProfile(id);
                setSeller(profileRes.data);

                // Fetch seller's products
                const productsRes = await productService.getProducts({ penjual: id });
                setProducts(productsRes.data || []);

                // Check following status
                if (user && user._id !== id) {
                    try {
                        const followRes = await userService.checkFollowing(id);
                        setIsFollowing(followRes.data?.isFollowing || false);
                    } catch {
                        setIsFollowing(false);
                    }
                }
            } catch (err) {
                setError(err.response?.data?.message || 'Penjual tidak ditemukan');
            } finally {
                setLoading(false);
            }
        };

        fetchSellerData();
    }, [id, user]);

    const handleFollow = async () => {
        if (!user) {
            openLoginModal();
            return;
        }
        if (processingFollow) return;

        setProcessingFollow(true);
        try {
            if (isFollowing) {
                await userService.unfollowUser(id);
                setIsFollowing(false);
                setSeller(prev => ({ ...prev, followersCount: (prev.followersCount || 1) - 1 }));
                toast.success('Berhenti mengikuti');
            } else {
                await userService.followUser(id);
                setIsFollowing(true);
                setSeller(prev => ({ ...prev, followersCount: (prev.followersCount || 0) + 1 }));
                toast.success('Mulai mengikuti');
            }
        } catch {
            toast.error('Gagal memproses');
        } finally {
            setProcessingFollow(false);
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
            // clearProduct = true to remove product context when starting chat from seller page
            const response = await chatService.createConversation(id, null, true);
            const conversation = response.data;
            window.dispatchEvent(new CustomEvent('openChatWithConversation', {
                detail: {
                    conversation,
                    prefillMessage: `Halo ${seller?.nama || 'Kak'}, saya tertarik dengan barang yang kamu jual.`
                }
            }));
        } catch {
            toast.error('Gagal memulai chat');
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
                type: 'user',
                targetUserId: id,
                category: reportCategory,
                subject: reportSubject,
                description: reportDescription,
                evidence: reportEvidence,
            });
            toast.success('Laporan berhasil dikirim!');
            handleCloseReportModal();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Gagal mengirim laporan');
        } finally {
            setSubmittingReport(false);
        }
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('id-ID', {
            month: 'long',
            year: 'numeric',
        });
    };

    const isOwnProfile = user && user._id === id;

    // Filter products by status
    const filteredProducts = products.filter(p => {
        if (activeTab === 'tersedia') return p.status === 'tersedia';
        if (activeTab === 'terjual') return p.status === 'terjual';
        return true;
    });

    const stats = {
        total: products.length,
        tersedia: products.filter(p => p.status === 'tersedia').length,
        terjual: products.filter(p => p.status === 'terjual').length,
    };

    // Loading State
    if (loading) return <LoadingState />;

    // Error State
    if (error) return <ErrorState error={error} />;

    return (
        <main className="flex-grow w-full bg-slate-100 min-h-screen pb-20">

            {/* 1. Premium Header with Mesh Cover */}
            <div className="relative">
                {/* Dark Mesh Cover */}
                <div className="h-48 sm:h-56 w-full bg-slate-900 relative overflow-hidden">
                    {/* Modern Mesh Gradient */}
                    <div className="absolute inset-0 opacity-40 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-700 via-slate-900 to-slate-900"></div>
                    <div className="absolute inset-0 bg-[url('/pattern.svg')] opacity-5"></div>
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative -mt-20">
                    {/* Floating Card */}
                    <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 p-6 sm:p-8">
                        <div className="flex flex-col md:flex-row gap-8 items-start">

                            {/* Avatar (Left) */}
                            <div className="shrink-0 mx-auto md:mx-0 -mt-16 md:-mt-12 relative">
                                <div className="size-32 sm:size-36 rounded-2xl bg-white p-1.5 shadow-lg ring-1 ring-slate-100">
                                    <div className="w-full h-full rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 overflow-hidden relative border border-slate-100">
                                        {seller.avatar ? (
                                            <img src={seller.avatar} alt={seller.nama} className="w-full h-full object-cover" />
                                        ) : (
                                            <span className="text-5xl font-bold text-slate-300">{(seller.nama?.charAt(0) || 'U').toUpperCase()}</span>
                                        )}
                                    </div>
                                </div>
                                {seller.verification?.status === 'verified' && (
                                    <div className="absolute -bottom-2 -right-2 bg-blue-600 text-white p-1.5 rounded-full ring-4 ring-white shadow flex items-center justify-center animate-bounce-short" title="Terverifikasi">
                                        <BadgeCheck className="w-[22px] h-[22px]" />
                                    </div>
                                )}
                            </div>

                            {/* Info & Widgets (Right) */}
                            <div className="flex-1 min-w-0 w-full">
                                <div className="flex flex-col md:flex-row justify-between items-start gap-6">
                                    <div className="text-center md:text-left w-full md:w-auto">
                                        <h1 className="text-3xl font-bold text-slate-900 leading-tight">
                                            {seller.nama}
                                        </h1>
                                        <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mt-2 text-sm text-slate-500">
                                            {seller.fakultas && (
                                                <span className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-3 py-1 rounded-full text-slate-700 font-medium">
                                                    <School className="w-[18px] h-[18px] text-slate-400 shrink-0" />
                                                    {seller.fakultas}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    {!isOwnProfile ? (
                                        <div className="flex items-center gap-3 w-full md:w-auto justify-center md:justify-end">
                                            <button
                                                onClick={handleFollow}
                                                disabled={processingFollow}
                                                className={`h-11 px-6 rounded-xl font-bold transition-all flex items-center gap-2 ${isFollowing
                                                    ? 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
                                                    : 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-200'
                                                    }`}
                                            >
                                                {isFollowing ? <UserCheck className="w-5 h-5" /> : <UserPlus className="w-5 h-5" />}
                                                {isFollowing ? 'Mengikuti' : 'Ikuti'}
                                            </button>
                                            <button
                                                onClick={handleStartChat}
                                                disabled={processingChat}
                                                className="h-11 px-6 rounded-xl font-bold bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 hover:border-slate-300 transition-all flex items-center gap-2"
                                            >
                                                <MessageCircle className="w-5 h-5" />
                                                Chat
                                            </button>
                                            <button
                                                onClick={() => {
                                                    if (!user) openLoginModal();
                                                    else setShowReportModal(true);
                                                }}
                                                className="size-11 flex items-center justify-center rounded-xl border border-slate-200 text-slate-400 hover:text-red-500 hover:bg-red-50 hover:border-red-200 transition-colors"
                                                title="Laporkan"
                                            >
                                                <Flag className="w-5 h-5" />
                                            </button>
                                        </div>
                                    ) : (
                                        <Link
                                            to="/dashboard"
                                            className="h-11 px-6 flex items-center justify-center gap-2 rounded-xl font-bold bg-slate-900 text-white hover:bg-slate-800 transition-all w-full md:w-auto shadow-lg shadow-slate-200"
                                        >
                                            <Settings className="w-5 h-5" />
                                            Kelola Profil
                                        </Link>
                                    )}
                                </div>

                                {/* Stats Widgets */}
                                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
                                    <StatWidget label="Total Produk" value={stats.total} Icon={Package} />
                                    <StatWidget label="Terjual" value={stats.terjual} Icon={ShoppingBag} />
                                    <StatWidget label="Pengikut" value={seller.followersCount || 0} Icon={Users} />
                                    <StatWidget label="Bergabung" value={formatDate(seller.createdAt)} Icon={Calendar} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 space-y-6">

                {/* 2. Products Grid */}
                <div>
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-bold text-slate-900">
                            Etalase Toko
                        </h2>

                        <div className="bg-white rounded-lg p-1 shadow-sm border border-slate-200 flex">
                            <TabButton
                                active={activeTab === 'tersedia'}
                                onClick={() => setActiveTab('tersedia')}
                                label={`Tersedia (${stats.tersedia})`}
                            />
                            <TabButton
                                active={activeTab === 'terjual'}
                                onClick={() => setActiveTab('terjual')}
                                label={`Terjual (${stats.terjual})`}
                            />
                        </div>
                    </div>

                    {filteredProducts.length === 0 ? (
                        <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-16 text-center">
                            <div className="size-20 bg-slate-50 text-slate-300 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Package className="w-10 h-10" />
                            </div>
                            <h3 className="text-lg font-bold text-slate-900 mb-1">Belum Ada Barang</h3>
                            <p className="text-slate-500 text-sm">
                                {activeTab === 'tersedia'
                                    ? 'Penjual ini belum memiliki barang yang dijual saat ini.'
                                    : 'Belum ada riwayat penjualan.'}
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                            {filteredProducts.map(product => (
                                <ProductCard key={product._id} product={product} />
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Report Modal */}
            {showReportModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={handleCloseReportModal} />
                    <div className="relative bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl">
                        <div className="sticky top-0 bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between z-10">
                            <h2 className="text-lg font-bold text-slate-900">Laporkan Pengguna</h2>
                            <button onClick={handleCloseReportModal} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <form onSubmit={handleSubmitReport} className="p-6 space-y-5">
                            <div className="p-3 bg-red-50 border border-red-100 rounded-xl flex items-center gap-3">
                                <div className="size-10 rounded-full bg-red-100 flex items-center justify-center text-red-600 font-bold shrink-0">
                                    {(seller.nama?.charAt(0) || 'U').toUpperCase()}
                                </div>
                                <div className="min-w-0">
                                    <p className="text-xs text-red-600 font-bold uppercase tracking-wide">Melaporkan</p>
                                    <p className="font-semibold text-slate-900 text-sm truncate">{seller.nama}</p>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Alasan</label>
                                <div className="grid grid-cols-2 gap-2">
                                    {reportCategories.map((cat) => (
                                        <button
                                            key={cat.value}
                                            type="button"
                                            onClick={() => setReportCategory(cat.value)}
                                            className={`p-3 rounded-xl border text-left transition-all ${reportCategory === cat.value
                                                ? 'border-red-400 bg-red-50 text-red-700'
                                                : 'border-slate-200 hover:border-slate-300 text-slate-600'
                                                }`}
                                        >
                                            <span className="text-sm font-medium">{cat.label}</span>
                                        </button>
                                    ))}
                                </div>
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
        </main>
    );
}

// Stats Widget Component
const StatWidget = ({ label, value, Icon }) => (
    <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 flex items-center gap-3 hover:bg-slate-100 transition-colors group">
        <div className="size-10 rounded-lg bg-white border border-slate-200 text-slate-500 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform shadow-sm">
            <Icon className="w-5 h-5" />
        </div>
        <div className="min-w-0">
            <p className="text-lg font-bold text-slate-900 leading-none truncate">{value}</p>
            <p className="text-[10px] sm:text-xs text-slate-500 mt-1 uppercase tracking-wide font-medium truncate">{label}</p>
        </div>
    </div>
);

const TabButton = ({ active, onClick, label }) => (
    <button
        onClick={onClick}
        className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${active
            ? 'bg-white text-slate-900 shadow-sm ring-1 ring-black/5'
            : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
            }`}
    >
        {label}
    </button>
);

const LoadingState = () => (
    <div className="min-h-screen bg-slate-50 p-8">
        <div className="max-w-5xl mx-auto space-y-8">
            <div className="bg-white rounded-2xl h-64 animate-pulse"></div>
            <div className="grid grid-cols-4 gap-6">
                {[1, 2, 3, 4].map(i => <div key={i} className="h-64 bg-slate-200 rounded-2xl animate-pulse"></div>)}
            </div>
        </div>
    </div>
);

const ErrorState = ({ error }) => (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="text-center">
            <div className="size-20 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <UserX className="w-10 h-10" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Penjual Tidak Ditemukan</h2>
            <p className="text-slate-500 mb-8 max-w-sm mx-auto">{error}</p>
            <Link to="/" className="inline-flex h-12 items-center justify-center px-8 rounded-xl bg-slate-900 text-white font-bold hover:bg-slate-800 transition-all">
                Kembali ke Beranda
            </Link>
        </div>
    </div>
);

export default SellerPage;
