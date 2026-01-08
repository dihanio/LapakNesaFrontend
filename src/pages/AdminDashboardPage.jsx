import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
    Users, CircleDot, Store, ShoppingBag, User, Package, TrendingUp, Tag,
    ShoppingCart, Wallet, ShieldCheck, AlertCircle, CheckCircle, Clock, Flag,
    ClipboardCheck, CheckCheck, Ban, MinusCircle, Calendar, BarChart2, Receipt,
    History, Shield, ShieldAlert, Edit, Download, Circle
} from 'lucide-react';
import api from '../services/api';
import useAuthStore from '../store/authStore';
import activityLogService, { formatActivityAction, formatActivityCategory, getCategoryColor, getActionIcon } from '../services/activityLogService';
import { formatCurrency } from '../utils/formatUtils';

const REFRESH_INTERVAL = 15000; // Auto refresh every 15 seconds

const AdminDashboardPage = () => {
    const { user } = useAuthStore();
    const isSuperAdmin = user?.role === 'super_admin';

    const [stats, setStats] = useState({
        users: { total: 0, new: 0, online: 0 },
        products: { total: 0, new: 0 },
        revenue: { total: 0 },
        pending: { verifications: 0, products: 0 }
    });
    const [recentActivities, setRecentActivities] = useState([]);
    const [activitiesLoading, setActivitiesLoading] = useState(true);
    const [loading, setLoading] = useState(true);

    const fetchStats = useCallback(async (showLoading = false) => {
        try {
            if (showLoading) setLoading(true);
            const response = await api.get('/admin/stats');
            if (response.data.success) {
                setStats(response.data.data);
            }
        } catch (error) {
            console.error('Failed to fetch dashboard stats:', error);
        } finally {
            if (showLoading) setLoading(false);
        }
    }, []);

    const fetchRecentActivities = useCallback(async () => {
        try {
            const response = await activityLogService.getRecentLogs(10);
            if (response.success) {
                setRecentActivities(response.data);
            }
        } catch (error) {
            console.error('Failed to fetch recent activities:', error);
        } finally {
            setActivitiesLoading(false);
        }
    }, []);

    // Initial fetch
    useEffect(() => {
        fetchStats(true);
        if (user?.role === 'super_admin') {
            fetchRecentActivities();
        } else {
            setActivitiesLoading(false);
        }
    }, [user?.role, fetchStats, fetchRecentActivities]);

    // Auto refresh polling
    useEffect(() => {
        const interval = setInterval(() => {
            fetchStats(false); // Silent refresh (no loading indicator)
            if (user?.role === 'super_admin') {
                fetchRecentActivities();
            }
        }, REFRESH_INTERVAL);

        return () => clearInterval(interval);
    }, [user?.role, fetchStats, fetchRecentActivities]);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="p-6 md:p-8 space-y-8">
            {/* Admin Profile Card */}
            <div className="bg-[#1a2332] rounded-xl border border-[#2d3748] shadow-sm p-6">
                <div className="flex flex-col sm:flex-row items-center gap-6">
                    {/* Avatar */}
                    <div className="relative group">
                        <div className="size-24 rounded-full bg-gradient-to-br from-primary/20 to-primary/40 flex items-center justify-center overflow-hidden border-4 border-white shadow-lg">
                            {user?.avatar ? (
                                <img src={user.avatar} alt={user.nama} className="size-full object-cover" referrerPolicy="no-referrer" />
                            ) : (
                                <span className="text-3xl font-bold text-primary">{user?.nama?.charAt(0)?.toUpperCase()}</span>
                            )}
                        </div>
                        {/* Verification Badge for Admin/SuperAdmin */}
                        {(user?.role === 'admin' || user?.role === 'super_admin') && (
                            <div className="absolute -bottom-1 -right-1 size-8 bg-blue-500 rounded-full flex items-center justify-center border-2 border-white shadow" title={user?.role === 'super_admin' ? 'Super Admin' : 'Admin'}>
                                <ShieldCheck className="w-4 h-4 text-white" />
                            </div>
                        )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 text-center sm:text-left">
                        <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap">
                            <h2 className="text-2xl font-bold text-white">{user?.nama || 'Admin'}</h2>
                            {user?.role === 'super_admin' && (
                                <span className="px-2 py-0.5 bg-gradient-to-r from-purple-500 to-blue-500 text-white text-xs font-bold rounded-full flex items-center gap-1">
                                    <Shield className="w-3 h-3" />
                                    Super Admin
                                </span>
                            )}
                            {user?.role === 'admin' && (
                                <span className="px-2 py-0.5 bg-blue-500 text-white text-xs font-bold rounded-full flex items-center gap-1">
                                    <ShieldAlert className="w-3 h-3" />
                                    Admin
                                </span>
                            )}
                        </div>
                        <p className="text-[#606e8a] text-sm mt-1">{user?.email}</p>
                        <p className="text-xs text-[#606e8a] mt-2">
                            <span className="inline-flex items-center gap-1">
                                <Circle className="w-3 h-3 text-green-500" />
                                Aktif sejak {new Date(user?.createdAt || Date.now()).toLocaleDateString('id-ID', { year: 'numeric', month: 'long' })}
                            </span>
                        </p>
                    </div>

                    {/* Edit Button */}
                    <Link
                        to="/admin/profile"
                        className="px-4 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors flex items-center gap-2 text-sm"
                    >
                        <Edit className="w-4 h-4" />
                        Edit Profil
                    </Link>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
                {/* Stat Card 1 - Pengguna Aktif */}
                <div className="bg-[#1a2332] dark:bg-[#1a2332] p-6 rounded-xl border border-[#2d3748] dark:border-[#2d3748] shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
                    <div className="relative z-10">
                        <p className="text-sm font-medium text-[#606e8a] dark:text-gray-400">Pengguna Aktif</p>
                        <h3 className="text-2xl font-bold text-white dark:text-white mt-1">{stats.users.total}</h3>
                        <div className="flex items-center gap-1 mt-2 text-sm">
                            <span className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-1.5 py-0.5 rounded text-xs font-semibold flex items-center">
                                <TrendingUp className="w-3 h-3 mr-0.5" />
                                +{stats.users.new}
                            </span>
                            <span className="text-[#606e8a] dark:text-gray-500 text-xs">30 hari terakhir</span>
                        </div>
                    </div>
                </div>

                {/* Stat Card 2 - User Online */}
                <div className="bg-[#1a2332] dark:bg-[#1a2332] p-6 rounded-xl border border-[#2d3748] dark:border-[#2d3748] shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
                    <div className="relative z-10">
                        <p className="text-sm font-medium text-[#606e8a] dark:text-gray-400">User Online</p>
                        <h3 className="text-2xl font-bold text-white dark:text-white mt-1">{stats.users.online}</h3>
                        <div className="flex items-center gap-1 mt-2 text-sm">
                            <span className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-1.5 py-0.5 rounded text-xs font-semibold flex items-center">
                                <CircleDot className="w-3 h-3 mr-0.5 animate-pulse" />
                                Live
                            </span>
                            <span className="text-[#606e8a] dark:text-gray-500 text-xs">5 menit terakhir</span>
                        </div>
                    </div>
                </div>

                {/* Stat Card 3 - Penjual Terverifikasi */}
                <div className="bg-[#1a2332] dark:bg-[#1a2332] p-6 rounded-xl border border-[#2d3748] dark:border-[#2d3748] shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
                    <div className="relative z-10">
                        <p className="text-sm font-medium text-[#606e8a] dark:text-gray-400">Penjual</p>
                        <h3 className="text-2xl font-bold text-white dark:text-white mt-1">{stats.users.sellers || 0}</h3>
                        <div className="flex items-center gap-1 mt-2 text-sm">
                            <Link to="/admin/users?role=penjual" className="bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-400 px-1.5 py-0.5 rounded text-xs font-semibold flex items-center">
                                <ShieldCheck className="w-3 h-3 mr-0.5" />
                                Terverifikasi
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Stat Card 4 - Pembeli Terdaftar */}
                <div className="bg-[#1a2332] dark:bg-[#1a2332] p-6 rounded-xl border border-[#2d3748] dark:border-[#2d3748] shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
                    <div className="relative z-10">
                        <p className="text-sm font-medium text-[#606e8a] dark:text-gray-400">Pembeli</p>
                        <h3 className="text-2xl font-bold text-white dark:text-white mt-1">{stats.users.buyers || 0}</h3>
                        <div className="flex items-center gap-1 mt-2 text-sm">
                            <Link to="/admin/users?role=pembeli" className="bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-400 px-1.5 py-0.5 rounded text-xs font-semibold flex items-center">
                                <User className="w-3 h-3 mr-0.5" />
                                Terdaftar
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Stat Card 5 - Produk Terdaftar */}
                <div className="bg-[#1a2332] dark:bg-[#1a2332] p-6 rounded-xl border border-[#2d3748] dark:border-[#2d3748] shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
                    <div className="relative z-10">
                        <p className="text-sm font-medium text-[#606e8a] dark:text-gray-400">Produk Terdaftar</p>
                        <h3 className="text-2xl font-bold text-white dark:text-white mt-1">{stats.products.total}</h3>
                        <div className="flex items-center gap-1 mt-2 text-sm">
                            <span className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-1.5 py-0.5 rounded text-xs font-semibold flex items-center">
                                <TrendingUp className="w-3 h-3 mr-0.5" />
                                +{stats.products.new}
                            </span>
                            <span className="text-[#606e8a] dark:text-gray-500 text-xs">30 hari terakhir</span>
                        </div>
                    </div>
                </div>

                {/* Stat Card 6 - Produk Terjual */}
                <div className="bg-[#1a2332] dark:bg-[#1a2332] p-6 rounded-xl border border-[#2d3748] dark:border-[#2d3748] shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
                    <div className="relative z-10">
                        <p className="text-sm font-medium text-[#606e8a] dark:text-gray-400">Total Terjual</p>
                        <h3 className="text-2xl font-bold text-white dark:text-white mt-1">{stats.products.sold || 0}</h3>
                        <div className="flex items-center gap-1 mt-2 text-sm">
                            <span className="bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400 px-1.5 py-0.5 rounded text-xs font-semibold flex items-center">
                                <ShoppingCart className="w-3 h-3 mr-0.5" />
                                Produk
                            </span>
                        </div>
                    </div>
                </div>

                {/* Stat Card 7 - Total Transaksi */}
                <div className="bg-[#1a2332] dark:bg-[#1a2332] p-6 rounded-xl border border-[#2d3748] dark:border-[#2d3748] shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
                    <div className="relative z-10">
                        <p className="text-sm font-medium text-[#606e8a] dark:text-gray-400">Total Transaksi</p>
                        <h3 className="text-2xl font-bold text-white dark:text-white mt-1">{formatCurrency(stats.revenue.total)}</h3>
                        <div className="flex items-center gap-1 mt-2 text-sm">
                            <span className="text-[#606e8a] dark:text-gray-500 text-xs">Estimasi dari produk terjual</span>
                        </div>
                    </div>
                </div>

                {/* Stat Card 8 - Verifikasi Seller */}
                <div className="bg-[#1a2332] dark:bg-[#1a2332] p-6 rounded-xl border border-[#2d3748] dark:border-[#2d3748] shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
                    <div className="relative z-10">
                        <p className="text-sm font-medium text-[#606e8a] dark:text-gray-400">Verifikasi Seller</p>
                        <h3 className="text-2xl font-bold text-white dark:text-white mt-1">{stats.pending.verifications}</h3>
                        <div className="flex items-center gap-1 mt-2 text-sm">
                            <Link to="/admin/verifications" className={`px-1.5 py-0.5 rounded text-xs font-semibold flex items-center ${stats.pending.verifications > 0 ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400' : 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'}`}>
                                {stats.pending.verifications > 0 ? <AlertCircle className="w-3 h-3 mr-0.5" /> : <CheckCircle className="w-3 h-3 mr-0.5" />}
                                {stats.pending.verifications > 0 ? 'Perlu Review' : 'Beres'}
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Stat Card 9 - Produk Pending Approval */}
                <div className="bg-[#1a2332] dark:bg-[#1a2332] p-6 rounded-xl border border-[#2d3748] dark:border-[#2d3748] shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
                    <div className="relative z-10">
                        <p className="text-sm font-medium text-[#606e8a] dark:text-gray-400">Produk Pending</p>
                        <h3 className="text-2xl font-bold text-white dark:text-white mt-1">{stats.pending.products || 0}</h3>
                        <div className="flex items-center gap-1 mt-2 text-sm">
                            <Link to="/admin/products" className={`px-1.5 py-0.5 rounded text-xs font-semibold flex items-center ${stats.pending.products > 0 ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400' : 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'}`}>
                                {stats.pending.products > 0 ? <AlertCircle className="w-3 h-3 mr-0.5" /> : <CheckCircle className="w-3 h-3 mr-0.5" />}
                                {stats.pending.products > 0 ? 'Perlu Review' : 'Beres'}
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Stat Card 10 - Laporan Pending */}
                <div className="bg-[#1a2332] dark:bg-[#1a2332] p-6 rounded-xl border border-[#2d3748] dark:border-[#2d3748] shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
                    <div className="relative z-10">
                        <p className="text-sm font-medium text-[#606e8a] dark:text-gray-400">Laporan Aktif</p>
                        <h3 className="text-2xl font-bold text-white dark:text-white mt-1">{stats.pending.reports || 0}</h3>
                        <div className="flex items-center gap-1 mt-2 text-sm">
                            <Link to="/admin/reports" className={`px-1.5 py-0.5 rounded text-xs font-semibold flex items-center ${stats.pending.reports > 0 ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400' : 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'}`}>
                                {stats.pending.reports > 0 ? <AlertCircle className="w-3 h-3 mr-0.5" /> : <CheckCircle className="w-3 h-3 mr-0.5" />}
                                {stats.pending.reports > 0 ? 'Perlu Review' : 'Beres'}
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Stat Card 11 - Laporan Selesai */}
                <div className="bg-[#1a2332] dark:bg-[#1a2332] p-6 rounded-xl border border-[#2d3748] dark:border-[#2d3748] shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
                    <div className="relative z-10">
                        <p className="text-sm font-medium text-[#606e8a] dark:text-gray-400">Laporan Selesai</p>
                        <h3 className="text-2xl font-bold text-white dark:text-white mt-1">{stats.pending.resolvedReports || 0}</h3>
                        <div className="flex items-center gap-1 mt-2 text-sm">
                            <Link to="/admin/reports?status=resolved" className="bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 px-1.5 py-0.5 rounded text-xs font-semibold flex items-center">
                                <CheckCheck className="w-3 h-3 mr-0.5" />
                                Diselesaikan
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Stat Card 12 - Akun Dibanned */}
                <div className="bg-[#1a2332] dark:bg-[#1a2332] p-6 rounded-xl border border-[#2d3748] dark:border-[#2d3748] shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
                    <div className="relative z-10">
                        <p className="text-sm font-medium text-[#606e8a] dark:text-gray-400">Akun Dibanned</p>
                        <h3 className="text-2xl font-bold text-white dark:text-white mt-1">{stats.users.banned || 0}</h3>
                        <div className="flex items-center gap-1 mt-2 text-sm">
                            <span className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-1.5 py-0.5 rounded text-xs font-semibold flex items-center">
                                <MinusCircle className="w-3 h-3 mr-0.5" />
                                Restricted
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Grid: Charts & Tasks */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Chart Section */}
                <div className="lg:col-span-2 bg-[#1a2332] dark:bg-[#1a2332] rounded-xl border border-[#2d3748] dark:border-[#2d3748] shadow-sm p-6 flex flex-col">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="text-lg font-bold text-white dark:text-white">Analitik Pertumbuhan</h3>
                            <p className="text-sm text-[#606e8a] dark:text-gray-400">Tren pengguna baru (7 Hari Terakhir)</p>
                        </div>
                        <div className="bg-[#2d3748] dark:bg-[#2d3748] px-3 py-1.5 rounded-lg flex items-center gap-2">
                            <Calendar className="w-3 h-3 text-primary" />
                            <span className="text-sm font-medium text-white">Minggu Ini</span>
                        </div>
                    </div>
                    <div className="flex-1 min-h-[250px] w-full bg-gradient-to-b from-primary/5 via-transparent to-transparent rounded-lg relative overflow-hidden flex items-end px-4 pb-0 gap-3 border border-[#2d3748] border-dashed">
                        {/* Dynamic Simple Bar Chart */}
                        {stats.chart && stats.chart.length > 0 ? (
                            stats.chart.map((day, index) => (
                                <div key={index} className="flex-1 flex flex-col items-center gap-3 group h-full justify-end pb-4">
                                    <div className="w-full relative flex-1 flex items-end">
                                        <div
                                            className="w-full bg-gradient-to-t from-primary/20 to-primary rounded-t-md relative group-hover:from-primary/40 group-hover:to-primary/80 transition-all duration-300"
                                            style={{ height: `${Math.max(day.count * 20, 5)}%` }} // Scale height
                                        >
                                            <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-[#2d3748] text-white text-xs font-bold px-2 py-1 rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity transform translate-y-2 group-hover:translate-y-0 duration-200 pointer-events-none whitespace-nowrap z-10">
                                                {day.count} User
                                                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-[#2d3748] rotate-45"></div>
                                            </div>
                                        </div>
                                    </div>
                                    <span className="text-xs font-medium text-[#606e8a] dark:text-gray-500 group-hover:text-white transition-colors">{day._id.split('-')[2]}</span>
                                </div>
                            ))
                        ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center text-[#606e8a]">
                                <div className="p-4 bg-[#2d3748] rounded-full mb-3 opacity-50">
                                    <BarChart2 className="w-8 h-8" />
                                </div>
                                <p className="text-sm">Belum ada data grafik</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Tasks/Notifications Widget */}
                <div className="bg-[#1a2332] dark:bg-[#1a2332] rounded-xl border border-[#2d3748] dark:border-[#2d3748] shadow-sm flex flex-col h-[380px] lg:h-auto">
                    <div className="p-6 border-b border-[#2d3748] dark:border-[#2d3748] flex justify-between items-center">
                        <div>
                            <h3 className="text-lg font-bold text-white dark:text-white">Tugas Prioritas</h3>
                            <p className="text-xs text-[#606e8a] mt-0.5">Hal yang perlu diselesaikan</p>
                        </div>
                        {stats.pending?.list && stats.pending.list.length > 0 && (
                            <Link to="/admin/verifications" className="text-xs text-primary font-bold hover:underline bg-primary/10 px-2 py-1 rounded">Lihat Semua</Link>
                        )}
                    </div>
                    <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                        <div className="space-y-3">
                            {stats.pending?.list && stats.pending.list.length > 0 ? (
                                stats.pending.list.map((task) => (
                                    <div key={task._id} className="flex gap-4 p-3 bg-[#0f1419] border border-[#2d3748] hover:border-primary/50 rounded-xl transition-all cursor-pointer group hover:shadow-lg hover:-translate-y-0.5">
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-500/20 to-orange-500/20 text-orange-400 flex items-center justify-center shrink-0 border border-orange-500/20 group-hover:border-orange-500/50 transition-colors">
                                            <ShieldCheck className="w-5 h-5" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-start">
                                                <p className="text-sm font-bold text-white dark:text-white group-hover:text-primary transition-colors truncate">Verifikasi Penjual</p>
                                                <span className="text-[10px] text-[#606e8a] bg-[#2d3748] px-1.5 py-0.5 rounded">{new Date(task.verification.submittedAt).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' })}</span>
                                            </div>
                                            <p className="text-xs text-[#606e8a] dark:text-gray-400 mt-1 line-clamp-1"><span className="text-white font-medium">{task.nama}</span> menunggu persetujuan.</p>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="h-full flex flex-col items-center justify-center text-center p-6 mt-4">
                                    <div className="w-16 h-16 bg-gradient-to-b from-green-500/20 to-transparent rounded-full flex items-center justify-center mb-4 ring-2 ring-green-500/20">
                                        <CheckCircle className="w-8 h-8 text-green-500" />
                                    </div>
                                    <h4 className="text-white font-bold mb-1">Semua Beres!</h4>
                                    <p className="text-sm text-[#606e8a]">Tidak ada tugas pending saat ini.</p>
                                    <p className="text-xs text-green-500 font-medium mt-2 bg-green-500/10 px-3 py-1 rounded-full">Kerja bagus, Admin!</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Recent Activity Table */}
            <div className="bg-[#1a2332] dark:bg-[#1a2332] rounded-xl border border-[#2d3748] dark:border-[#2d3748] shadow-sm overflow-hidden">
                <div className="p-6 border-b border-[#2d3748] dark:border-[#2d3748] flex flex-wrap items-center justify-between gap-4">
                    <h3 className="text-lg font-bold text-white dark:text-white">Transaksi Terbaru</h3>
                    <div className="flex gap-2">
                        <button className="px-4 py-2 text-xs font-semibold bg-[#2d3748] dark:bg-[#2d3748] text-white dark:text-white rounded-lg hover:bg-[#374151] dark:hover:bg-[#374151] transition-colors flex items-center gap-2 border border-[#374151]">
                            <Download className="w-4 h-4" />
                            Export CSV
                        </button>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-[#151b27] dark:bg-[#151b27] text-xs uppercase text-[#606e8a] dark:text-gray-500 font-bold tracking-wider">
                                <th className="px-6 py-4 border-b border-[#2d3748] dark:border-[#2d3748]">ID Produk</th>
                                <th className="px-6 py-4 border-b border-[#2d3748] dark:border-[#2d3748]">Produk</th>
                                <th className="px-6 py-4 border-b border-[#2d3748] dark:border-[#2d3748]">Penjual</th>
                                <th className="px-6 py-4 border-b border-[#2d3748] dark:border-[#2d3748]">Status</th>
                                <th className="px-6 py-4 border-b border-[#2d3748] dark:border-[#2d3748]">Harga</th>
                                <th className="px-6 py-4 border-b border-[#2d3748] dark:border-[#2d3748] text-right">Tanggal</th>
                            </tr>
                        </thead>
                        <tbody className="text-sm divide-y divide-[#2d3748] dark:divide-[#2d3748]">
                            {stats.transactions && stats.transactions.length > 0 ? (
                                stats.transactions.map((product) => (
                                    <tr key={product._id} className="hover:bg-[#2d3748]/50 dark:hover:bg-[#2d3748]/50 transition-colors group">
                                        <td className="px-6 py-4 font-mono text-xs text-primary bg-primary/5 rounded-r-lg w-fit">#{product._id.slice(-6).toUpperCase()}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-lg bg-cover bg-center bg-[#2d3748] ring-1 ring-[#374151]" style={{ backgroundImage: `url(${product.gambar || 'https://placehold.co/150'})` }}></div>
                                                <span className="text-white dark:text-gray-200 font-medium line-clamp-1">{product.namaBarang}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-[#606e8a] dark:text-gray-400">
                                            {product.penjual?.nama || 'Unknown'} <br />
                                            <span className="text-xs text-[#4a5568]">{product.penjual?.fakultas || '-'}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-green-500/10 text-green-500 border border-green-500/20">
                                                Terjual
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 font-bold text-white dark:text-white">{formatCurrency(product.harga)}</td>
                                        <td className="px-6 py-4 text-right text-[#606e8a] dark:text-gray-400 font-medium">
                                            {new Date(product.updatedAt).toLocaleDateString()}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="6" className="px-6 py-12 text-center text-[#606e8a]">
                                        <Receipt className="w-10 h-10 mx-auto mb-2 opacity-30" />
                                        <p>Belum ada transaksi (produk terjual).</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Activity Log Section - Super Admin Only */}
            {isSuperAdmin && (
                <div className="bg-[#1a2332] dark:bg-[#1a2332] rounded-xl border border-[#2d3748] dark:border-[#2d3748] shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-[#2d3748] dark:border-[#2d3748] flex flex-wrap items-center justify-between gap-4">
                        <div>
                            <h3 className="text-lg font-bold text-white dark:text-white">Log Aktivitas Terbaru</h3>
                            <p className="text-sm text-[#606e8a] dark:text-gray-400">Aktivitas terbaru di platform</p>
                        </div>
                        <Link to="/admin/activity-logs" className="px-3 py-1.5 text-sm font-medium bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors">
                            Lihat Semua
                        </Link>
                    </div>
                    <div className="p-6">
                        {activitiesLoading ? (
                            <div className="flex items-center justify-center py-12">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                            </div>
                        ) : recentActivities.length > 0 ? (
                            <div className="space-y-4">
                                {recentActivities.map((activity) => (
                                    <div key={activity._id} className="flex gap-4 p-4 rounded-xl hover:bg-[#2d3748]/50 transition-colors border border-transparent hover:border-[#2d3748] group">
                                        {/* Icon Column */}
                                        <div className="shrink-0">
                                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${activity.category === 'auth' ? 'bg-blue-500/10 text-blue-500' :
                                                activity.category === 'product' ? 'bg-green-500/10 text-green-500' :
                                                    activity.category === 'order' ? 'bg-purple-500/10 text-purple-500' :
                                                        activity.category === 'report' ? 'bg-red-500/10 text-red-500' : 'bg-gray-500/10 text-gray-500'
                                                }`}>
                                                <span className="material-symbols-outlined text-2xl group-hover:scale-110 transition-transform">
                                                    {getActionIcon(activity.action)}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Content Column */}
                                        <div className="flex-1 min-w-0 flex flex-col justify-center">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider ${getCategoryColor(activity.category)}`}>
                                                    {formatActivityCategory(activity.category)}
                                                </span>
                                                <span className="text-xs text-[#606e8a] dark:text-gray-500">
                                                    {new Date(activity.createdAt).toLocaleString('id-ID', {
                                                        day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
                                                    })}
                                                </span>
                                            </div>

                                            <h4 className="text-sm font-bold text-white dark:text-white truncate">
                                                {formatActivityAction(activity.action)}
                                            </h4>

                                            <p className="text-sm text-[#94a3b8] dark:text-gray-400 line-clamp-1 mt-0.5">
                                                {activity.description}
                                            </p>

                                            <div className="flex items-center gap-1.5 mt-2">
                                                <div className="w-5 h-5 rounded-full bg-[#2d3748] flex items-center justify-center text-[10px] font-bold text-[#606e8a] border border-[#374151]">
                                                    {activity.user?.nama?.charAt(0) || 'S'}
                                                </div>
                                                <span className="text-xs font-medium text-[#606e8a] dark:text-gray-500">
                                                    {activity.user?.nama || 'System'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="px-6 py-12 text-center text-[#606e8a] dark:text-gray-400">
                                <History className="w-10 h-10 mx-auto mb-2 opacity-50" />
                                Belum ada aktivitas tercatat.
                            </div>
                        )}
                    </div>
                </div>
            )}

            <footer className="text-center text-sm text-[#606e8a] dark:text-gray-500 pt-4">
                © 2026 LapakNesa Administrator Portal. Universitas Negeri Surabaya.
            </footer>
        </div>
    );
};

export default AdminDashboardPage;
