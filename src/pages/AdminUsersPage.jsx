import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    Users, UserCheck, Store, ShoppingBag, Search, Filter, RefreshCw,
    ChevronLeft, ChevronRight, Ban, LockOpen, Trash2, ArrowUpDown,
    TrendingUp, Eye, Mail, Calendar, Shield
} from 'lucide-react';
import api from '../services/api';
import useAuthStore from '../store/authStore';

const AdminUsersPage = () => {
    const { user: currentUser } = useAuthStore();
    const isSuperAdmin = currentUser?.role === 'super_admin';

    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(null);
    const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
    const [filters, setFilters] = useState({ role: '', search: '' });
    const [searchInput, setSearchInput] = useState('');
    const [stats, setStats] = useState({ total: 0, pembeli: 0, penjual: 0, newThisMonth: 0 });

    useEffect(() => {
        fetchUsers();
    }, [pagination.page, filters.role]);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams({
                page: pagination.page,
                limit: 15,
                ...(filters.role && { role: filters.role }),
                ...(filters.search && { search: filters.search }),
            });

            const response = await api.get(`/admin/users?${params}`);
            if (response.data.success) {
                // Filter out admin and super_admin users
                const filteredUsers = response.data.data.filter(
                    u => u.role !== 'admin' && u.role !== 'super_admin'
                );
                setUsers(filteredUsers);

                // Calculate stats
                const allUsers = response.data.data.filter(u => u.role !== 'admin' && u.role !== 'super_admin');
                const thirtyDaysAgo = new Date();
                thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

                setStats({
                    total: allUsers.length,
                    pembeli: allUsers.filter(u => u.role === 'pembeli').length,
                    penjual: allUsers.filter(u => u.role === 'penjual').length,
                    newThisMonth: allUsers.filter(u => new Date(u.createdAt) > thirtyDaysAgo).length
                });

                setPagination(prev => ({
                    ...prev,
                    ...response.data.pagination,
                    total: filteredUsers.length
                }));
            }
        } catch (error) {
            console.error('Failed to fetch users:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        setFilters(prev => ({ ...prev, search: searchInput }));
        setPagination(prev => ({ ...prev, page: 1 }));
        fetchUsers();
    };

    const handleBanToggle = async (userId, userName, isBanned, hasReports = false) => {
        if (!isSuperAdmin && !isBanned && !hasReports) {
            alert('Admin hanya bisa ban user yang memiliki laporan aktif.');
            return;
        }

        const action = isBanned ? 'membuka blokir' : 'memblokir';
        if (!confirm(`Yakin ingin ${action} ${userName}?`)) return;

        setProcessing(userId);
        try {
            await api.put(`/admin/users/${userId}/ban`);
            setUsers(users.map(u =>
                u._id === userId ? { ...u, isBanned: !u.isBanned } : u
            ));
        } catch (error) {
            const errorMsg = error.response?.data?.message || 'Gagal mengubah status ban user';
            alert(errorMsg);
        } finally {
            setProcessing(null);
        }
    };

    const handleRoleChange = async (userId, userName, currentRole) => {
        const newRole = currentRole === 'penjual' ? 'pembeli' : 'penjual';
        if (!confirm(`Ubah role ${userName} menjadi ${newRole}?`)) return;

        setProcessing(userId);
        try {
            await api.put(`/admin/users/${userId}/role`, { role: newRole });
            setUsers(users.map(u =>
                u._id === userId ? { ...u, role: newRole } : u
            ));
        } catch (error) {
            alert('Gagal mengubah role user');
        } finally {
            setProcessing(null);
        }
    };

    const handleDelete = async (userId, userName) => {
        if (!confirm(`PERINGATAN: Ini akan menghapus ${userName} dan semua produknya secara permanen. Lanjutkan?`)) return;

        setProcessing(userId);
        try {
            await api.delete(`/admin/users/${userId}`);
            setUsers(users.filter(u => u._id !== userId));
            alert('User berhasil dihapus');
        } catch (error) {
            alert('Gagal menghapus user');
        } finally {
            setProcessing(null);
        }
    };

    const getStatusBadge = (user) => {
        if (user.isBanned) return { text: 'Banned', style: 'bg-red-500/20 text-red-400', icon: Ban };
        if (user.verification?.status === 'verified') return { text: 'Verified', style: 'bg-emerald-500/20 text-emerald-400', icon: UserCheck };
        if (user.verification?.status === 'pending') return { text: 'Pending', style: 'bg-yellow-500/20 text-yellow-400', icon: Shield };
        return { text: 'Aktif', style: 'bg-gray-500/20 text-gray-400', icon: Users };
    };

    if (loading && users.length === 0) {
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
                        Kelola Pengguna
                    </h1>
                    <p className="text-sm text-[#606e8a] mt-1">
                        Kelola semua pengguna pembeli dan penjual
                    </p>
                </div>

                <button
                    onClick={fetchUsers}
                    className="flex items-center gap-2 px-4 py-2 bg-[#2d3748] hover:bg-[#374151] text-white rounded-lg text-sm font-medium transition-colors"
                >
                    <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                    Refresh
                </button>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Total Users */}
                <div className="bg-[#1a2332] p-6 rounded-xl border border-[#2d3748] relative overflow-hidden group hover:shadow-lg transition-shadow">
                    <div className="relative z-10">
                        <p className="text-sm font-medium text-[#606e8a]">Total Pengguna</p>
                        <h3 className="text-2xl font-bold text-white mt-1">{stats.total}</h3>
                        <div className="flex items-center gap-1 mt-2">
                            <span className="bg-green-500/20 text-green-400 px-1.5 py-0.5 rounded text-xs font-semibold flex items-center">
                                <TrendingUp className="w-3 h-3 mr-0.5" />
                                +{stats.newThisMonth}
                            </span>
                            <span className="text-[#606e8a] text-xs">30 hari</span>
                        </div>
                    </div>
                </div>

                {/* Pembeli */}
                <div className="bg-[#1a2332] p-6 rounded-xl border border-[#2d3748] relative overflow-hidden group hover:shadow-lg transition-shadow">
                    <div className="relative z-10">
                        <p className="text-sm font-medium text-[#606e8a]">Pembeli</p>
                        <h3 className="text-2xl font-bold text-white mt-1">{stats.pembeli}</h3>
                        <div className="flex items-center gap-1 mt-2">
                            <button
                                onClick={() => { setFilters(prev => ({ ...prev, role: 'pembeli' })); setPagination(prev => ({ ...prev, page: 1 })); }}
                                className="bg-pink-500/20 text-pink-400 px-1.5 py-0.5 rounded text-xs font-semibold flex items-center hover:bg-pink-500/30 transition-colors"
                            >
                                <Filter className="w-3 h-3 mr-0.5" />
                                Filter
                            </button>
                        </div>
                    </div>
                </div>

                {/* Penjual */}
                <div className="bg-[#1a2332] p-6 rounded-xl border border-[#2d3748] relative overflow-hidden group hover:shadow-lg transition-shadow">
                    <div className="relative z-10">
                        <p className="text-sm font-medium text-[#606e8a]">Penjual</p>
                        <h3 className="text-2xl font-bold text-white mt-1">{stats.penjual}</h3>
                        <div className="flex items-center gap-1 mt-2">
                            <button
                                onClick={() => { setFilters(prev => ({ ...prev, role: 'penjual' })); setPagination(prev => ({ ...prev, page: 1 })); }}
                                className="bg-cyan-500/20 text-cyan-400 px-1.5 py-0.5 rounded text-xs font-semibold flex items-center hover:bg-cyan-500/30 transition-colors"
                            >
                                <Filter className="w-3 h-3 mr-0.5" />
                                Filter
                            </button>
                        </div>
                    </div>
                </div>

                {/* Verifikasi Info */}
                <div className="bg-[#1a2332] p-6 rounded-xl border border-[#2d3748] relative overflow-hidden group hover:shadow-lg transition-shadow">
                    <div className="relative z-10">
                        <p className="text-sm font-medium text-[#606e8a]">User Terverifikasi</p>
                        <h3 className="text-2xl font-bold text-white mt-1">
                            {users.filter(u => u.verification?.status === 'verified').length}
                        </h3>
                        <div className="flex items-center gap-1 mt-2">
                            <Link to="/admin/verifications" className="bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded text-xs font-semibold flex items-center hover:bg-emerald-500/30 transition-colors">
                                <Eye className="w-3 h-3 mr-0.5" />
                                Lihat
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters & Search */}
            <div className="bg-[#1a2332] rounded-xl border border-[#2d3748] p-4">
                <div className="flex flex-col sm:flex-row gap-3">
                    {/* Search */}
                    <form onSubmit={handleSearch} className="flex-1 flex gap-2">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#606e8a]" />
                            <input
                                type="text"
                                placeholder="Cari nama, email, atau NIM..."
                                value={searchInput}
                                onChange={(e) => setSearchInput(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 bg-[#0f1520] border border-[#2d3748] rounded-lg text-sm text-white placeholder-[#606e8a] focus:ring-2 focus:ring-primary focus:border-transparent"
                            />
                        </div>
                        <button
                            type="submit"
                            className="px-4 py-2.5 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
                        >
                            Cari
                        </button>
                    </form>

                    {/* Role Filter */}
                    <select
                        value={filters.role}
                        onChange={(e) => {
                            setFilters(prev => ({ ...prev, role: e.target.value }));
                            setPagination(prev => ({ ...prev, page: 1 }));
                        }}
                        className="px-4 py-2.5 bg-[#0f1520] border border-[#2d3748] rounded-lg text-sm text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                    >
                        <option value="">Semua Role</option>
                        <option value="pembeli">Pembeli</option>
                        <option value="penjual">Penjual</option>
                    </select>

                    {filters.role && (
                        <button
                            onClick={() => setFilters(prev => ({ ...prev, role: '' }))}
                            className="px-3 py-2.5 bg-red-500/20 text-red-400 rounded-lg text-sm font-medium hover:bg-red-500/30 transition-colors"
                        >
                            Reset
                        </button>
                    )}
                </div>
            </div>

            {/* Users Table */}
            <div className="bg-[#1a2332] rounded-xl border border-[#2d3748] overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-[#0f1520] text-xs uppercase text-[#606e8a] font-semibold tracking-wider">
                            <tr>
                                <th className="px-6 py-4">User</th>
                                <th className="px-6 py-4">NIM / Fakultas</th>
                                <th className="px-6 py-4">Role</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Terdaftar</th>
                                <th className="px-6 py-4 text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="text-sm divide-y divide-[#2d3748]">
                            {users.map((user) => {
                                const status = getStatusBadge(user);
                                const StatusIcon = status.icon;
                                return (
                                    <tr key={user._id} className="hover:bg-[#0f1520] transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                {user.avatar ? (
                                                    <img src={user.avatar} alt="" className="w-10 h-10 rounded-full object-cover" referrerPolicy="no-referrer" />
                                                ) : (
                                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/30 to-primary/50 flex items-center justify-center font-bold text-white">
                                                        {user.nama?.charAt(0)}
                                                    </div>
                                                )}
                                                <div>
                                                    <p className="font-semibold text-white">{user.nama}</p>
                                                    <p className="text-xs text-[#606e8a] flex items-center gap-1">
                                                        <Mail className="w-3 h-3" />
                                                        {user.email}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="font-mono text-white">{user.nim || '-'}</p>
                                            <p className="text-xs text-[#606e8a]">{user.fakultas || '-'}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize ${user.role === 'penjual'
                                                ? 'bg-cyan-500/20 text-cyan-400'
                                                : 'bg-pink-500/20 text-pink-400'
                                                }`}>
                                                {user.role}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2.5 py-1 rounded-full text-xs font-medium flex items-center gap-1 w-fit ${status.style}`}>
                                                <StatusIcon className="w-3 h-3" />
                                                {status.text}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-[#606e8a]">
                                            <div className="flex items-center gap-1">
                                                <Calendar className="w-3 h-3" />
                                                {new Date(user.createdAt).toLocaleDateString('id-ID')}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex justify-end gap-2">
                                                {/* Role Toggle - Super Admin Only */}
                                                {isSuperAdmin && (
                                                    <button
                                                        onClick={() => handleRoleChange(user._id, user.nama, user.role)}
                                                        disabled={processing === user._id}
                                                        className="p-2 rounded-lg hover:bg-blue-500/20 text-blue-400 transition-colors disabled:opacity-50"
                                                        title={`Ubah ke ${user.role === 'penjual' ? 'Pembeli' : 'Penjual'}`}
                                                    >
                                                        <ArrowUpDown className="w-4 h-4" />
                                                    </button>
                                                )}

                                                {/* Ban Toggle */}
                                                {(isSuperAdmin || user.isBanned) && (
                                                    <button
                                                        onClick={() => handleBanToggle(user._id, user.nama, user.isBanned)}
                                                        disabled={processing === user._id}
                                                        className={`p-2 rounded-lg transition-colors disabled:opacity-50 ${user.isBanned
                                                            ? 'hover:bg-green-500/20 text-green-400'
                                                            : 'hover:bg-orange-500/20 text-orange-400'
                                                            }`}
                                                        title={user.isBanned ? 'Unban User' : 'Ban User'}
                                                    >
                                                        {user.isBanned ? <LockOpen className="w-4 h-4" /> : <Ban className="w-4 h-4" />}
                                                    </button>
                                                )}

                                                {/* Delete - Super Admin Only */}
                                                {isSuperAdmin && (
                                                    <button
                                                        onClick={() => handleDelete(user._id, user.nama)}
                                                        disabled={processing === user._id}
                                                        className="p-2 rounded-lg hover:bg-red-500/20 text-red-400 transition-colors disabled:opacity-50"
                                                        title="Hapus User"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {pagination.totalPages > 1 && (
                    <div className="px-6 py-4 border-t border-[#2d3748] flex items-center justify-between">
                        <p className="text-sm text-[#606e8a]">
                            Halaman {pagination.page} dari {pagination.totalPages}
                        </p>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                                disabled={pagination.page === 1}
                                className="px-3 py-1.5 rounded-lg border border-[#2d3748] text-sm text-white disabled:opacity-50 hover:bg-[#2d3748] transition-colors flex items-center gap-1"
                            >
                                <ChevronLeft className="w-4 h-4" />
                                Prev
                            </button>
                            <button
                                onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                                disabled={pagination.page === pagination.totalPages}
                                className="px-3 py-1.5 rounded-lg border border-[#2d3748] text-sm text-white disabled:opacity-50 hover:bg-[#2d3748] transition-colors flex items-center gap-1"
                            >
                                Next
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {users.length === 0 && !loading && (
                <div className="text-center py-12 bg-[#1a2332] border border-[#2d3748] rounded-xl">
                    <Users className="w-16 h-16 text-[#606e8a] mx-auto mb-4 opacity-50" />
                    <h3 className="text-lg font-semibold text-white">Tidak ada user ditemukan</h3>
                    <p className="text-[#606e8a]">Coba ubah filter atau kata kunci pencarian.</p>
                </div>
            )}
        </div>
    );
};

export default AdminUsersPage;
