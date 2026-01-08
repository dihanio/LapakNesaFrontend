import { useState, useEffect, useCallback } from 'react';
import {
    History, Search, RefreshCw, ChevronLeft, ChevronRight, Filter, RotateCcw,
    Package, Users, Shield, Flag, Image, CheckCircle
} from 'lucide-react';
import activityLogService, {
    formatActivityAction,
    formatActivityCategory,
    getCategoryColor,
    getActionIcon
} from '../services/activityLogService';

const AdminActivityLogsPage = () => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({ category: '', action: '', search: '' });
    const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 0 });

    const categories = [
        { value: '', label: 'Semua Kategori' },
        { value: 'product', label: 'Produk' },
        { value: 'user', label: 'Pengguna' },
        { value: 'admin', label: 'Admin' },
        { value: 'report', label: 'Laporan' },
        { value: 'banner', label: 'Banner' },
        { value: 'verification', label: 'Verifikasi' },
    ];

    const actions = [
        { value: '', label: 'Semua Aksi' },
        { value: 'product_created', label: 'Produk Ditambahkan' },
        { value: 'product_updated', label: 'Produk Diupdate' },
        { value: 'product_deleted', label: 'Produk Dihapus' },
        { value: 'product_approved', label: 'Produk Disetujui' },
        { value: 'product_rejected', label: 'Produk Ditolak' },
        { value: 'user_registered', label: 'User Mendaftar' },
        { value: 'user_banned', label: 'User Dibanned' },
        { value: 'user_unbanned', label: 'User Diunbanned' },
        { value: 'user_role_changed', label: 'Role Diubah' },
        { value: 'user_deleted', label: 'User Dihapus' },
        { value: 'admin_login', label: 'Admin Login' },
        { value: 'verification_approved', label: 'Verifikasi Disetujui' },
        { value: 'verification_rejected', label: 'Verifikasi Ditolak' },
        { value: 'banner_created', label: 'Banner Ditambahkan' },
        { value: 'banner_updated', label: 'Banner Diupdate' },
        { value: 'banner_deleted', label: 'Banner Dihapus' },
    ];

    const fetchLogs = useCallback(async () => {
        setLoading(true);
        try {
            const response = await activityLogService.getActivityLogs({
                page: pagination.page,
                limit: pagination.limit,
                category: filters.category,
                action: filters.action,
                search: filters.search,
            });
            if (response.success) {
                setLogs(response.data);
                setPagination(prev => ({
                    ...prev,
                    total: response.pagination.total,
                    totalPages: response.pagination.totalPages,
                }));
            }
        } catch (error) {
            console.error('Failed to fetch activity logs:', error);
        } finally {
            setLoading(false);
        }
    }, [pagination.page, pagination.limit, filters]);

    useEffect(() => {
        fetchLogs();
    }, [fetchLogs]);

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }));
        setPagination(prev => ({ ...prev, page: 1 }));
    };

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= pagination.totalPages) {
            setPagination(prev => ({ ...prev, page: newPage }));
        }
    };

    return (
        <div className="p-6 md:p-8 space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white">
                        Log Aktivitas
                    </h1>
                    <p className="text-sm text-[#606e8a] mt-1">
                        Riwayat semua aktivitas di platform LapakNesa
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <span className="text-sm text-[#606e8a] bg-[#1a2332] px-3 py-1.5 rounded-lg border border-[#2d3748]">
                        Total: {pagination.total} aktivitas
                    </span>
                    <button onClick={fetchLogs} className="p-2 bg-[#2d3748] hover:bg-[#374151] text-white rounded-lg transition-colors">
                        <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                    </button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
                {categories.slice(1).map(cat => {
                    const count = logs.filter(l => l.category === cat.value).length;
                    const icons = { product: Package, user: Users, admin: Shield, report: Flag, banner: Image, verification: CheckCircle };
                    const Icon = icons[cat.value] || History;
                    return (
                        <button
                            key={cat.value}
                            onClick={() => handleFilterChange('category', cat.value === filters.category ? '' : cat.value)}
                            className={`bg-[#1a2332] p-4 rounded-xl border transition-all ${filters.category === cat.value ? 'border-primary ring-2 ring-primary/30' : 'border-[#2d3748] hover:border-primary/50'}`}
                        >
                            <div className="flex items-center gap-2">
                                <Icon className={`w-5 h-5 ${filters.category === cat.value ? 'text-primary' : 'text-[#606e8a]'}`} />
                                <span className="text-sm font-medium text-white">{cat.label}</span>
                            </div>
                        </button>
                    );
                })}
            </div>

            {/* Filters */}
            <div className="bg-[#1a2332] rounded-xl border border-[#2d3748] p-4">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#606e8a]" />
                            <input
                                type="text"
                                placeholder="Cari dalam deskripsi..."
                                value={filters.search}
                                onChange={(e) => handleFilterChange('search', e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 bg-[#0f1520] border border-[#2d3748] rounded-lg text-white placeholder-[#606e8a] focus:ring-2 focus:ring-primary"
                            />
                        </div>
                    </div>
                    <select
                        value={filters.category}
                        onChange={(e) => handleFilterChange('category', e.target.value)}
                        className="px-4 py-2.5 bg-[#0f1520] border border-[#2d3748] rounded-lg text-white focus:ring-2 focus:ring-primary"
                    >
                        {categories.map(cat => <option key={cat.value} value={cat.value}>{cat.label}</option>)}
                    </select>
                    <select
                        value={filters.action}
                        onChange={(e) => handleFilterChange('action', e.target.value)}
                        className="px-4 py-2.5 bg-[#0f1520] border border-[#2d3748] rounded-lg text-white focus:ring-2 focus:ring-primary"
                    >
                        {actions.map(act => <option key={act.value} value={act.value}>{act.label}</option>)}
                    </select>
                    <button
                        onClick={() => { setFilters({ category: '', action: '', search: '' }); setPagination(prev => ({ ...prev, page: 1 })); }}
                        className="px-4 py-2.5 bg-[#2d3748] text-white rounded-lg hover:bg-[#374151] transition-colors flex items-center gap-2"
                    >
                        <RotateCcw className="w-4 h-4" />
                        Reset
                    </button>
                </div>
            </div>

            {/* Activity Logs Table */}
            <div className="bg-[#1a2332] rounded-xl border border-[#2d3748] overflow-hidden">
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <RefreshCw className="w-8 h-8 text-primary animate-spin" />
                    </div>
                ) : logs.length > 0 ? (
                    <>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-[#0f1520] text-xs uppercase text-[#606e8a] font-semibold tracking-wider">
                                    <tr>
                                        <th className="px-6 py-4">Waktu</th>
                                        <th className="px-6 py-4">Kategori</th>
                                        <th className="px-6 py-4">Aksi</th>
                                        <th className="px-6 py-4">Deskripsi</th>
                                        <th className="px-6 py-4">Pengguna</th>
                                        <th className="px-6 py-4">Role</th>
                                    </tr>
                                </thead>
                                <tbody className="text-sm divide-y divide-[#2d3748]">
                                    {logs.map((log) => (
                                        <tr key={log._id} className="hover:bg-[#0f1520] transition-colors">
                                            <td className="px-6 py-4 text-[#606e8a] whitespace-nowrap">
                                                {new Date(log.createdAt).toLocaleString('id-ID', {
                                                    day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
                                                })}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getCategoryColor(log.category)}`}>
                                                    {formatActivityCategory(log.category)}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <span>{getActionIcon(log.action)}</span>
                                                    <span className="text-white">{formatActivityAction(log.action)}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-gray-300 max-w-xs truncate">{log.description}</td>
                                            <td className="px-6 py-4 text-white">{log.user?.nama || 'Unknown'}</td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${log.userRole === 'admin' || log.userRole === 'super_admin'
                                                    ? 'bg-purple-500/20 text-purple-400'
                                                    : log.userRole === 'penjual'
                                                        ? 'bg-blue-500/20 text-blue-400'
                                                        : 'bg-gray-500/20 text-gray-400'
                                                    }`}>
                                                    {log.userRole === 'super_admin' ? 'Super Admin' :
                                                        log.userRole === 'admin' ? 'Admin' :
                                                            log.userRole === 'penjual' ? 'Penjual' : 'Pembeli'}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        <div className="flex items-center justify-between px-6 py-4 border-t border-[#2d3748]">
                            <div className="text-sm text-[#606e8a]">
                                Halaman {pagination.page} dari {pagination.totalPages}
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => handlePageChange(pagination.page - 1)}
                                    disabled={pagination.page === 1}
                                    className="p-2 bg-[#2d3748] text-white rounded-lg hover:bg-[#374151] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <ChevronLeft className="w-4 h-4" />
                                </button>
                                {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                                    let pageNum;
                                    if (pagination.totalPages <= 5) pageNum = i + 1;
                                    else if (pagination.page <= 3) pageNum = i + 1;
                                    else if (pagination.page >= pagination.totalPages - 2) pageNum = pagination.totalPages - 4 + i;
                                    else pageNum = pagination.page - 2 + i;
                                    return (
                                        <button
                                            key={pageNum}
                                            onClick={() => handlePageChange(pageNum)}
                                            className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${pagination.page === pageNum
                                                ? 'bg-primary text-white'
                                                : 'bg-[#2d3748] text-white hover:bg-[#374151]'
                                                }`}
                                        >
                                            {pageNum}
                                        </button>
                                    );
                                })}
                                <button
                                    onClick={() => handlePageChange(pagination.page + 1)}
                                    disabled={pagination.page === pagination.totalPages}
                                    className="p-2 bg-[#2d3748] text-white rounded-lg hover:bg-[#374151] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="px-6 py-20 text-center text-[#606e8a]">
                        <History className="w-16 h-16 mx-auto mb-4 opacity-50" />
                        <p className="text-lg font-medium text-white">Tidak ada aktivitas ditemukan</p>
                        <p className="text-sm mt-1">Coba ubah filter atau hapus pencarian</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminActivityLogsPage;
