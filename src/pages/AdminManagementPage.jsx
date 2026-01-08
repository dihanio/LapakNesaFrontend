import { useState, useEffect } from 'react';
import { Shield, ShieldCheck, UserPlus, Trash2, RefreshCw, Eye, EyeOff, Crown } from 'lucide-react';
import api from '../services/api';
import useAuthStore from '../store/authStore';

const AdminManagementPage = () => {
    const { user: currentUser } = useAuthStore();
    const [admins, setAdmins] = useState([]);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(null);

    // Add Admin Modal
    const [showAddModal, setShowAddModal] = useState(false);
    const [addingAdmin, setAddingAdmin] = useState(false);
    const [newAdmin, setNewAdmin] = useState({ nama: '', email: '', password: '', role: 'admin' });
    const [addError, setAddError] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    // Delete Confirm Modal
    const [deleteTarget, setDeleteTarget] = useState(null);

    useEffect(() => {
        fetchAdmins();
    }, []);

    const fetchAdmins = async () => {
        try {
            setLoading(true);
            const response = await api.get('/admin/users?role=admin,super_admin&limit=100');
            if (response.data.success) {
                // Filter only admin and super_admin roles
                const adminUsers = response.data.data.filter(
                    u => u.role === 'admin' || u.role === 'super_admin'
                );
                setAdmins(adminUsers);
            }
        } catch (error) {
            console.error('Failed to fetch admins:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddAdmin = async (e) => {
        e.preventDefault();
        setAddError('');

        if (!newAdmin.nama || !newAdmin.email || !newAdmin.password) {
            setAddError('Semua field wajib diisi');
            return;
        }

        if (newAdmin.password.length < 6) {
            setAddError('Password minimal 6 karakter');
            return;
        }

        setAddingAdmin(true);
        try {
            const response = await api.post('/admin/users', {
                ...newAdmin,
                role: newAdmin.role // admin or super_admin
            });
            if (response.data.success) {
                setShowAddModal(false);
                setNewAdmin({ nama: '', email: '', password: '', role: 'admin' });
                fetchAdmins();
            }
        } catch (error) {
            setAddError(error.response?.data?.message || 'Gagal menambahkan admin');
        } finally {
            setAddingAdmin(false);
        }
    };

    const handleUpdateRole = async (userId, currentRole) => {
        const newRole = currentRole === 'admin' ? 'super_admin' : 'admin';

        if (userId === currentUser._id) {
            alert('Anda tidak bisa mengubah role diri sendiri');
            return;
        }

        setProcessing(userId);
        try {
            await api.put(`/admin/users/${userId}/role`, { role: newRole });
            setAdmins(admins.map(a =>
                a._id === userId ? { ...a, role: newRole } : a
            ));
        } catch (error) {
            alert(error.response?.data?.message || 'Gagal mengubah role');
        } finally {
            setProcessing(null);
        }
    };

    const handleDelete = async () => {
        if (!deleteTarget) return;

        if (deleteTarget._id === currentUser._id) {
            alert('Anda tidak bisa menghapus diri sendiri');
            setDeleteTarget(null);
            return;
        }

        setProcessing(deleteTarget._id);
        try {
            await api.delete(`/admin/users/${deleteTarget._id}`);
            setAdmins(admins.filter(a => a._id !== deleteTarget._id));
            setDeleteTarget(null);
        } catch (error) {
            alert(error.response?.data?.message || 'Gagal menghapus admin');
        } finally {
            setProcessing(null);
        }
    };

    if (loading) {
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
                        Kelola Administrator
                    </h1>
                    <p className="text-sm text-[#606e8a] mt-1">
                        Kelola akun admin dan super admin sistem
                    </p>
                </div>

                <div className="flex gap-3">
                    <button
                        onClick={fetchAdmins}
                        className="flex items-center gap-2 px-4 py-2 bg-[#2d3748] hover:bg-[#374151] text-white rounded-lg text-sm font-medium transition-colors"
                    >
                        <RefreshCw className="w-4 h-4" />
                        Refresh
                    </button>
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-lg text-sm font-medium transition-all shadow-lg"
                    >
                        <UserPlus className="w-4 h-4" />
                        Tambah Admin
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-[#1a2332] rounded-xl border border-[#2d3748] p-5">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-purple-500/20 rounded-lg">
                            <Shield className="w-5 h-5 text-purple-400" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-white">{admins.length}</p>
                            <p className="text-xs text-[#606e8a]">Total Admin</p>
                        </div>
                    </div>
                </div>
                <div className="bg-[#1a2332] rounded-xl border border-[#2d3748] p-5">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-red-500/20 rounded-lg">
                            <Crown className="w-5 h-5 text-red-400" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-white">
                                {admins.filter(a => a.role === 'super_admin').length}
                            </p>
                            <p className="text-xs text-[#606e8a]">Super Admin</p>
                        </div>
                    </div>
                </div>
                <div className="bg-[#1a2332] rounded-xl border border-[#2d3748] p-5">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-500/20 rounded-lg">
                            <ShieldCheck className="w-5 h-5 text-blue-400" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-white">
                                {admins.filter(a => a.role === 'admin').length}
                            </p>
                            <p className="text-xs text-[#606e8a]">Admin Reguler</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Admin List */}
            <div className="bg-[#1a2332] rounded-xl border border-[#2d3748] overflow-hidden">
                <div className="px-6 py-4 border-b border-[#2d3748]">
                    <h2 className="font-semibold text-white">Daftar Administrator</h2>
                </div>

                <div className="divide-y divide-[#2d3748]">
                    {admins.map((admin) => (
                        <div
                            key={admin._id}
                            className={`p-4 flex items-center justify-between hover:bg-[#2d3748]/50 transition-colors ${admin._id === currentUser._id ? 'bg-primary/5 border-l-4 border-primary' : ''
                                }`}
                        >
                            <div className="flex items-center gap-4">
                                {/* Avatar */}
                                <div className="relative">
                                    {admin.avatar ? (
                                        <img
                                            src={admin.avatar}
                                            alt={admin.nama}
                                            className="w-12 h-12 rounded-full object-cover"
                                            referrerPolicy="no-referrer"
                                        />
                                    ) : (
                                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white font-bold text-lg">
                                            {admin.nama?.charAt(0).toUpperCase()}
                                        </div>
                                    )}
                                    {/* Role Badge Icon */}
                                    <div className={`absolute -bottom-1 -right-1 p-1 rounded-full ${admin.role === 'super_admin' ? 'bg-red-500' : 'bg-blue-500'
                                        }`}>
                                        {admin.role === 'super_admin' ? (
                                            <Crown className="w-3 h-3 text-white" />
                                        ) : (
                                            <Shield className="w-3 h-3 text-white" />
                                        )}
                                    </div>
                                </div>

                                {/* Info */}
                                <div>
                                    <div className="flex items-center gap-2">
                                        <p className="font-semibold text-white">{admin.nama}</p>
                                        {admin._id === currentUser._id && (
                                            <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full">
                                                Anda
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-sm text-[#606e8a]">{admin.email}</p>
                                    <span className={`inline-block mt-1 text-xs font-medium px-2 py-0.5 rounded-full ${admin.role === 'super_admin'
                                        ? 'bg-red-500/20 text-red-400'
                                        : 'bg-blue-500/20 text-blue-400'
                                        }`}>
                                        {admin.role === 'super_admin' ? 'Super Admin' : 'Admin'}
                                    </span>
                                </div>
                            </div>

                            {/* Actions */}
                            {admin._id !== currentUser._id && (
                                <div className="flex items-center gap-2">
                                    {/* Toggle Role */}
                                    <button
                                        onClick={() => handleUpdateRole(admin._id, admin.role)}
                                        disabled={processing === admin._id}
                                        className="flex items-center gap-1.5 px-3 py-1.5 bg-[#2d3748] hover:bg-[#374151] text-white rounded-lg text-xs font-medium transition-colors disabled:opacity-50"
                                        title={`Ubah ke ${admin.role === 'admin' ? 'Super Admin' : 'Admin'}`}
                                    >
                                        <RefreshCw className={`w-3.5 h-3.5 ${processing === admin._id ? 'animate-spin' : ''}`} />
                                        {admin.role === 'admin' ? 'Jadikan Super' : 'Jadikan Admin'}
                                    </button>

                                    {/* Delete */}
                                    <button
                                        onClick={() => setDeleteTarget(admin)}
                                        disabled={processing === admin._id}
                                        className="p-2 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors disabled:opacity-50"
                                        title="Hapus Admin"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            )}
                        </div>
                    ))}

                    {admins.length === 0 && (
                        <div className="p-8 text-center">
                            <Shield className="w-12 h-12 text-[#606e8a] mx-auto mb-3 opacity-50" />
                            <p className="text-[#606e8a]">Belum ada admin terdaftar</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Add Admin Modal */}
            {showAddModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60" onClick={() => setShowAddModal(false)} />
                    <div className="relative bg-[#1a2332] rounded-2xl max-w-md w-full shadow-2xl border border-[#2d3748]">
                        <div className="px-6 py-4 border-b border-[#2d3748] flex items-center justify-between">
                            <h2 className="text-lg font-bold text-white flex items-center gap-2">
                                <UserPlus className="w-5 h-5 text-purple-400" />
                                Tambah Admin Baru
                            </h2>
                            <button
                                onClick={() => setShowAddModal(false)}
                                className="p-1 hover:bg-[#2d3748] rounded-lg transition-colors text-[#606e8a]"
                            >
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>

                        <form onSubmit={handleAddAdmin} className="p-6 space-y-4">
                            {addError && (
                                <div className="p-3 bg-red-900/20 border border-red-800/30 rounded-lg text-red-400 text-sm">
                                    {addError}
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-medium text-[#606e8a] mb-1.5">Nama Lengkap</label>
                                <input
                                    type="text"
                                    value={newAdmin.nama}
                                    onChange={(e) => setNewAdmin(prev => ({ ...prev, nama: e.target.value }))}
                                    className="w-full rounded-lg border border-[#2d3748] bg-[#0f1520] py-2.5 px-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    placeholder="Masukkan nama admin"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-[#606e8a] mb-1.5">Email</label>
                                <input
                                    type="email"
                                    value={newAdmin.email}
                                    onChange={(e) => setNewAdmin(prev => ({ ...prev, email: e.target.value }))}
                                    className="w-full rounded-lg border border-[#2d3748] bg-[#0f1520] py-2.5 px-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    placeholder="email@example.com"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-[#606e8a] mb-1.5">Password</label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        value={newAdmin.password}
                                        onChange={(e) => setNewAdmin(prev => ({ ...prev, password: e.target.value }))}
                                        className="w-full rounded-lg border border-[#2d3748] bg-[#0f1520] py-2.5 px-3 pr-10 text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                                        placeholder="Minimal 6 karakter"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-[#606e8a] hover:text-white"
                                    >
                                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-[#606e8a] mb-1.5">Role</label>
                                <select
                                    value={newAdmin.role}
                                    onChange={(e) => setNewAdmin(prev => ({ ...prev, role: e.target.value }))}
                                    className="w-full rounded-lg border border-[#2d3748] bg-[#0f1520] py-2.5 px-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                                >
                                    <option value="admin">Admin Reguler</option>
                                    <option value="super_admin">Super Admin</option>
                                </select>
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setShowAddModal(false)}
                                    className="flex-1 py-2.5 border border-[#2d3748] rounded-lg text-sm font-medium text-[#606e8a] hover:bg-[#2d3748] transition-colors"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={addingAdmin}
                                    className="flex-1 py-2.5 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-lg text-sm font-medium disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                                >
                                    {addingAdmin ? (
                                        <>
                                            <RefreshCw className="w-4 h-4 animate-spin" />
                                            Menyimpan...
                                        </>
                                    ) : (
                                        <>
                                            <UserPlus className="w-4 h-4" />
                                            Tambah Admin
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Confirm Modal */}
            {deleteTarget && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60" onClick={() => setDeleteTarget(null)} />
                    <div className="relative bg-[#1a2332] rounded-2xl max-w-sm w-full shadow-2xl border border-[#2d3748] text-center p-6">
                        <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Trash2 className="w-8 h-8 text-red-400" />
                        </div>
                        <h3 className="text-lg font-bold text-white mb-2">Hapus Admin?</h3>
                        <p className="text-sm text-[#606e8a] mb-6">
                            Anda akan menghapus <span className="text-white font-medium">{deleteTarget.nama}</span> dari daftar administrator.
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setDeleteTarget(null)}
                                className="flex-1 py-2.5 border border-[#2d3748] rounded-lg text-sm font-medium text-[#606e8a] hover:bg-[#2d3748] transition-colors"
                            >
                                Batal
                            </button>
                            <button
                                onClick={handleDelete}
                                disabled={processing === deleteTarget._id}
                                className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
                            >
                                {processing === deleteTarget._id ? (
                                    <RefreshCw className="w-4 h-4 animate-spin" />
                                ) : (
                                    <Trash2 className="w-4 h-4" />
                                )}
                                Hapus
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminManagementPage;
