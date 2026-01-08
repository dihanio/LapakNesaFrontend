import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import api from '../services/api';
import wishlistService from '../services/wishlistService';
import productService from '../services/productService';
import ProductCard from '../components/ProductCard';
import SellProductForm from '../components/SellProductForm';
import ReportsTab from '../components/ReportsTab';
import {
    LayoutDashboard, PlusCircle, Package, Heart, Flag, User, Settings,
    X, LogOut, Home, Menu, CheckCircle, Wallet, FolderOpen,
    Edit, Trash2, RefreshCw, Check, Loader2, Compass, ShieldCheck,
    School, MessageCircle, BadgeCheck, Phone, CheckCircle2, AlertCircle, Sparkles, Lightbulb
} from 'lucide-react';
import { useToast } from '../components/ToastProvider';
import { formatPrice, timeAgo } from '../utils/formatUtils';
import { fakultasOptions } from '../constants/formOptions';
import SellerVerificationTab from '../components/SellerVerificationTab';
import ActionModal from '../components/ActionModal';

function DashboardPage() {
    const { user, setUser, logout } = useAuthStore();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const toast = useToast();
    const [products, setProducts] = useState([]);
    // Orders removed - transactions are done directly via chat
    const [wishlist, setWishlist] = useState([]);
    const [loading, setLoading] = useState(true);
    const [recommendedProducts, setRecommendedProducts] = useState([]);
    const [recentlyViewed, setRecentlyViewed] = useState([]);
    const [overviewLoading, setOverviewLoading] = useState(false);

    const [wishlistLoading, setWishlistLoading] = useState(true);
    const [deleteLoading, setDeleteLoading] = useState(null);
    const [markingSold, setMarkingSold] = useState(null);
    const [actionModal, setActionModal] = useState({ isOpen: false, type: null, productId: null, productName: '' });
    const isSeller = user?.role === 'penjual';
    const [activeTab, setActiveTab] = useState(() => {
        const tabParam = new URLSearchParams(window.location.search).get('tab');
        const validTabs = isSeller
            ? ['overview', 'pasang-iklan', 'products', 'wishlist', 'reports', 'profile', 'settings']
            : ['overview', 'verification', 'wishlist', 'reports', 'profile', 'settings'];
        if (tabParam && validTabs.includes(tabParam)) {
            return tabParam;
        }
        return 'overview';
    });
    const [productSubTab, setProductSubTab] = useState('all');
    const [editingProductId, setEditingProductId] = useState(null);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [profileLoading, setProfileLoading] = useState(false);
    const [profileError, setProfileError] = useState('');
    const [formData, setFormData] = useState({
        nim: '',
        fakultas: '',
        whatsapp: '',
    });
    const [stats, setStats] = useState({
        totalPendapatan: 0,
        barangTerjual: 0,
        barangAktif: 0,
    });

    // Sync activeTab with URL query params
    useEffect(() => {
        const tabParam = searchParams.get('tab');
        const productId = searchParams.get('productId');
        const type = searchParams.get('type');

        // Auto-switch to reports tab if coming from product report link
        if (productId && type === 'product') {
            setActiveTab('reports');
            return;
        }

        // Handle Edit Product Link from ProductDetail
        if (tabParam === 'edit-product' && productId) {
            setActiveTab('edit-product');
            setEditingProductId(productId);
            return;
        }

        const validTabs = isSeller
            ? ['overview', 'pasang-iklan', 'edit-product', 'products', 'wishlist', 'reports', 'profile', 'settings']
            : ['overview', 'verification', 'wishlist', 'reports', 'profile', 'settings'];
        if (tabParam && validTabs.includes(tabParam) && tabParam !== activeTab) {
            setActiveTab(tabParam);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchParams, isSeller]);


    useEffect(() => {
        if (user) {
            setFormData({
                nim: user.nim || '',
                fakultas: user.fakultas || '',
                whatsapp: user.whatsapp ? (user.whatsapp.startsWith('62') ? '0' + user.whatsapp.slice(2) : user.whatsapp) : '',
            });
        }
    }, [user]);

    const fetchMyProducts = async () => {
        try {
            setLoading(true);
            const response = await api.get('/products/user/my');
            const myProducts = response.data.data || [];
            setProducts(myProducts);

            const tersedia = myProducts.filter(p => p.status === 'tersedia').length;
            const terjual = myProducts.filter(p => p.status === 'terjual').length;
            const totalHarga = myProducts.filter(p => p.status === 'terjual').reduce((sum, p) => sum + p.harga, 0);

            setStats(prev => ({ ...prev, totalPendapatan: totalHarga, barangTerjual: terjual, barangAktif: tersedia }));
        } catch (error) {
            console.error('Error fetching products:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchBuyerOverviewData = async () => {
        try {
            setOverviewLoading(true);
            const [recData, recentData] = await Promise.all([
                productService.getRecommendedProducts(8),
                productService.getRecentlyViewed(8)
            ]);
            setRecommendedProducts(recData.data || []);
            setRecentlyViewed(recentData.data || []);
        } catch (error) {
            console.error('Error fetching buyer overview:', error);
        } finally {
            setOverviewLoading(false);
        }
    };

    // fetchMyOrders removed - transactions are done directly via chat

    const fetchMyWishlist = async () => {
        try {
            setWishlistLoading(true);
            const response = await wishlistService.getMyWishlist();
            setWishlist(response.data || []);
        } catch (error) {
            console.error('Error fetching wishlist:', error);
        } finally {
            setWishlistLoading(false);
        }
    };

    const handleRemoveFromWishlist = async (productId) => {
        try {
            await wishlistService.removeFromWishlist(productId);
            setWishlist(wishlist.filter(p => p._id !== productId));
            toast.success('Dihapus dari wishlist');
        } catch (error) {
            console.error('Failed to remove from wishlist:', error);
        }
    };

    useEffect(() => {
        if (!user) { navigate('/'); return; }
        if (isSeller) {
            if (activeTab === 'overview' || activeTab === 'products') fetchMyProducts();
        } else {
            if (activeTab === 'overview') fetchBuyerOverviewData();
            setLoading(false);
        }

        fetchMyWishlist();
    }, [user, navigate, isSeller, activeTab]);

    const handleLogout = () => { logout(); localStorage.removeItem('token'); navigate('/'); };

    const handleDelete = (productId, productName) => {
        openActionModal('delete', productId, productName);
    };

    // Open the action modal
    const openActionModal = (type, productId, productName) => {
        setActionModal({ isOpen: true, type, productId, productName });
    };

    // Close the action modal
    const closeActionModal = () => {
        setActionModal({ isOpen: false, type: null, productId: null, productName: '' });
    };

    // Confirm the action from modal
    const confirmActionModal = async () => {
        const { type, productId } = actionModal;
        try {
            if (type === 'delete') {
                setDeleteLoading(productId);
                await api.delete(`/products/${productId}`);
                toast.success('Produk berhasil dihapus!');
            } else {
                setMarkingSold(productId);
                if (type === 'sold') {
                    await api.put(`/products/${productId}`, { status: 'terjual' });
                    toast.success('Produk berhasil ditandai sebagai terjual!');
                } else if (type === 'available') {
                    await api.put(`/products/${productId}`, { status: 'tersedia' });
                    toast.success('Produk berhasil diaktifkan kembali!');
                }
            }
            await fetchMyProducts();
        } catch (error) {
            toast.error('Gagal: ' + (error.response?.data?.message || error.message));
        } finally {
            setMarkingSold(null);
            setDeleteLoading(null);
            closeActionModal();
        }
    };

    // Legacy wrappers that open modal
    const handleMarkAsSold = (productId, productName) => {
        openActionModal('sold', productId, productName);
    };

    const handleMarkAsAvailable = (productId, productName) => {
        openActionModal('available', productId, productName);
    };

    const handleProfileSubmit = async (e) => {
        e.preventDefault();
        setProfileError('');
        if (!formData.nim || !formData.fakultas || !formData.whatsapp) { setProfileError('Semua field wajib diisi'); return; }
        const waNumber = formData.whatsapp.replace(/\D/g, '');
        if (waNumber.length < 10 || waNumber.length > 15) { setProfileError('Nomor WhatsApp tidak valid'); return; }

        try {
            setProfileLoading(true);
            const response = await api.put('/auth/complete-profile', {
                nim: formData.nim,
                fakultas: formData.fakultas,
                whatsapp: formData.whatsapp.startsWith('08') ? '62' + formData.whatsapp.slice(1) : formData.whatsapp,
            });
            setUser(response.data.data);
            toast.success('Profil berhasil diperbarui!');
        } catch (err) {
            setProfileError(err.response?.data?.message || 'Gagal menyimpan profil');
        } finally {
            setProfileLoading(false);
        }
    };

    const filteredProducts = products.filter(product => {
        if (productSubTab === 'all') return true;
        if (productSubTab === 'active') return product.status === 'tersedia';
        if (productSubTab === 'sold') return product.status === 'terjual';
        return true;
    });



    const menuItems = isSeller ? [
        { id: 'overview', Icon: LayoutDashboard, label: 'Overview' },
        { id: 'pasang-iklan', Icon: PlusCircle, label: 'Pasang Iklan', highlight: true },
        { id: 'products', Icon: Package, label: 'Produk Saya', badge: products.length },
        { id: 'wishlist', Icon: Heart, label: 'Wishlist', badge: wishlist.length },
        { id: 'reports', Icon: Flag, label: 'Laporan Saya' },
        { id: 'profile', Icon: User, label: 'Profil Saya' },
        { id: 'settings', Icon: Settings, label: 'Pengaturan' },
    ] : [
        { id: 'overview', Icon: LayoutDashboard, label: 'Overview' },
        { id: 'verification', Icon: BadgeCheck, label: 'Daftar Jadi Penjual', highlight: true },
        { id: 'wishlist', Icon: Heart, label: 'Wishlist', badge: wishlist.length },
        { id: 'reports', Icon: Flag, label: 'Laporan Saya' },
        { id: 'profile', Icon: User, label: 'Profil Saya' },
        { id: 'settings', Icon: Settings, label: 'Pengaturan' },
    ];

    return (
        <div className="min-h-screen bg-slate-100 flex">
            {sidebarOpen && <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={() => setSidebarOpen(false)}></div>}

            {/* Sidebar */}
            {/* Sidebar Redesigned */}
            <aside className={`fixed lg:sticky top-0 h-screen inset-y-0 left-0 z-50 w-72 bg-white border-r border-slate-100 flex flex-col transform transition-transform duration-300 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'} shadow-2xl lg:shadow-none`}>
                <div className="h-20 flex items-center px-8 border-b border-slate-50">
                    <Link to="/" className="flex items-center gap-3 group">
                        <img src="/LN.png" alt="LapakNesa Logo" className="h-10 w-auto group-hover:scale-105 transition-transform duration-300" />
                        <div className="flex flex-col">
                            <span className="text-xl font-bold text-[#0B5FA5] tracking-tight leading-none">Lapak<span className="text-[#F2B705]">Nesa</span></span>
                            <span className="text-[10px] uppercase tracking-widest font-bold text-slate-400 mt-1">Dashboard</span>
                        </div>
                    </Link>
                    <button onClick={() => setSidebarOpen(false)} className="lg:hidden ml-auto p-1 text-slate-400 hover:text-slate-600">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <nav className="flex-1 px-4 py-8 space-y-1 overflow-y-auto custom-scrollbar">
                    <p className="px-4 text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Menu Utama</p>
                    {menuItems.map(item => (
                        <button
                            key={item.id}
                            onClick={() => { setActiveTab(item.id); setSidebarOpen(false); }}
                            className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-bold transition-all duration-200 group relative overflow-hidden ${activeTab === item.id || (activeTab === 'edit-product' && item.id === 'products')
                                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30 translate-x-1'
                                : 'text-slate-500 hover:bg-slate-50 hover:text-blue-600'
                                }`}
                        >
                            <item.Icon className={`w-[22px] h-[22px] transition-transform duration-300 ${activeTab === item.id || (activeTab === 'edit-product' && item.id === 'products') ? 'scale-110' : 'group-hover:scale-110'}`} />
                            <span className="flex-1 text-left relative z-10">{item.label}</span>
                            {item.badge > 0 && (
                                <span className={`px-2 py-0.5 rounded-lg text-[10px] font-bold ${activeTab === item.id || (activeTab === 'edit-product' && item.id === 'products')
                                    ? 'bg-white/20 text-white'
                                    : 'bg-blue-50 text-blue-600'
                                    }`}>{item.badge}</span>
                            )}
                        </button>
                    ))}
                </nav>

                <div className="p-4 border-t border-slate-50 mt-auto">
                    <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                        <div className="flex items-center gap-3 mb-3">
                            {user?.avatar ? (
                                <img src={user.avatar} className="size-10 rounded-full object-cover ring-2 ring-white shadow-sm" referrerPolicy="no-referrer" />
                            ) : (
                                <div className="size-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold border-2 border-white shadow-sm">
                                    {user?.nama?.charAt(0).toUpperCase() || 'U'}
                                </div>
                            )}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-1 text-sm font-bold text-slate-900">
                                    <span className="truncate">{user?.nama}</span>
                                    {isSeller && <BadgeCheck className="w-[14px] h-[14px] text-blue-500 flex-shrink-0" title="Terverifikasi" />}
                                </div>
                                <p className="text-xs text-slate-500 truncate">{isSeller ? 'Penjual' : 'Pembeli'}</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            <Link to="/" className="flex items-center justify-center gap-2 p-2 bg-white rounded-xl text-xs font-bold text-slate-600 hover:text-blue-600 hover:shadow-sm border border-slate-200/50 transition-all">
                                <Home className="w-4 h-4" />
                                Home
                            </Link>
                            <button onClick={handleLogout} className="flex items-center justify-center gap-2 p-2 bg-red-50 rounded-xl text-xs font-bold text-red-600 hover:bg-red-100 border border-red-100 transition-all">
                                <LogOut className="w-4 h-4" />
                                Keluar
                            </button>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col min-w-0 bg-[#f8fafc]">
                <header className="h-20 bg-white/80 backdrop-blur-xl border-b border-slate-100 flex items-center justify-between px-6 lg:px-10 sticky top-0 z-40 transition-all">
                    <div className="flex items-center gap-4">
                        <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 text-slate-500 hover:bg-slate-50 rounded-xl transition-colors">
                            <Menu className="w-6 h-6" />
                        </button>
                        <div>
                            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                                {activeTab === 'overview' && 'Overview'}
                                {activeTab === 'pasang-iklan' && 'Buat Iklan Baru'}
                                {activeTab === 'products' && 'Produk Saya'}
                                {activeTab === 'wishlist' && 'Wishlist Saya'}
                                {activeTab === 'profile' && 'Profil Pengguna'}
                                {activeTab === 'verification' && 'Verifikasi Penjual'}
                                {activeTab === 'settings' && 'Pengaturan Akun'}
                            </h1>
                            <p className="text-sm font-medium text-slate-500 hidden sm:block">
                                {activeTab === 'overview' ? `Selamat datang kembali, ${user?.nama?.split(' ')[0]}!` : 'Kelola aktivitas marketplace kamu disini.'}
                            </p>
                        </div>
                    </div>
                </header>

                <div className="flex-1 p-6 lg:p-10 overflow-auto">
                    {/* Overview Tab */}
                    {activeTab === 'overview' && isSeller && (
                        <div className="space-y-8 max-w-7xl mx-auto">
                            {/* Stats Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-shadow group relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-110 transition-transform"></div>
                                    <div className="relative">
                                        <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center mb-4">
                                            <Package className="w-6 h-6" />
                                        </div>
                                        <p className="text-4xl font-black text-slate-900 mb-1">{stats.barangAktif}</p>
                                        <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">Iklan Aktif</p>
                                    </div>
                                </div>
                                <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-shadow group relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-green-50 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-110 transition-transform"></div>
                                    <div className="relative">
                                        <div className="w-12 h-12 rounded-xl bg-green-100 text-green-600 flex items-center justify-center mb-4">
                                            <CheckCircle className="w-6 h-6" />
                                        </div>
                                        <p className="text-4xl font-black text-slate-900 mb-1">{stats.barangTerjual}</p>
                                        <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">Total Terjual</p>
                                    </div>
                                </div>
                                <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-shadow group relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-amber-50 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-110 transition-transform"></div>
                                    <div className="relative">
                                        <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center mb-4">
                                            <Wallet className="w-6 h-6" />
                                        </div>
                                        <p className="text-3xl font-black text-slate-900 mb-1 truncate" title={formatPrice(stats.totalPendapatan)}>{formatPrice(stats.totalPendapatan)}</p>
                                        <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">Estimasi Pendapatan</p>
                                    </div>
                                </div>
                            </div>

                            {/* Main Dashboard Content Grid */}
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                {/* Left Column: Action & Recent */}
                                <div className="lg:col-span-2 space-y-8">
                                    {/* Recent Products */}
                                    <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
                                        <div className="p-8 border-b border-slate-50 flex items-center justify-between">
                                            <div>
                                                <h2 className="text-xl font-bold text-slate-900">Produk Terbaru</h2>
                                                <p className="text-sm text-slate-500">Iklan yang baru kamu posting.</p>
                                            </div>
                                            <button onClick={() => setActiveTab('products')} className="text-sm font-bold text-blue-600 hover:text-blue-700 bg-blue-50 px-4 py-2 rounded-xl hover:bg-blue-100 transition-colors">
                                                Lihat Semua
                                            </button>
                                        </div>
                                        <div>
                                            {loading ? (
                                                <div className="p-12 text-center">
                                                    <Loader2 className="w-10 h-10 text-blue-500 animate-spin mx-auto" />
                                                </div>
                                            ) : products.length === 0 ? (
                                                <div className="p-12 text-center text-slate-500">
                                                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                                        <Package className="w-8 h-8 text-slate-300" />
                                                    </div>
                                                    <p>Belum ada produk yang diposting.</p>
                                                </div>
                                            ) : (
                                                <div className="divide-y divide-slate-50">
                                                    {products.slice(0, 5).map(p => (
                                                        <Link key={p._id} to={`/produk/${p._id}`} className="flex items-center gap-5 p-6 hover:bg-slate-50 transition-colors group">
                                                            <div className="size-16 rounded-xl bg-slate-100 overflow-hidden shrink-0 border border-slate-100">
                                                                <img src={p.gambar || 'https://placehold.co/80'} alt={p.namaBarang} className="size-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <p className="font-bold text-slate-900 truncate mb-1 text-base">{p.namaBarang}</p>
                                                                <p className="text-sm font-bold text-blue-600">{formatPrice(p.harga)}</p>
                                                            </div>
                                                            <div className="text-right">
                                                                <span className={`px-3 py-1 rounded-full text-xs font-bold ${p.status === 'tersedia' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'
                                                                    }`}>
                                                                    {p.status === 'tersedia' ? 'Aktif' : 'Terjual'}
                                                                </span>
                                                                <p className="text-[10px] text-slate-400 font-medium mt-1">{timeAgo(p.createdAt)}</p>
                                                            </div>
                                                        </Link>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Right Column: Quick Actions */}
                                <div>
                                    <div className="bg-slate-900 rounded-[2rem] p-8 text-white shadow-xl shadow-blue-900/20 relative overflow-hidden">
                                        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600 rounded-full blur-3xl opacity-20 -translate-y-1/2 translate-x-1/2"></div>
                                        <div className="relative z-10">
                                            <h2 className="text-xl font-bold mb-6">Aksi Cepat</h2>
                                            <div className="space-y-3">
                                                <button onClick={() => setActiveTab('pasang-iklan')} className="w-full flex items-center gap-4 p-4 bg-white/10 hover:bg-white/20 rounded-xl transition-all border border-white/10 group backdrop-blur-sm">
                                                    <div className="size-10 rounded-lg bg-blue-500 flex items-center justify-center shadow-lg shadow-blue-500/40 group-hover:scale-110 transition-transform">
                                                        <PlusCircle className="w-5 h-5 text-white" />
                                                    </div>
                                                    <div className="text-left">
                                                        <p className="font-bold text-sm">Pasang Iklan</p>
                                                        <p className="text-[10px] text-blue-200">Jual barang barumu</p>
                                                    </div>
                                                </button>

                                                <button onClick={() => setActiveTab('products')} className="w-full flex items-center gap-4 p-4 bg-white/5 hover:bg-white/10 rounded-xl transition-all border border-white/5 group">
                                                    <div className="size-10 rounded-lg bg-white/10 flex items-center justify-center group-hover:bg-white/20 transition-colors">
                                                        <Package className="w-5 h-5 text-white" />
                                                    </div>
                                                    <div className="text-left">
                                                        <p className="font-bold text-sm">Kelola Produk</p>
                                                        <p className="text-[10px] text-slate-400">Edit atau hapus iklan</p>
                                                    </div>
                                                </button>

                                                <button onClick={() => setActiveTab('settings')} className="w-full flex items-center gap-4 p-4 bg-white/5 hover:bg-white/10 rounded-xl transition-all border border-white/5 group">
                                                    <div className="size-10 rounded-lg bg-white/10 flex items-center justify-center group-hover:bg-white/20 transition-colors">
                                                        <Settings className="w-5 h-5 text-white" />
                                                    </div>
                                                    <div className="text-left">
                                                        <p className="font-bold text-sm">Pengaturan</p>
                                                        <p className="text-[10px] text-slate-400">Update profil kamu</p>
                                                    </div>
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-6 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-[2rem] p-8 text-white shadow-lg shadow-orange-500/20 relative overflow-hidden">
                                        <div className="relative z-10">
                                            <Lightbulb className="w-10 h-10 mb-2" />
                                            <h3 className="font-bold text-lg mb-1">Tips Berjualan</h3>
                                            <p className="text-xs text-orange-50 font-medium mb-4">Gunakan foto yang jelas dan deskripsi yang lengkap agar produkmu cepat laku!</p>
                                            <button className="text-xs font-bold bg-white text-orange-600 px-4 py-2 rounded-lg hover:bg-orange-50 transition-colors">Baca Tips Lainnya</button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Overview Tab (Buyer) */}
                    {activeTab === 'overview' && !isSeller && (
                        <div className="space-y-8 max-w-7xl mx-auto">
                            {/* Stats & Welcome */}
                            <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[2rem] p-8 text-white shadow-xl relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
                                <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-500 opacity-20 rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl"></div>
                                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
                                    <div className="space-y-2">
                                        <h2 className="text-3xl font-black tracking-tight">Hai, {user?.nama}! 👋</h2>
                                        <p className="text-blue-100 font-medium max-w-lg">
                                            Siap mencari barang kebutuhan kuliahmu hari ini? Cek rekomendasi terbaru yang kami pilihkan khusus untukmu.
                                        </p>
                                        <div className="flex flex-wrap gap-3 mt-4">
                                            <Link to="/jelajah" className="px-5 py-2.5 bg-white text-blue-600 rounded-xl font-bold text-sm hover:bg-blue-50 transition-colors shadow-lg shadow-blue-900/20">
                                                Mulai Jelajah
                                            </Link>
                                            <button onClick={() => setActiveTab('wishlist')} className="px-5 py-2.5 bg-blue-700/50 text-white rounded-xl font-bold text-sm hover:bg-blue-700/70 transition-colors backdrop-blur-md border border-white/10 flex items-center gap-2">
                                                <Heart className="w-4 h-4" />
                                                Wishlist ({wishlist.length})
                                            </button>
                                        </div>
                                    </div>
                                    <div className="hidden md:block">
                                        <img src="/LN.png" alt="Illustration" className="w-48 h-auto drop-shadow-2xl opacity-90" />
                                    </div>
                                </div>
                            </div>

                            {/* Recently Viewed */}
                            {recentlyViewed.length > 0 && (
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between px-2">
                                        <h3 className="text-xl font-bold text-slate-900">
                                            Terakhir Dilihat
                                        </h3>
                                    </div>
                                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                                        {recentlyViewed.slice(0, 5).map(product => (
                                            <div key={product._id} className="group relative">
                                                <Link to={`/produk/${product._id}`} className="block bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all overflow-hidden h-full">
                                                    <div className="aspect-[4/3] bg-slate-100 relative">
                                                        <img src={product.gambar || 'https://placehold.co/200'} alt={product.namaBarang} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                                        {product.status !== 'tersedia' && (
                                                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                                                <span className="px-2 py-1 bg-white/20 backdrop-blur-md text-white text-xs font-bold rounded-lg border border-white/20">Habis</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="p-3">
                                                        <h4 className="font-bold text-slate-900 text-sm truncate">{product.namaBarang}</h4>
                                                        <p className="text-blue-600 font-bold text-xs mt-1">{formatPrice(product.harga)}</p>
                                                    </div>
                                                </Link>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Recommendations */}
                            <div className="space-y-4">
                                <div className="flex items-center justify-between px-2">
                                    <h3 className="text-xl font-bold text-slate-900">
                                        Rekomendasi Untukmu
                                    </h3>
                                    <Link to="/jelajah" className="text-sm font-bold text-blue-600 hover:text-blue-700">Lihat Semua</Link>
                                </div>

                                {overviewLoading ? (
                                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                                        {[1, 2, 3, 4].map(i => (
                                            <div key={i} className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm animate-pulse space-y-3">
                                                <div className="aspect-square bg-slate-100 rounded-xl"></div>
                                                <div className="h-4 bg-slate-100 rounded-full w-3/4"></div>
                                                <div className="h-4 bg-slate-100 rounded-full w-1/2"></div>
                                            </div>
                                        ))}
                                    </div>
                                ) : recommendedProducts.length === 0 ? (
                                    <div className="bg-white rounded-[2rem] border border-slate-100 p-12 text-center">
                                        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <Compass className="w-8 h-8 text-slate-300" />
                                        </div>
                                        <p className="text-slate-500 font-medium">Belum ada rekomendasi yang cocok.</p>
                                        <Link to="/jelajah" className="text-blue-600 font-bold text-sm mt-2 block">Mulai eksplorasi produk</Link>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                                        {recommendedProducts.map(product => (
                                            <ProductCard key={product._id} product={product} />
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Seller Verification Tab */}
                    {activeTab === 'verification' && !isSeller && (
                        <SellerVerificationTab onSuccess={() => {
                            // Force sidebar/user state update if needed, normally layout handles re-render on user change
                            // Usually just toast success in the tab is enough, or navigate to reload dashboard context
                            // For now, let's refresh the current view or just let the user see the success state
                            // The component handles success UI internally.
                            // We might want to reload window to refresh role if instantly upgraded, but verification is usually pending.
                        }} />
                    )}

                    {/* Pasang Iklan Tab */}
                    {activeTab === 'pasang-iklan' && isSeller && (
                        <SellProductForm onSuccess={() => { fetchMyProducts(); setActiveTab('products'); toast.success('Produk berhasil ditambahkan!'); }} />
                    )}

                    {/* Edit Produk Tab */}
                    {activeTab === 'edit-product' && isSeller && (
                        <SellProductForm
                            productId={editingProductId}
                            onSuccess={() => {
                                fetchMyProducts();
                                setActiveTab('products');
                                setEditingProductId(null);
                                toast.success('Produk berhasil diperbarui!');
                            }}
                        />
                    )}

                    {/* Products Tab */}
                    {activeTab === 'products' && (
                        <div className="space-y-6 max-w-7xl mx-auto">
                            {/* Header & Filters */}
                            <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
                                <div className="flex p-1 bg-slate-50 rounded-xl w-full sm:w-auto overflow-x-auto">
                                    {[{ id: 'all', label: 'Semua', count: products.length }, { id: 'active', label: 'Aktif', count: stats.barangAktif }, { id: 'sold', label: 'Terjual', count: stats.barangTerjual }].map(tab => (
                                        <button
                                            key={tab.id}
                                            onClick={() => setProductSubTab(tab.id)}
                                            className={`flex-1 sm:flex-none px-6 py-2.5 rounded-lg text-sm font-bold transition-all relative whitespace-nowrap ${productSubTab === tab.id
                                                ? 'bg-white text-blue-600 shadow-sm ring-1 ring-slate-200'
                                                : 'text-slate-500 hover:text-slate-700'
                                                }`}
                                        >
                                            {tab.label}
                                            <span className={`ml-2 px-1.5 py-0.5 rounded-md text-[10px] ${productSubTab === tab.id ? 'bg-blue-50 text-blue-600' : 'bg-slate-200 text-slate-500'
                                                }`}>
                                                {tab.count}
                                            </span>
                                        </button>
                                    ))}
                                </div>
                                {filteredProducts.length > 0 && (
                                    <Link to="/jual" className="w-full sm:w-auto flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold text-sm shadow-lg shadow-blue-500/20 transition-all active:scale-95">
                                        <PlusCircle className="w-5 h-5" />
                                        Pasang Iklan Baru
                                    </Link>
                                )}
                            </div>

                            {/* Content */}
                            {loading ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                    {[1, 2, 3, 4].map(i => (
                                        <div key={i} className="bg-white rounded-3xl p-4 border border-slate-100 shadow-sm animate-pulse space-y-4">
                                            <div className="aspect-[4/3] bg-slate-100 rounded-2xl w-full"></div>
                                            <div className="h-4 bg-slate-100 rounded-full w-3/4"></div>
                                            <div className="h-4 bg-slate-100 rounded-full w-1/2"></div>
                                        </div>
                                    ))}
                                </div>
                            ) : filteredProducts.length === 0 ? (
                                <div className="bg-white rounded-[2rem] border border-slate-100 p-12 text-center shadow-sm">
                                    <div className="size-20 mx-auto mb-6 bg-slate-50 rounded-2xl flex items-center justify-center rotate-3 hover:rotate-6 transition-transform">
                                        <Package className="w-10 h-10 text-slate-300" />
                                    </div>
                                    <h3 className="text-xl font-bold text-slate-900 mb-2">Belum ada produk</h3>
                                    <p className="text-slate-500 max-w-sm mx-auto mb-8">Produk yang kamu posting akan muncul disini. Mulai jualan sekarang!</p>
                                    <Link to="/jual" className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-blue-500/20 active:scale-95 transition-all">
                                        <PlusCircle className="w-5 h-5" />
                                        Pasang Iklan Sekarang
                                    </Link>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-12">
                                    {filteredProducts.map(p => (
                                        <div key={p._id} className="bg-white rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group overflow-hidden flex flex-col">
                                            <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
                                                <img src={p.gambar || 'https://placehold.co/200'} alt={p.namaBarang} className={`w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 ${p.status === 'terjual' ? 'grayscale opacity-60' : ''}`} />
                                                <div className="absolute top-3 right-3 flex flex-col gap-2">
                                                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider shadow-lg backdrop-blur-md ${p.status === 'tersedia' ? 'bg-green-500/90 text-white' : 'bg-slate-800/90 text-white'
                                                        }`}>
                                                        {p.status === 'tersedia' ? 'Aktif' : 'Terjual'}
                                                    </span>
                                                </div>
                                                {p.approvalStatus && p.approvalStatus !== 'approved' && (
                                                    <div className="absolute top-3 left-3">
                                                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider shadow-lg backdrop-blur-md ${p.approvalStatus === 'pending' ? 'bg-amber-500/90 text-white' : 'bg-red-500/90 text-white'
                                                            }`}>
                                                            {p.approvalStatus === 'pending' ? 'Review' : 'Ditolak'}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="p-5 flex-1 flex flex-col">
                                                <div className="mb-4">
                                                    <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                                                        <span className="material-symbols-outlined text-sm">category</span>
                                                        {p.kategori}
                                                    </div>
                                                    <Link to={`/produk/${p._id}`} className="block">
                                                        <h3 className="font-bold text-slate-900 truncate text-lg group-hover:text-blue-600 transition-colors" title={p.namaBarang}>{p.namaBarang}</h3>
                                                    </Link>
                                                    <p className={`text-xl font-black mt-1 ${p.status === 'terjual' ? 'text-slate-400' : 'text-blue-600'}`}>{formatPrice(p.harga)}</p>
                                                </div>

                                                <div className="mt-auto pt-4 border-t border-slate-50 grid grid-cols-2 gap-2">
                                                    <Link to={`/produk/${p._id}`} className="col-span-2 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-slate-50 text-slate-600 text-xs font-bold hover:bg-slate-100 transition-colors">
                                                        <FolderOpen className="w-4 h-4" /> Detail
                                                    </Link>
                                                    <button
                                                        onClick={() => {
                                                            setEditingProductId(p._id);
                                                            setActiveTab('edit-product');
                                                            window.scrollTo({ top: 0, behavior: 'smooth' });
                                                        }}
                                                        className="col-span-2 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-blue-50 text-blue-600 text-xs font-bold hover:bg-blue-100 transition-colors"
                                                    >
                                                        <Edit className="w-4 h-4" /> Edit
                                                    </button>
                                                    {p.status === 'tersedia' ? (
                                                        <button
                                                            onClick={() => handleMarkAsSold(p._id, p.namaBarang)}
                                                            disabled={markingSold === p._id}
                                                            className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-green-50 text-green-600 text-xs font-bold hover:bg-green-100 transition-colors disabled:opacity-50"
                                                        >
                                                            {markingSold === p._id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                                                            Terjual
                                                        </button>
                                                    ) : (
                                                        <button
                                                            onClick={() => handleMarkAsAvailable(p._id, p.namaBarang)}
                                                            disabled={markingSold === p._id}
                                                            className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-blue-50 text-blue-600 text-xs font-bold hover:bg-blue-100 transition-colors disabled:opacity-50"
                                                        >
                                                            {markingSold === p._id ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                                                            Aktifkan
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={() => handleDelete(p._id, p.namaBarang)}
                                                        disabled={deleteLoading === p._id}
                                                        className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-red-50 text-red-600 text-xs font-bold hover:bg-red-100 transition-colors disabled:opacity-50"
                                                    >
                                                        {deleteLoading === p._id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                                                        Hapus
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Wishlist Tab */}
                    {activeTab === 'wishlist' && (
                        <div className="space-y-8 max-w-7xl mx-auto">
                            <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
                                <div>
                                    <h2 className="text-xl font-bold text-slate-900">Wishlist Saya</h2>
                                    <p className="text-slate-500 text-sm mt-1">{wishlist.length} barang disimpan untuk nanti</p>
                                </div>
                                <Link to="/jelajah" className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-bold bg-blue-50 px-5 py-2.5 rounded-xl hover:bg-blue-100 transition-colors">
                                    <Compass className="w-5 h-5" />
                                    Jelajahi Lagi
                                </Link>
                            </div>

                            {wishlistLoading ? (
                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                                    {[1, 2, 3, 4].map((i) => (
                                        <div key={i} className="bg-white rounded-2xl animate-pulse border border-slate-100 p-4 space-y-4">
                                            <div className="aspect-square bg-slate-100 rounded-xl"></div>
                                            <div className="h-4 bg-slate-100 rounded-full w-3/4"></div>
                                            <div className="h-4 bg-slate-100 rounded-full w-1/2"></div>
                                        </div>
                                    ))}
                                </div>
                            ) : wishlist.length === 0 ? (
                                <div className="bg-white rounded-[2rem] border border-slate-100 p-16 text-center">
                                    <div className="size-24 mx-auto mb-6 bg-pink-50 rounded-full flex items-center justify-center">
                                        <Heart className="w-10 h-10 text-pink-500" />
                                    </div>
                                    <h3 className="text-xl font-bold text-slate-900 mb-2">Belum ada barang impian?</h3>
                                    <p className="text-slate-500 max-w-sm mx-auto mb-8">Simpan barang yang kamu taksir disini biar ngga lupa!</p>
                                    <Link to="/jelajah" className="inline-flex items-center gap-2 bg-pink-500 hover:bg-pink-600 text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-pink-500/20 active:scale-95 transition-all">
                                        <Compass className="w-5 h-5" />
                                        Mulai Jelajah
                                    </Link>
                                </div>
                            ) : (
                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                                    {wishlist.map((product) => (
                                        <div key={product._id} className="relative group">
                                            <ProductCard product={product} />
                                            <button
                                                onClick={() => handleRemoveFromWishlist(product._id)}
                                                className="absolute top-2 right-2 z-10 bg-white/90 hover:bg-red-500 text-red-500 hover:text-white p-2 rounded-xl shadow-lg opacity-0 group-hover:opacity-100 transition-all transform scale-90 group-hover:scale-100"
                                                title="Hapus dari wishlist"
                                            >
                                                <Trash2 className="w-5 h-5" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Reports Tab */}
                    {activeTab === 'reports' && (
                        <ReportsTab />
                    )}

                    {/* Profile Tab */}
                    {activeTab === 'profile' && (
                        <div className="max-w-4xl mx-auto space-y-8">
                            {/* Profile Card */}
                            <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-xl shadow-slate-200/50 relative overflow-hidden">
                                <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-r from-blue-600 to-indigo-600"></div>
                                <div className="relative pt-12">
                                    <div className="flex flex-col md:flex-row items-end md:items-center gap-6">
                                        <div className="relative">
                                            {user?.avatar ? (
                                                <img src={user.avatar} className="size-32 rounded-[2rem] object-cover border-4 border-white shadow-md relative z-10 bg-white" referrerPolicy="no-referrer" />
                                            ) : (
                                                <div className="size-32 rounded-[2rem] bg-indigo-50 border-4 border-white shadow-md relative z-10 flex items-center justify-center text-4xl font-bold text-indigo-500">
                                                    {user?.nama?.charAt(0).toUpperCase()}
                                                </div>
                                            )}
                                            {user?.verification?.status === 'verified' && (
                                                <div className="absolute -bottom-2 -right-2 z-20 bg-green-500 text-white p-1.5 rounded-full border-4 border-white shadow-sm" title="Terverifikasi">
                                                    <BadgeCheck className="w-[18px] h-[18px]" />
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1 mb-2">
                                            <h2 className="text-2xl font-bold text-white">{user?.nama}</h2>
                                            <p className="text-slate-500 font-medium">{user?.email}</p>
                                            <div className="flex flex-wrap gap-2 mt-3">
                                                <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${isSeller ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-600'}`}>
                                                    {isSeller ? 'Penjual' : 'Pembeli'}
                                                </div>
                                                <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${user?.verification?.status === 'verified' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                                                    }`}>
                                                    {user?.verification?.status === 'verified' ? 'Verified Account' : 'Unverified'}
                                                </div>
                                            </div>
                                        </div>
                                        <button onClick={() => setActiveTab('settings')} className="bg-slate-900 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-slate-900/20 hover:bg-slate-800 transition-all active:scale-95 flex items-center gap-2">
                                            <Edit className="w-5 h-5" />
                                            Edit Profil
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Stats Cards */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div className="bg-blue-500 rounded-3xl p-6 text-white shadow-lg shadow-blue-500/25 relative overflow-hidden group">
                                    <div className="absolute right-0 top-0 opacity-10 transform translate-x-1/4 -translate-y-1/4">
                                        <Package className="w-32 h-32" />
                                    </div>
                                    <p className="text-sm font-medium text-blue-100 mb-1">Total Iklan</p>
                                    <p className="text-4xl font-black">{stats.barangAktif + stats.barangTerjual}</p>
                                </div>
                                <div className="bg-indigo-500 rounded-3xl p-6 text-white shadow-lg shadow-indigo-500/25 relative overflow-hidden group">
                                    <div className="absolute right-0 top-0 opacity-10 transform translate-x-1/4 -translate-y-1/4">
                                        <CheckCircle className="w-32 h-32" />
                                    </div>
                                    <p className="text-sm font-medium text-indigo-100 mb-1">Terjual</p>
                                    <p className="text-4xl font-black">{stats.barangTerjual}</p>
                                </div>
                                <div className="bg-slate-800 rounded-3xl p-6 text-white shadow-lg shadow-slate-800/25 relative overflow-hidden group">
                                    <div className="absolute right-0 top-0 opacity-10 transform translate-x-1/4 -translate-y-1/4">
                                        <Wallet className="w-32 h-32" />
                                    </div>
                                    <p className="text-sm font-medium text-slate-400 mb-1">Pendapatan</p>
                                    <p className="text-2xl font-black truncate" title={formatPrice(stats.totalPendapatan)}>{formatPrice(stats.totalPendapatan)}</p>
                                </div>
                            </div>

                            {/* Details Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
                                    <div className="flex items-center gap-4 mb-6">
                                        <div className="size-12 rounded-2xl bg-orange-100 flex items-center justify-center">
                                            <School className="w-6 h-6 text-orange-600" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-slate-900">Data Akademik</h3>
                                            <p className="text-xs text-slate-500">Informasi sebagai mahasiswa</p>
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <div>
                                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">NIM</p>
                                            <p className="font-medium text-slate-900 bg-slate-50 p-3 rounded-xl border border-slate-100">
                                                {user?.nim || 'Belum diatur'}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Fakultas</p>
                                            <p className="font-medium text-slate-900 bg-slate-50 p-3 rounded-xl border border-slate-100">
                                                {user?.fakultas || 'Belum diatur'}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
                                    <div className="flex items-center gap-4 mb-6">
                                        <div className="size-12 rounded-2xl bg-purple-100 flex items-center justify-center">
                                            <User className="w-6 h-6 text-purple-600" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-slate-900">Kontak & Akun</h3>
                                            <p className="text-xs text-slate-500">Informasi kontak yang terhubung</p>
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <div>
                                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">WhatsApp</p>
                                            <p className="font-medium text-slate-900 bg-slate-50 p-3 rounded-xl border border-slate-100 flex items-center gap-2">
                                                <MessageCircle className="w-4 h-4 text-green-500" />
                                                {user?.whatsapp ? (user.whatsapp.startsWith('62') ? '+' + user.whatsapp : user.whatsapp) : 'Belum diatur'}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Bergabung Sejak</p>
                                            <p className="font-medium text-slate-900 bg-slate-50 p-3 rounded-xl border border-slate-100 flex items-center gap-2">
                                                <span className="material-symbols-outlined text-slate-400 text-sm">calendar_month</span>
                                                {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '-'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Settings Tab */}
                    {activeTab === 'settings' && (
                        <div className="max-w-2xl mx-auto space-y-8">
                            {/* Edit Profile */}
                            <div className="bg-white rounded-[2rem] border border-slate-100 p-8 shadow-sm">
                                <div className="flex items-center gap-4 mb-8">
                                    <div className="size-12 rounded-2xl bg-blue-100 flex items-center justify-center">
                                        <span className="material-symbols-outlined text-blue-600 text-2xl">manage_accounts</span>
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold text-slate-900">Edit Profil</h2>
                                        <p className="text-slate-500 text-sm">Perbarui informasi pribadimu</p>
                                    </div>
                                </div>

                                <form onSubmit={handleProfileSubmit} className="space-y-5">
                                    {profileError && (
                                        <div className="rounded-xl bg-red-50 p-4 flex items-center gap-3 text-sm text-red-600 font-medium">
                                            <span className="material-symbols-outlined text-xl">error</span>
                                            {profileError}
                                        </div>
                                    )}
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1">NIM (Nomor Induk Mahasiswa)</label>
                                        <input
                                            type="text"
                                            value={formData.nim}
                                            onChange={(e) => setFormData({ ...formData, nim: e.target.value })}
                                            className="w-full rounded-xl border border-slate-200 py-3.5 px-5 text-sm font-medium focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 focus:outline-none transition-all placeholder:text-slate-300"
                                            placeholder="Contoh: 21050524001"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1">Fakultas</label>
                                        <div className="relative">
                                            <select
                                                value={formData.fakultas}
                                                onChange={(e) => setFormData({ ...formData, fakultas: e.target.value })}
                                                className="w-full rounded-xl border border-slate-200 py-3.5 px-5 text-sm font-medium focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 focus:outline-none bg-white appearance-none"
                                            >
                                                <option value="">Pilih Fakultas</option>
                                                {fakultasOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                                            </select>
                                            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                                <span className="material-symbols-outlined">expand_more</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1">Nomor WhatsApp</label>
                                        <input
                                            type="tel"
                                            value={formData.whatsapp}
                                            onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                                            className="w-full rounded-xl border border-slate-200 py-3.5 px-5 text-sm font-medium focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 focus:outline-none transition-all placeholder:text-slate-300"
                                            placeholder="08123456789"
                                        />
                                        <p className="text-[10px] text-slate-400 mt-1.5 ml-1">*Pastikan nomor aktif untuk mempermudah transaksi</p>
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={profileLoading}
                                        className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-4 px-6 rounded-xl font-bold transition-all shadow-lg shadow-blue-500/20 active:scale-95 disabled:opacity-70 disabled:active:scale-100 mt-4"
                                    >
                                        {profileLoading ? <span className="material-symbols-outlined animate-spin text-xl">progress_activity</span> : <span className="material-symbols-outlined text-xl">save</span>}
                                        {profileLoading ? 'Menyimpan...' : 'Simpan Perubahan'}
                                    </button>
                                </form>
                            </div>

                            {/* Danger Zone */}
                            <div className="bg-red-50 rounded-[2rem] p-8 border border-red-100">
                                <div className="flex items-start gap-4">
                                    <div className="size-12 rounded-2xl bg-white flex items-center justify-center shrink-0">
                                        <span className="material-symbols-outlined text-red-500 text-2xl">warning</span>
                                    </div>
                                    <div className="flex-1">
                                        <h2 className="text-xl font-bold text-red-900">Area Berbahaya</h2>
                                        <p className="text-red-600/80 text-sm mt-1 mb-6">Tindakan ini akan mengeluarkanmu dari sesi ini.</p>
                                        <button
                                            onClick={handleLogout}
                                            className="inline-flex items-center gap-2 bg-white hover:bg-red-600 hover:text-white text-red-600 py-3 px-6 rounded-xl font-bold transition-colors border border-red-200 hover:border-red-600 shadow-sm"
                                        >
                                            <span className="material-symbols-outlined text-xl">logout</span>
                                            Keluar dari Akun
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </main>

            {/* Action Modal for Sold / Available / Delete Confirmation */}
            <ActionModal
                isOpen={actionModal.isOpen}
                onClose={closeActionModal}
                onConfirm={confirmActionModal}
                title={
                    actionModal.type === 'sold' ? 'Tandai Sebagai Terjual?' :
                        actionModal.type === 'delete' ? 'Hapus Produk Ini?' :
                            'Aktifkan Kembali Produk?'
                }
                description={
                    actionModal.type === 'sold'
                        ? `Produk "${actionModal.productName}" akan ditandai sebagai terjual dan tidak akan muncul di halaman Jelajah.`
                        : actionModal.type === 'delete'
                            ? `Produk "${actionModal.productName}" akan dihapus secara permanen. Tindakan ini tidak bisa dibatalkan.`
                            : `Produk "${actionModal.productName}" akan diaktifkan kembali dan muncul di halaman Jelajah.`
                }
                confirmText={
                    actionModal.type === 'sold' ? 'Ya, Terjual' :
                        actionModal.type === 'delete' ? 'Hapus Permanen' :
                            'Ya, Aktifkan'
                }
                confirmColor={
                    actionModal.type === 'sold' ? 'success' :
                        actionModal.type === 'delete' ? 'danger' :
                            'primary'
                }
                loading={!!markingSold || !!deleteLoading}
                icon={
                    actionModal.type === 'sold' ? (
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                            <Check className="w-8 h-8 text-green-600" />
                        </div>
                    ) : actionModal.type === 'delete' ? (
                        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                            <Trash2 className="w-8 h-8 text-red-600" />
                        </div>
                    ) : (
                        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                            <RefreshCw className="w-8 h-8 text-blue-600" />
                        </div>
                    )
                }
            />
        </div>
    );
}

export default DashboardPage;
