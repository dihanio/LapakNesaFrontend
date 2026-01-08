import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    Package, Search, RefreshCw, ChevronLeft, ChevronRight, Trash2, Eye,
    Check, X, Clock, CheckCircle, XCircle, Filter, TrendingUp, Tag,
    ShoppingBag, AlertCircle
} from 'lucide-react';
import api from '../services/api';
import { formatCurrency } from '../utils/formatUtils';

const AdminProductsPage = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(null);
    const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
    const [filters, setFilters] = useState({ status: '', kategori: '', search: '', approvalStatus: '' });
    const [searchInput, setSearchInput] = useState('');
    const [activeTab, setActiveTab] = useState('all');
    const [pendingCount, setPendingCount] = useState(0);
    const [stats, setStats] = useState({ total: 0, approved: 0, pending: 0, rejected: 0 });
    const [rejectModal, setRejectModal] = useState({ show: false, productId: null, productName: '' });
    const [rejectReason, setRejectReason] = useState('');
    const [approveModal, setApproveModal] = useState({ show: false, productId: null, productName: '' });

    const kategoriOptions = [
        'Buku', 'Elektronik', 'Perabotan', 'Fashion', 'Alat Kuliah',
        'Olahraga', 'Otomotif', 'Makanan', 'Hobi', 'Jasa', 'Lainnya'
    ];

    useEffect(() => {
        fetchProducts();
        fetchPendingCount();
    }, [pagination.page, filters.status, filters.kategori, filters.approvalStatus, activeTab]);

    const fetchPendingCount = async () => {
        try {
            const response = await api.get('/admin/products/pending?limit=1');
            if (response.data.success) {
                setPendingCount(response.data.pagination.total);
            }
        } catch (error) {
            console.error('Failed to fetch pending count:', error);
        }
    };

    const fetchProducts = async () => {
        try {
            setLoading(true);
            let endpoint = '/admin/products';
            const params = new URLSearchParams({ page: pagination.page, limit: 16 });

            if (activeTab === 'pending') {
                endpoint = '/admin/products/pending';
            } else {
                if (filters.status) params.append('status', filters.status);
                if (filters.kategori) params.append('kategori', filters.kategori);
                if (filters.approvalStatus) params.append('approvalStatus', filters.approvalStatus);
                if (filters.search) params.append('search', filters.search);
            }

            const response = await api.get(`${endpoint}?${params}`);
            if (response.data.success) {
                const data = response.data.data;
                setProducts(data);
                setStats({
                    total: data.length,
                    approved: data.filter(p => p.approvalStatus === 'approved').length,
                    pending: data.filter(p => p.approvalStatus === 'pending').length,
                    rejected: data.filter(p => p.approvalStatus === 'rejected').length
                });
                setPagination(prev => ({
                    ...prev,
                    total: response.data.pagination.total,
                    totalPages: response.data.pagination.totalPages
                }));
            }
        } catch (error) {
            console.error('Failed to fetch products:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        setFilters(prev => ({ ...prev, search: searchInput }));
        setPagination(prev => ({ ...prev, page: 1 }));
        fetchProducts();
    };

    const handleApprove = async () => {
        setProcessing(approveModal.productId);
        try {
            await api.put(`/admin/products/${approveModal.productId}/approve`);
            setProducts(products.filter(p => p._id !== approveModal.productId));
            setPendingCount(prev => Math.max(0, prev - 1));
            setApproveModal({ show: false, productId: null, productName: '' });
        } catch (error) {
            alert('Gagal menyetujui produk');
        } finally {
            setProcessing(null);
        }
    };

    const handleReject = async () => {
        if (!rejectReason.trim()) {
            alert('Mohon isi alasan penolakan');
            return;
        }
        setProcessing(rejectModal.productId);
        try {
            await api.put(`/admin/products/${rejectModal.productId}/reject`, { reason: rejectReason });
            setProducts(products.filter(p => p._id !== rejectModal.productId));
            setPendingCount(prev => Math.max(0, prev - 1));
            setRejectModal({ show: false, productId: null, productName: '' });
        } catch (error) {
            alert('Gagal menolak produk');
        } finally {
            setProcessing(null);
        }
    };

    const handleDelete = async (productId, productName) => {
        if (!confirm(`Yakin ingin menghapus produk "${productName}"?`)) return;
        setProcessing(productId);
        try {
            await api.delete(`/admin/products/${productId}`);
            setProducts(products.filter(p => p._id !== productId));
        } catch (error) {
            alert('Gagal menghapus produk');
        } finally {
            setProcessing(null);
        }
    };

    const getApprovalBadge = (status) => {
        const config = {
            pending: { style: 'bg-yellow-500/20 text-yellow-400', label: 'Menunggu', icon: Clock },
            approved: { style: 'bg-green-500/20 text-green-400', label: 'Disetujui', icon: CheckCircle },
            rejected: { style: 'bg-red-500/20 text-red-400', label: 'Ditolak', icon: XCircle },
        };
        return config[status] || { style: 'bg-gray-500/20 text-gray-400', label: status, icon: AlertCircle };
    };

    if (loading && products.length === 0) {
        return (
            <div className="flex items-center justify-center h-full min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="p-6 md:p-8 space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white">
                        Moderasi Produk
                    </h1>
                    <p className="text-sm text-[#606e8a] mt-1">
                        {activeTab === 'pending' ? `${pendingCount} produk menunggu review` : `Total ${pagination.total} produk`}
                    </p>
                </div>
                <button
                    onClick={fetchProducts}
                    className="flex items-center gap-2 px-4 py-2 bg-[#2d3748] hover:bg-[#374151] text-white rounded-lg text-sm font-medium transition-colors"
                >
                    <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                    Refresh
                </button>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-[#1a2332] p-5 rounded-xl border border-[#2d3748] relative overflow-hidden group hover:shadow-lg transition-shadow">
                    <p className="text-sm font-medium text-[#606e8a]">Total Produk</p>
                    <h3 className="text-2xl font-bold text-white mt-1">{pagination.total}</h3>
                </div>
                <div className="bg-[#1a2332] p-5 rounded-xl border border-[#2d3748] relative overflow-hidden group hover:shadow-lg transition-shadow">
                    <p className="text-sm font-medium text-[#606e8a]">Disetujui</p>
                    <h3 className="text-2xl font-bold text-white mt-1">{stats.approved}</h3>
                </div>
                <div className="bg-[#1a2332] p-5 rounded-xl border border-[#2d3748] relative overflow-hidden group hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setActiveTab('pending')}>
                    <p className="text-sm font-medium text-[#606e8a]">Menunggu Review</p>
                    <h3 className="text-2xl font-bold text-white mt-1">{pendingCount}</h3>
                    {pendingCount > 0 && (
                        <span className="text-xs bg-yellow-500/20 text-yellow-400 px-2 py-0.5 rounded-full mt-1 inline-block">Perlu Aksi</span>
                    )}
                </div>
                <div className="bg-[#1a2332] p-5 rounded-xl border border-[#2d3748] relative overflow-hidden group hover:shadow-lg transition-shadow">
                    <p className="text-sm font-medium text-[#606e8a]">Ditolak</p>
                    <h3 className="text-2xl font-bold text-white mt-1">{stats.rejected}</h3>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 bg-[#1a2332] p-1 rounded-xl border border-[#2d3748] w-fit">
                <button
                    onClick={() => { setActiveTab('all'); setPagination(prev => ({ ...prev, page: 1 })); }}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'all' ? 'bg-primary text-white' : 'text-[#606e8a] hover:text-white'}`}
                >
                    Semua Produk
                </button>
                <button
                    onClick={() => { setActiveTab('pending'); setPagination(prev => ({ ...prev, page: 1 })); }}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${activeTab === 'pending' ? 'bg-primary text-white' : 'text-[#606e8a] hover:text-white'}`}
                >
                    Menunggu Review
                    {pendingCount > 0 && (
                        <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">{pendingCount}</span>
                    )}
                </button>
            </div>

            {/* Filters */}
            {activeTab === 'all' && (
                <div className="bg-[#1a2332] rounded-xl border border-[#2d3748] p-4">
                    <div className="flex flex-col sm:flex-row gap-3">
                        <form onSubmit={handleSearch} className="flex-1 flex gap-2">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#606e8a]" />
                                <input
                                    type="text"
                                    placeholder="Cari nama produk..."
                                    value={searchInput}
                                    onChange={(e) => setSearchInput(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2.5 bg-[#0f1520] border border-[#2d3748] rounded-lg text-sm text-white placeholder-[#606e8a] focus:ring-2 focus:ring-primary"
                                />
                            </div>
                            <button type="submit" className="px-4 py-2.5 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors">
                                Cari
                            </button>
                        </form>
                        <select
                            value={filters.kategori}
                            onChange={(e) => { setFilters(prev => ({ ...prev, kategori: e.target.value })); setPagination(prev => ({ ...prev, page: 1 })); }}
                            className="px-4 py-2.5 bg-[#0f1520] border border-[#2d3748] rounded-lg text-sm text-white focus:ring-2 focus:ring-primary"
                        >
                            <option value="">Semua Kategori</option>
                            {kategoriOptions.map(kat => <option key={kat} value={kat}>{kat}</option>)}
                        </select>
                        <select
                            value={filters.approvalStatus}
                            onChange={(e) => { setFilters(prev => ({ ...prev, approvalStatus: e.target.value })); setPagination(prev => ({ ...prev, page: 1 })); }}
                            className="px-4 py-2.5 bg-[#0f1520] border border-[#2d3748] rounded-lg text-sm text-white focus:ring-2 focus:ring-primary"
                        >
                            <option value="">Semua Status</option>
                            <option value="pending">Menunggu</option>
                            <option value="approved">Disetujui</option>
                            <option value="rejected">Ditolak</option>
                        </select>
                    </div>
                </div>
            )}

            {/* Products Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {products.map((product) => {
                    const badge = getApprovalBadge(product.approvalStatus);
                    const BadgeIcon = badge.icon;
                    return (
                        <div key={product._id} className="bg-[#1a2332] rounded-xl border border-[#2d3748] overflow-hidden group hover:shadow-lg transition-shadow">
                            <div className="aspect-square bg-[#0f1520] relative overflow-hidden">
                                {product.gambar ? (
                                    <img src={product.gambar} alt={product.namaBarang} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                        <Package className="w-12 h-12 text-[#606e8a]" />
                                    </div>
                                )}
                                <div className="absolute top-2 left-2">
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${badge.style}`}>
                                        <BadgeIcon className="w-3 h-3" />
                                        {badge.label}
                                    </span>
                                </div>
                            </div>
                            <div className="p-4">
                                <h3 className="font-semibold text-white line-clamp-1 mb-1">{product.namaBarang}</h3>
                                <p className="text-primary font-bold text-lg mb-2">{formatCurrency(product.harga)}</p>
                                <p className="text-xs text-[#606e8a] mb-3 flex items-center gap-1">
                                    <Tag className="w-3 h-3" />
                                    {product.kategori}
                                </p>
                                <div className="flex items-center gap-2 py-2 border-t border-[#2d3748]">
                                    {product.penjual?.avatar ? (
                                        <img src={product.penjual.avatar} alt="" className="w-6 h-6 rounded-full object-cover" referrerPolicy="no-referrer" />
                                    ) : (
                                        <div className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold">
                                            {product.penjual?.nama?.charAt(0) || '?'}
                                        </div>
                                    )}
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs font-medium text-white truncate">{product.penjual?.nama || 'Unknown'}</p>
                                    </div>
                                </div>
                                <div className="flex gap-2 mt-3">
                                    {product.approvalStatus === 'pending' ? (
                                        <>
                                            <button
                                                onClick={() => setApproveModal({ show: true, productId: product._id, productName: product.namaBarang })}
                                                disabled={processing === product._id}
                                                className="flex-1 flex items-center justify-center gap-1 px-3 py-2 rounded-lg bg-green-500/20 text-green-400 hover:bg-green-500/30 text-sm font-medium transition-colors disabled:opacity-50"
                                            >
                                                <Check className="w-4 h-4" />
                                                Setujui
                                            </button>
                                            <button
                                                onClick={() => { setRejectModal({ show: true, productId: product._id, productName: product.namaBarang }); setRejectReason(''); }}
                                                disabled={processing === product._id}
                                                className="flex-1 flex items-center justify-center gap-1 px-3 py-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 text-sm font-medium transition-colors disabled:opacity-50"
                                            >
                                                <X className="w-4 h-4" />
                                                Tolak
                                            </button>
                                        </>
                                    ) : (
                                        <>
                                            <Link
                                                to={`/produk/${product._id}`}
                                                target="_blank"
                                                className="flex-1 flex items-center justify-center gap-1 px-3 py-2 rounded-lg bg-[#2d3748] text-white hover:bg-[#374151] text-sm font-medium transition-colors"
                                            >
                                                <Eye className="w-4 h-4" />
                                                Lihat
                                            </Link>
                                            <button
                                                onClick={() => handleDelete(product._id, product.namaBarang)}
                                                disabled={processing === product._id}
                                                className="p-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors disabled:opacity-50"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
                <div className="flex items-center justify-center gap-4 pt-4">
                    <button
                        onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                        disabled={pagination.page === 1}
                        className="px-4 py-2 rounded-lg border border-[#2d3748] text-sm text-white disabled:opacity-50 hover:bg-[#2d3748] transition-colors flex items-center gap-1"
                    >
                        <ChevronLeft className="w-4 h-4" />
                        Prev
                    </button>
                    <span className="text-sm text-[#606e8a]">
                        Halaman {pagination.page} dari {pagination.totalPages}
                    </span>
                    <button
                        onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                        disabled={pagination.page === pagination.totalPages}
                        className="px-4 py-2 rounded-lg border border-[#2d3748] text-sm text-white disabled:opacity-50 hover:bg-[#2d3748] transition-colors flex items-center gap-1"
                    >
                        Next
                        <ChevronRight className="w-4 h-4" />
                    </button>
                </div>
            )}

            {products.length === 0 && !loading && (
                <div className="text-center py-12 bg-[#1a2332] border border-[#2d3748] rounded-xl">
                    <Package className="w-16 h-16 text-[#606e8a] mx-auto mb-4 opacity-50" />
                    <h3 className="text-lg font-semibold text-white">
                        {activeTab === 'pending' ? 'Tidak ada produk menunggu review' : 'Tidak ada produk ditemukan'}
                    </h3>
                    <p className="text-[#606e8a]">
                        {activeTab === 'pending' ? 'Semua produk sudah direview.' : 'Coba ubah filter atau kata kunci pencarian.'}
                    </p>
                </div>
            )}

            {/* Reject Modal */}
            {rejectModal.show && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
                    <div className="bg-[#1a2332] rounded-xl p-6 w-full max-w-md border border-[#2d3748]">
                        <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-red-500/20 rounded-full">
                            <XCircle className="w-8 h-8 text-red-400" />
                        </div>
                        <h3 className="text-lg font-bold text-white text-center mb-2">Tolak Produk</h3>
                        <p className="text-sm text-[#606e8a] text-center mb-4">
                            Tolak produk "<span className="text-white font-medium">{rejectModal.productName}</span>"?
                        </p>
                        <textarea
                            value={rejectReason}
                            onChange={(e) => setRejectReason(e.target.value)}
                            placeholder="Alasan penolakan..."
                            className="w-full h-24 px-3 py-2 border border-[#2d3748] rounded-lg bg-[#0f1520] text-white resize-none focus:ring-2 focus:ring-primary"
                        />
                        <div className="flex gap-3 mt-4">
                            <button onClick={() => setRejectModal({ show: false, productId: null, productName: '' })} className="flex-1 px-4 py-2 rounded-lg border border-[#2d3748] text-[#606e8a] hover:bg-[#2d3748] transition-colors">
                                Batal
                            </button>
                            <button onClick={handleReject} disabled={processing === rejectModal.productId} className="flex-1 px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors disabled:opacity-50">
                                {processing === rejectModal.productId ? 'Memproses...' : 'Tolak'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Approve Modal */}
            {approveModal.show && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
                    <div className="bg-[#1a2332] rounded-xl p-6 w-full max-w-md border border-[#2d3748]">
                        <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-green-500/20 rounded-full">
                            <CheckCircle className="w-8 h-8 text-green-400" />
                        </div>
                        <h3 className="text-lg font-bold text-white text-center mb-2">Setujui Produk?</h3>
                        <p className="text-sm text-[#606e8a] text-center mb-6">
                            Produk "<span className="text-white font-medium">{approveModal.productName}</span>" akan ditampilkan di marketplace.
                        </p>
                        <div className="flex gap-3">
                            <button onClick={() => setApproveModal({ show: false, productId: null, productName: '' })} className="flex-1 px-4 py-2 rounded-lg border border-[#2d3748] text-[#606e8a] hover:bg-[#2d3748] transition-colors">
                                Batal
                            </button>
                            <button onClick={handleApprove} disabled={processing === approveModal.productId} className="flex-1 px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 transition-colors disabled:opacity-50">
                                {processing === approveModal.productId ? 'Memproses...' : 'Ya, Setujui'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminProductsPage;
