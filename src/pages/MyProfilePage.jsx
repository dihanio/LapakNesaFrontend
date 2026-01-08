import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
    User, Settings, X, LogOut, LayoutDashboard, Store, PlusCircle,
    BadgeCheck, ShieldCheck, Mail, Phone, School, AlertCircle, Save, Loader2
} from 'lucide-react';
import useAuthStore from '../store/authStore';
import api from '../services/api';
import { useToast } from '../components/ToastProvider';
import { fakultasOptions } from '../constants/formOptions';

function MyProfilePage() {
    const navigate = useNavigate();
    const toast = useToast();
    const { user, setUser, logout } = useAuthStore();
    const [activeTab, setActiveTab] = useState('profile');
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [formData, setFormData] = useState({
        nim: '',
        fakultas: '',
        whatsapp: '',
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [stats, setStats] = useState({ products: 0, sold: 0, wishlist: 0 });
    const isSeller = user?.role === 'penjual';

    useEffect(() => {
        if (user) {
            setFormData({
                nim: user.nim || '',
                fakultas: user.fakultas || '',
                whatsapp: user.whatsapp ?
                    (user.whatsapp.startsWith('62') ? '0' + user.whatsapp.slice(2) : user.whatsapp)
                    : '',
            });
            fetchStats();
        }
    }, [user]);

    const fetchStats = async () => {
        try {
            const response = await api.get('/products/user/my');
            const products = response.data.data || [];
            setStats({
                products: products.length,
                sold: products.filter(p => p.status === 'terjual').length,
                wishlist: 0,
            });
        } catch (error) {
            console.error('Error fetching stats:', error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!formData.nim || !formData.fakultas || !formData.whatsapp) {
            setError('Semua field wajib diisi');
            return;
        }

        const waNumber = formData.whatsapp.replace(/\D/g, '');
        if (waNumber.length < 10 || waNumber.length > 15) {
            setError('Nomor WhatsApp tidak valid');
            return;
        }

        try {
            setLoading(true);
            const response = await api.put('/auth/complete-profile', {
                nim: formData.nim,
                fakultas: formData.fakultas,
                whatsapp: formData.whatsapp.startsWith('08')
                    ? '62' + formData.whatsapp.slice(1)
                    : formData.whatsapp,
            });

            setUser(response.data.data);
            toast.success('Profil berhasil diperbarui!');
        } catch (err) {
            setError(err.response?.data?.message || 'Gagal menyimpan profil');
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        logout();
        localStorage.removeItem('token');
        navigate('/');
    };

    const menuItems = [
        { id: 'profile', Icon: User, label: 'Profil Saya' },
        { id: 'account', Icon: Settings, label: 'Pengaturan Akun' },
    ];

    return (
        <div className="min-h-screen bg-slate-100 flex">
            {/* Mobile Sidebar Overlay */}
            {sidebarOpen && (
                <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={() => setSidebarOpen(false)}></div>
            )}

            {/* Sidebar */}
            <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200 flex flex-col transform transition-transform duration-200 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
                {/* Sidebar Header */}
                <div className="h-16 flex items-center justify-between px-4 border-b border-slate-100">
                    <Link to="/" className="flex items-center gap-2">
                        <img src="/LN.png" alt="Logo" className="size-6 object-contain" />
                        <div className="flex flex-col">
                            <span className="text-lg font-extrabold leading-none">
                                <span className="text-[#0B5FA5]">Lapak</span><span className="text-[#F2B705]">Nesa</span>
                            </span>
                            <span className="text-[9px] font-medium text-[#8A8A8A] leading-tight">Marketplace Mahasiswa UNESA</span>
                        </div>
                    </Link>
                    <button onClick={() => setSidebarOpen(false)} className="lg:hidden p-1 text-slate-400">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* User Profile */}
                <div className="p-4 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                        {user?.avatar ? (
                            <img src={user.avatar} alt={user.nama} className="size-12 rounded-full object-cover ring-2 ring-blue-100" referrerPolicy="no-referrer" />
                        ) : (
                            <div className="size-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-lg font-bold ring-2 ring-blue-100">
                                {user?.nama?.charAt(0).toUpperCase() || 'U'}
                            </div>
                        )}
                        <div className="min-w-0">
                            <p className="font-semibold text-slate-900 truncate">{user?.nama}</p>
                            <p className="text-xs text-slate-500">{user?.email}</p>
                        </div>
                    </div>
                </div>

                {/* Navigation Menu */}
                <nav className="flex-1 p-3 space-y-1">
                    {menuItems.map(item => (
                        <button
                            key={item.id}
                            onClick={() => { setActiveTab(item.id); setSidebarOpen(false); }}
                            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${activeTab === item.id
                                ? 'bg-blue-500 text-white shadow-md shadow-blue-500/25'
                                : 'text-slate-600 hover:bg-slate-100'
                                }`}
                        >
                            <item.Icon className="w-5 h-5" />
                            <span className="flex-1 text-left">{item.label}</span>
                        </button>
                    ))}
                </nav>

                {/* Sidebar Footer */}
                <div className="p-3 border-t border-slate-100 space-y-1">
                    {isSeller && (
                        <Link to="/dashboard" className="w-full flex items-center gap-3 px-3 py-2.5 text-slate-600 hover:bg-slate-100 rounded-xl text-sm font-medium">
                            <LayoutDashboard className="w-5 h-5" />
                            Dashboard
                        </Link>
                    )}
                    <Link to="/" className="w-full flex items-center gap-3 px-3 py-2.5 text-slate-600 hover:bg-slate-100 rounded-xl text-sm font-medium">
                        <Store className="w-5 h-5" />
                        Beranda
                    </Link>
                    <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2.5 text-red-500 hover:bg-red-50 rounded-xl text-sm font-medium">
                        <LogOut className="w-5 h-5" />
                        Keluar
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col min-w-0">
                {/* Top Bar */}
                <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 lg:px-6 sticky top-0 z-10">
                    <div className="flex items-center gap-3">
                        <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 text-slate-500 hover:bg-slate-100 rounded-lg">
                            <span className="material-symbols-outlined">menu</span>
                        </button>
                        <h1 className="text-xl font-bold text-slate-900">
                            {activeTab === 'profile' && 'Profil Saya'}
                            {activeTab === 'account' && 'Pengaturan Akun'}
                        </h1>
                    </div>
                </header>

                {/* Content Area */}
                <div className="flex-1 p-4 lg:p-6 overflow-auto">
                    {/* Profile Tab */}
                    {activeTab === 'profile' && (
                        <div className="max-w-2xl space-y-6">
                            {/* Profile Header */}
                            <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl p-6 text-white">
                                <div className="flex items-center gap-4">
                                    {user?.avatar ? (
                                        <img src={user.avatar} alt={user.nama} className="size-20 rounded-xl object-cover border-2 border-white/30" referrerPolicy="no-referrer" />
                                    ) : (
                                        <div className="size-20 rounded-xl bg-white/20 flex items-center justify-center text-3xl font-bold">
                                            {user?.nama?.charAt(0).toUpperCase() || 'U'}
                                        </div>
                                    )}
                                    <div>
                                        <h2 className="text-2xl font-bold">{user?.nama}</h2>
                                        <p className="text-blue-100 text-sm">{user?.email}</p>
                                        <div className="flex gap-2 mt-2">
                                            {isSeller && (
                                                <span className="bg-white/20 px-2 py-0.5 rounded-full text-xs font-medium">Penjual</span>
                                            )}
                                            {user?.verification?.status === 'verified' && (
                                                <span className="bg-green-400/30 px-2 py-0.5 rounded-full text-xs font-medium flex items-center gap-1">
                                                    <BadgeCheck className="w-3.5 h-3.5" />
                                                    Terverifikasi
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Stats */}
                            <div className="grid grid-cols-3 gap-4">
                                <div className="bg-white rounded-xl p-4 border border-slate-200 text-center">
                                    <p className="text-2xl font-bold text-slate-900">{stats.products}</p>
                                    <p className="text-xs text-slate-500">Total Iklan</p>
                                </div>
                                <div className="bg-white rounded-xl p-4 border border-slate-200 text-center">
                                    <p className="text-2xl font-bold text-slate-900">{stats.sold}</p>
                                    <p className="text-xs text-slate-500">Terjual</p>
                                </div>
                                <div className="bg-white rounded-xl p-4 border border-slate-200 text-center">
                                    <p className="text-2xl font-bold text-slate-900">{stats.wishlist}</p>
                                    <p className="text-xs text-slate-500">Wishlist</p>
                                </div>
                            </div>

                            {/* Account Info */}
                            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                                <div className="p-4 border-b border-slate-100">
                                    <h3 className="font-semibold text-slate-900">Informasi Akun</h3>
                                </div>
                                <div className="divide-y divide-slate-100">
                                    <div className="flex items-center gap-4 p-4">
                                        <div className="size-10 rounded-lg bg-blue-100 flex items-center justify-center">
                                            <BadgeCheck className="w-5 h-5 text-blue-600" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-slate-400">NIM</p>
                                            <p className="font-medium text-slate-900">{user?.nim || '-'}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4 p-4">
                                        <div className="size-10 rounded-lg bg-green-100 flex items-center justify-center">
                                            <School className="w-5 h-5 text-green-600" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-slate-400">Fakultas</p>
                                            <p className="font-medium text-slate-900">{user?.fakultas || '-'}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4 p-4">
                                        <div className="size-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                                            <Phone className="w-5 h-5 text-emerald-600" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-slate-400">WhatsApp</p>
                                            <p className="font-medium text-slate-900">
                                                {user?.whatsapp ? (user.whatsapp.startsWith('62') ? '+' + user.whatsapp : user.whatsapp) : '-'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Quick Actions */}
                            <div className="grid grid-cols-2 gap-4">
                                {isSeller ? (
                                    <>
                                        <Link to="/dashboard" className="flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 text-white py-3 px-4 rounded-xl font-semibold transition-colors">
                                            <LayoutDashboard className="w-5 h-5" />
                                            Buka Dashboard
                                        </Link>
                                        <Link to="/jual" className="flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 py-3 px-4 rounded-xl font-semibold transition-colors">
                                            <PlusCircle className="w-5 h-5" />
                                            Pasang Iklan
                                        </Link>
                                    </>
                                ) : (
                                    <Link to="/dashboard?tab=verification" className="col-span-2 flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 text-white py-3 px-4 rounded-xl font-semibold transition-colors">
                                        <Store className="w-5 h-5" />
                                        Mulai Berjualan
                                    </Link>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Account Tab */}
                    {activeTab === 'account' && (
                        <div className="max-w-2xl space-y-6">
                            {/* Edit Profile Form */}
                            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                                <div className="p-4 border-b border-slate-100">
                                    <h3 className="font-semibold text-slate-900">Edit Profil</h3>
                                    <p className="text-sm text-slate-500">Perbarui informasi akun Anda</p>
                                </div>
                                <form onSubmit={handleSubmit} className="p-4 space-y-4">
                                    {error && (
                                        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600 flex items-center gap-2">
                                            <AlertCircle className="w-5 h-5" />
                                            {error}
                                        </div>
                                    )}
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">NIM</label>
                                        <input
                                            type="text"
                                            value={formData.nim}
                                            onChange={(e) => setFormData({ ...formData, nim: e.target.value })}
                                            className="w-full rounded-xl border border-slate-200 py-3 px-4 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
                                            placeholder="Contoh: 21050524001"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Fakultas</label>
                                        <select
                                            value={formData.fakultas}
                                            onChange={(e) => setFormData({ ...formData, fakultas: e.target.value })}
                                            className="w-full rounded-xl border border-slate-200 py-3 px-4 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none bg-white"
                                        >
                                            <option value="">Pilih Fakultas</option>
                                            {fakultasOptions.map((opt) => (
                                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Nomor WhatsApp</label>
                                        <input
                                            type="tel"
                                            value={formData.whatsapp}
                                            onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                                            className="w-full rounded-xl border border-slate-200 py-3 px-4 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
                                            placeholder="08123456789"
                                        />
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 text-white py-3 px-4 rounded-xl font-semibold transition-colors disabled:opacity-50"
                                    >
                                        {loading ? (
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                        ) : (
                                            <Save className="w-5 h-5" />
                                        )}
                                        {loading ? 'Menyimpan...' : 'Simpan Perubahan'}
                                    </button>
                                </form>
                            </div>

                            {/* Danger Zone */}
                            <div className="bg-white rounded-2xl border border-red-200 overflow-hidden">
                                <div className="p-4 border-b border-red-100 bg-red-50">
                                    <h3 className="font-semibold text-red-900">Zona Berbahaya</h3>
                                    <p className="text-sm text-red-600">Tindakan ini tidak dapat dibatalkan</p>
                                </div>
                                <div className="p-4">
                                    <button
                                        onClick={handleLogout}
                                        className="w-full flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 text-white py-3 px-4 rounded-xl font-semibold transition-colors"
                                    >
                                        <LogOut className="w-5 h-5" />
                                        Keluar dari Akun
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}

export default MyProfilePage;
