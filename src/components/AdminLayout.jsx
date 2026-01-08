import { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard, Users, Package, ShieldCheck, Flag, Image, History,
    BarChart2, Settings, Bell, BellOff, ChevronRight, Menu, Search, LogOut,
    ArrowRight, Crown, Home, ExternalLink
} from 'lucide-react';
import useAuthStore from '../store/authStore';
import api from '../services/api';

const AdminLayout = ({ children }) => {
    const { user, logout } = useAuthStore();
    const location = useLocation();
    const navigate = useNavigate();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [pendingCount, setPendingCount] = useState(0);
    const [reportCount, setReportCount] = useState(0);
    const [productCount, setProductCount] = useState(0);
    const [notifications, setNotifications] = useState([]);
    const [showNotifications, setShowNotifications] = useState(false);
    const notificationRef = useRef(null);

    // Check if user is super admin
    const isSuperAdmin = user?.role === 'super_admin';

    // Fetch pending verifications count and notifications
    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                const response = await api.get('/admin/stats');
                if (response.data.success) {
                    const data = response.data.data;
                    setPendingCount(data.pending?.verifications || 0);
                    setReportCount(data.pending?.reports || 0);
                    setProductCount(data.pending?.products || 0);

                    // Build notifications array
                    const notifs = [];

                    if (data.pending?.verifications > 0) {
                        notifs.push({
                            id: 'verifications',
                            type: 'verification',
                            title: 'Verifikasi Seller Pending',
                            message: `${data.pending.verifications} permintaan verifikasi menunggu review`,
                            icon: 'verified_user',
                            color: 'orange',
                            link: '/admin/verifications'
                        });
                    }

                    if (data.pending?.products > 0) {
                        notifs.push({
                            id: 'products',
                            type: 'product',
                            title: 'Produk Pending Approval',
                            message: `${data.pending.products} produk menunggu persetujuan`,
                            icon: 'inventory_2',
                            color: 'purple',
                            link: '/admin/products'
                        });
                    }

                    if (data.pending?.reports > 0) {
                        notifs.push({
                            id: 'reports',
                            type: 'report',
                            title: 'Laporan Aktif',
                            message: `${data.pending.reports} laporan perlu ditangani`,
                            icon: 'flag',
                            color: 'red',
                            link: '/admin/reports'
                        });
                    }

                    setNotifications(notifs);
                }
            } catch (error) {
                console.error('Failed to fetch notifications:', error);
            }
        };

        fetchNotifications();
        // Auto refresh every 30 seconds
        const interval = setInterval(fetchNotifications, 30000);
        return () => clearInterval(interval);
    }, [location.pathname]);

    // Close notification dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (notificationRef.current && !notificationRef.current.contains(event.target)) {
                setShowNotifications(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleLogout = () => {
        logout();
        navigate('/admin/login');
    };

    const handleNotificationClick = (link) => {
        setShowNotifications(false);
        navigate(link);
    };

    const totalNotifications = notifications.length;

    const isActive = (path) => {
        return location.pathname === path
            ? 'bg-gradient-to-r from-primary/20 to-transparent text-white border-l-2 border-primary'
            : 'text-gray-400 hover:bg-white/5 hover:text-white border-l-2 border-transparent';
    };

    return (
        <div className="bg-[#0f1419] text-white font-display overflow-hidden h-screen flex">
            {/* Sidebar */}
            <aside className={`w-64 bg-gradient-to-b from-[#1a2332] to-[#151d2a] border-r border-[#2d3748]/50 flex flex-col shrink-0 transition-all duration-300 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'} fixed md:relative z-30 h-full`}>
                {/* Logo Header */}
                <div className="p-5 flex items-center gap-3 border-b border-[#2d3748]/50">
                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-lg">
                        <img
                            src="/LN.png"
                            alt="LapakNesa Logo"
                            className="w-8 h-8 object-contain"
                        />
                    </div>
                    <div>
                        <h1 className="text-lg font-bold tracking-tight bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">LapakNesa</h1>
                        <p className="text-[10px] text-gray-500 uppercase tracking-widest">Admin Panel</p>
                    </div>
                </div>

                <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
                    {/* Dashboard */}
                    <Link to="/admin/dashboard" className={`flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium transition-all duration-200 ${isActive('/admin/dashboard')}`}>
                        <LayoutDashboard className="w-5 h-5" />
                        <span>Ringkasan</span>
                    </Link>

                    {/* Beranda */}
                    <a href="/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium transition-all duration-200 text-gray-400 hover:bg-white/5 hover:text-white border-l-2 border-transparent">
                        <Home className="w-5 h-5" />
                        <span>Lihat Beranda</span>
                        <ExternalLink className="w-3.5 h-3.5 ml-auto opacity-50" />
                    </a>

                    {/* Moderasi Section - Priority items */}
                    <div className="pt-5 pb-2">
                        <p className="px-3 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Moderasi</p>
                    </div>

                    <Link to="/admin/verifications" className={`flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium transition-all duration-200 ${isActive('/admin/verifications')}`}>
                        <ShieldCheck className="w-5 h-5" />
                        <span>Verifikasi Penjual</span>
                        {pendingCount > 0 && (
                            <span className="ml-auto bg-red-500/20 text-red-400 text-xs font-bold px-2 py-0.5 rounded-full animate-pulse">
                                {pendingCount}
                            </span>
                        )}
                    </Link>

                    <Link to="/admin/products" className={`flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium transition-all duration-200 ${isActive('/admin/products')}`}>
                        <Package className="w-5 h-5" />
                        <span>Moderasi Produk</span>
                        {productCount > 0 && (
                            <span className="ml-auto bg-purple-500/20 text-purple-400 text-xs font-bold px-2 py-0.5 rounded-full">
                                {productCount}
                            </span>
                        )}
                    </Link>

                    <Link to="/admin/reports" className={`flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium transition-all duration-200 ${isActive('/admin/reports')}`}>
                        <Flag className="w-5 h-5" />
                        <span>Laporan & Tiket</span>
                        {reportCount > 0 && (
                            <span className="ml-auto bg-red-500/20 text-red-400 text-xs font-bold px-2 py-0.5 rounded-full animate-pulse">
                                {reportCount}
                            </span>
                        )}
                    </Link>

                    {/* Konten Section */}
                    <div className="pt-5 pb-2">
                        <p className="px-3 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Konten</p>
                    </div>

                    <Link to="/admin/users" className={`flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium transition-all duration-200 ${isActive('/admin/users')}`}>
                        <Users className="w-5 h-5" />
                        <span>Kelola Pengguna</span>
                    </Link>

                    <Link to="/admin/banners" className={`flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium transition-all duration-200 ${isActive('/admin/banners')}`}>
                        <Image className="w-5 h-5" />
                        <span>Banner</span>
                    </Link>

                    {/* Super Admin Section */}
                    {isSuperAdmin && (
                        <>
                            <div className="pt-5 pb-2">
                                <p className="px-3 text-[10px] font-bold text-amber-500/80 uppercase tracking-widest">Super Admin</p>
                            </div>

                            <Link to="/admin/admins" className={`flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium transition-all duration-200 ${isActive('/admin/admins')}`}>
                                <Crown className="w-5 h-5" />
                                <span>Kelola Admin</span>
                            </Link>

                            <Link to="/admin/activity-logs" className={`flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium transition-all duration-200 ${isActive('/admin/activity-logs')}`}>
                                <History className="w-5 h-5" />
                                <span>Log Aktivitas</span>
                            </Link>
                        </>
                    )}

                    {/* Lainnya Section */}
                    <div className="pt-5 pb-2">
                        <p className="px-3 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Lainnya</p>
                    </div>

                    <Link to="/admin/analytics" className={`flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium transition-all duration-200 ${isActive('/admin/analytics')}`}>
                        <BarChart2 className="w-5 h-5" />
                        <span>Analitik</span>
                    </Link>

                    <Link to="/admin/settings" className={`flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium transition-all duration-200 ${isActive('/admin/settings')}`}>
                        <Settings className="w-5 h-5" />
                        <span>Pengaturan</span>
                    </Link>
                </nav>

                {/* User Profile & Logout */}
                <div className="p-3 border-t border-[#2d3748]/50 bg-[#0f1520]/50">
                    <div onClick={handleLogout} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-red-500/10 cursor-pointer transition-all duration-200 group">
                        <div className="relative">
                            <img
                                src={user?.avatar || 'https://ui-avatars.com/api/?name=Admin&background=0D8ABC&color=fff'}
                                alt={user?.nama || 'Admin'}
                                className="w-9 h-9 rounded-lg object-cover ring-2 ring-[#2d3748]"
                                referrerPolicy="no-referrer"
                            />
                            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-[#1a2332]"></span>
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-white truncate">{user?.nama || 'Admin'}</p>
                            <p className="text-[11px] text-gray-500 truncate">
                                {isSuperAdmin ? 'Super Admin' : 'Admin'}
                            </p>
                        </div>
                        <LogOut className="w-4 h-4 text-gray-500 group-hover:text-red-400 transition-colors" />
                    </div>
                </div>
            </aside>

            {/* Overlay for mobile sidebar */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-20 md:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                ></div>
            )}

            {/* Main Content */}
            <main className="flex-1 flex flex-col min-w-0 overflow-hidden bg-[#0f1419]">
                {/* Top Header */}
                <header className="h-16 bg-[#1a2332] border-b border-[#2d3748] flex items-center justify-between px-6 shrink-0 z-10">
                    <div className="flex items-center gap-4 flex-1">
                        <button
                            className="md:hidden text-gray-400"
                            onClick={() => setIsSidebarOpen(true)}
                        >
                            <Menu className="w-6 h-6" />
                        </button>
                        <h2 className="text-xl font-bold text-white hidden sm:block">Dashboard</h2>
                        <div className="relative w-full max-w-md ml-4 hidden md:block">
                            <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Search className="w-5 h-5 text-gray-400" />
                            </span>
                            <input className="block w-full pl-10 pr-3 py-2 border-none rounded-lg bg-[#2d3748] text-sm placeholder-[#606e8a] focus:ring-2 focus:ring-primary focus:bg-[#1a2332] transition-all" placeholder="Cari pengguna, pesanan, atau produk..." type="text" />
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        {/* Notification Button */}
                        <div className="relative" ref={notificationRef}>
                            <button
                                onClick={() => setShowNotifications(!showNotifications)}
                                className="relative p-2 text-gray-400 hover:bg-[#2d3748] rounded-full transition-colors"
                            >
                                <Bell className="w-6 h-6" />
                                {totalNotifications > 0 && (
                                    <span className="absolute top-1 right-1 min-w-[18px] h-[18px] bg-red-500 rounded-full border-2 border-white flex items-center justify-center text-[10px] font-bold text-white">
                                        {totalNotifications}
                                    </span>
                                )}
                            </button>

                            {/* Notification Dropdown */}
                            {showNotifications && (
                                <div className="absolute right-0 mt-2 w-80 bg-[#1a2332] rounded-xl shadow-xl border border-[#2d3748] overflow-hidden z-50">
                                    <div className="px-4 py-3 border-b border-[#2d3748] flex items-center justify-between">
                                        <h3 className="font-semibold text-white">Notifikasi</h3>
                                        {totalNotifications > 0 && (
                                            <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-medium">
                                                {totalNotifications} baru
                                            </span>
                                        )}
                                    </div>

                                    <div className="max-h-80 overflow-y-auto">
                                        {notifications.length === 0 ? (
                                            <div className="p-6 text-center">
                                                <BellOff className="w-8 h-8 text-gray-400 mb-2 mx-auto" />
                                                <p className="text-sm text-gray-400">Tidak ada notifikasi</p>
                                            </div>
                                        ) : (
                                            notifications.map((notif) => (
                                                <div
                                                    key={notif.id}
                                                    onClick={() => handleNotificationClick(notif.link)}
                                                    className="px-4 py-3 hover:bg-[#0f1419] cursor-pointer border-b border-[#2d3748] last:border-b-0 transition-colors"
                                                >
                                                    <div className="flex items-start gap-3">
                                                        <div className={`p-2 rounded-lg ${notif.color === 'orange' ? 'bg-orange-100 text-orange-600' :
                                                            notif.color === 'purple' ? 'bg-purple-100 text-purple-600' :
                                                                notif.color === 'red' ? 'bg-red-100 text-red-600' :
                                                                    'bg-blue-100 text-blue-600'
                                                            }`}>
                                                            {/* We need to render the icon dynamically, but for now let's map it or just rely on the fact that we changed strings to components if we did, but wait, the icons are strings in the state. */}
                                                            {/* Wait, the icons in the state are 'verified_user', 'inventory_2', 'flag'. We need to map them to Lucide components. */}
                                                            {notif.icon === 'verified_user' && <ShieldCheck className="w-5 h-5" />}
                                                            {notif.icon === 'inventory_2' && <Package className="w-5 h-5" />}
                                                            {notif.icon === 'flag' && <Flag className="w-5 h-5" />}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-sm font-medium text-white">{notif.title}</p>
                                                            <p className="text-xs text-gray-400 mt-0.5">{notif.message}</p>
                                                        </div>
                                                        <ChevronRight className="w-5 h-5 text-gray-400" />
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>

                                    {notifications.length > 0 && (
                                        <div className="px-4 py-3 border-t border-[#2d3748] bg-[#0f1419]">
                                            <Link
                                                to="/admin/dashboard"
                                                onClick={() => setShowNotifications(false)}
                                                className="text-sm text-primary hover:text-primary/80 font-medium flex items-center justify-center gap-1"
                                            >
                                                Lihat Dashboard
                                                <ArrowRight className="w-4 h-4" />
                                            </Link>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <div className="flex-1 overflow-y-auto">
                    {children}
                </div>
            </main>
        </div>
    );
};

export default AdminLayout;
