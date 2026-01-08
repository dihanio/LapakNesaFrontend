import { useState, useEffect } from 'react';
import {
    BarChart2, TrendingUp, Users, Package, ShoppingBag, DollarSign,
    ArrowUp, ArrowDown, RefreshCw, PieChart, Activity
} from 'lucide-react';
import api from '../services/api';
import { formatCurrency } from '../utils/formatUtils';

const AdminAnalyticsPage = () => {
    const [loading, setLoading] = useState(true);
    const [timeRange, setTimeRange] = useState('7d');
    const [data, setData] = useState(null);

    useEffect(() => {
        fetchAnalytics();
    }, [timeRange]);

    const fetchAnalytics = async () => {
        setLoading(true);
        try {
            const response = await api.get(`/admin/analytics?range=${timeRange}`);
            if (response.data.success) {
                setData(response.data.data);
            }
        } catch (error) {
            console.error('Failed to fetch analytics:', error);
        } finally {
            setLoading(false);
        }
    };

    const StatCard = ({ title, value, growth, suffix = '' }) => (
        <div className="bg-[#1a2332] p-5 rounded-xl border border-[#2d3748] relative overflow-hidden group hover:shadow-lg transition-shadow">
            <p className="text-sm font-medium text-[#606e8a]">{title}</p>
            <h3 className="text-3xl font-bold text-white mt-1">
                {typeof value === 'number' ? value.toLocaleString() : value}{suffix}
            </h3>
            {growth !== undefined && (
                <div className={`flex items-center gap-1 mt-2 text-sm ${growth >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {growth >= 0 ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
                    <span>{Math.abs(growth)}% dari periode sebelumnya</span>
                </div>
            )}
        </div>
    );

    const getRangeLabel = () => {
        switch (timeRange) {
            case '7d': return '7 Hari Terakhir';
            case '30d': return '30 Hari Terakhir';
            case '90d': return '90 Hari Terakhir';
            case '1y': return '1 Tahun';
            default: return '7 Hari Terakhir';
        }
    };

    return (
        <div className="p-6 md:p-8 space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white">
                        Laporan & Analitik
                    </h1>
                    <p className="text-sm text-[#606e8a] mt-1">Statistik dan performa platform</p>
                </div>
                <div className="flex items-center gap-3">
                    <select
                        value={timeRange}
                        onChange={(e) => setTimeRange(e.target.value)}
                        className="px-4 py-2 bg-[#0f1520] border border-[#2d3748] rounded-lg text-white text-sm focus:ring-2 focus:ring-primary"
                    >
                        <option value="7d">7 Hari Terakhir</option>
                        <option value="30d">30 Hari Terakhir</option>
                        <option value="90d">90 Hari Terakhir</option>
                        <option value="1y">1 Tahun</option>
                    </select>
                    <button onClick={fetchAnalytics} className="p-2 bg-[#2d3748] hover:bg-[#374151] text-white rounded-lg transition-colors">
                        <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                    </button>
                </div>
            </div>

            {loading && !data ? (
                <div className="flex items-center justify-center py-20">
                    <RefreshCw className="w-8 h-8 text-primary animate-spin" />
                </div>
            ) : data ? (
                <>
                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <StatCard title="Total Pengguna" value={data.summary.totalUsers} growth={data.growth.users} />
                        <StatCard title="Total Produk" value={data.summary.totalProducts} growth={data.growth.products} />
                        <StatCard title="Produk Terjual" value={data.summary.totalSoldProducts} />
                        <StatCard title="Total Pendapatan" value={formatCurrency(data.summary.totalRevenue)} />
                    </div>

                    {/* New Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-[#1a2332] p-5 rounded-xl border border-[#2d3748]">
                            <h3 className="font-semibold text-white mb-4">
                                Periode Ini ({getRangeLabel()})
                            </h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-[#0f1520] p-4 rounded-lg">
                                    <p className="text-[#606e8a] text-sm">Pengguna Baru</p>
                                    <p className="text-2xl font-bold text-white">{data.growth.usersNew}</p>
                                </div>
                                <div className="bg-[#0f1520] p-4 rounded-lg">
                                    <p className="text-[#606e8a] text-sm">Produk Baru</p>
                                    <p className="text-2xl font-bold text-white">{data.growth.productsNew}</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-[#1a2332] p-5 rounded-xl border border-[#2d3748]">
                            <h3 className="font-semibold text-white mb-4">
                                Distribusi Pengguna
                            </h3>
                            <div className="space-y-3">
                                {data.charts.usersByRole?.map(item => (
                                    <div key={item._id} className="flex items-center justify-between">
                                        <span className="text-white capitalize">{item._id}</span>
                                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${item._id === 'penjual' ? 'bg-blue-500/20 text-blue-400' : 'bg-pink-500/20 text-pink-400'
                                            }`}>
                                            {item.count}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Charts */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="bg-[#1a2332] rounded-xl border border-[#2d3748] p-6">
                            <h3 className="text-lg font-semibold text-white mb-4">
                                Pertumbuhan Pengguna
                            </h3>
                            {data.charts.userGrowth?.length > 0 ? (
                                <div className="space-y-2">
                                    {data.charts.userGrowth.map(item => (
                                        <div key={item._id} className="flex items-center gap-3">
                                            <span className="text-[#606e8a] text-sm w-24">{item._id}</span>
                                            <div className="flex-1 bg-[#0f1520] rounded-full h-4 overflow-hidden">
                                                <div
                                                    className="bg-gradient-to-r from-blue-500 to-cyan-500 h-full rounded-full"
                                                    style={{ width: `${Math.min((item.count / Math.max(...data.charts.userGrowth.map(u => u.count))) * 100, 100)}%` }}
                                                />
                                            </div>
                                            <span className="text-white font-medium w-8">{item.count}</span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="h-32 flex items-center justify-center text-[#606e8a]">
                                    Tidak ada data untuk periode ini
                                </div>
                            )}
                        </div>

                        <div className="bg-[#1a2332] rounded-xl border border-[#2d3748] p-6">
                            <h3 className="text-lg font-semibold text-white mb-4">
                                Produk per Kategori
                            </h3>
                            {data.charts.productsByCategory?.length > 0 ? (
                                <div className="space-y-2">
                                    {data.charts.productsByCategory.slice(0, 6).map(item => (
                                        <div key={item._id} className="flex items-center gap-3">
                                            <span className="text-[#606e8a] text-sm w-24 truncate capitalize">{item._id}</span>
                                            <div className="flex-1 bg-[#0f1520] rounded-full h-4 overflow-hidden">
                                                <div
                                                    className="bg-gradient-to-r from-purple-500 to-pink-500 h-full rounded-full"
                                                    style={{ width: `${Math.min((item.count / Math.max(...data.charts.productsByCategory.map(p => p.count))) * 100, 100)}%` }}
                                                />
                                            </div>
                                            <span className="text-white font-medium w-8">{item.count}</span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="h-32 flex items-center justify-center text-[#606e8a]">
                                    Tidak ada data kategori
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Top Sellers */}
                    {data.topSellers?.length > 0 && (
                        <div className="bg-[#1a2332] rounded-xl border border-[#2d3748] p-6">
                            <h3 className="text-lg font-semibold text-white mb-4">Top Penjual</h3>
                            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                                {data.topSellers.map((seller, idx) => (
                                    <div key={seller._id} className="bg-[#0f1520] p-4 rounded-lg text-center">
                                        <div className="relative inline-block">
                                            {seller.avatar ? (
                                                <img src={seller.avatar} alt="" className="w-12 h-12 rounded-full mx-auto object-cover" />
                                            ) : (
                                                <div className="w-12 h-12 rounded-full mx-auto bg-primary/20 flex items-center justify-center text-primary font-bold">
                                                    {seller.nama?.charAt(0)}
                                                </div>
                                            )}
                                            <span className={`absolute -top-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${idx === 0 ? 'bg-yellow-500 text-black' :
                                                idx === 1 ? 'bg-gray-300 text-black' :
                                                    idx === 2 ? 'bg-amber-600 text-white' : 'bg-[#2d3748] text-white'
                                                }`}>
                                                {idx + 1}
                                            </span>
                                        </div>
                                        <p className="text-white font-medium mt-2 truncate">{seller.nama}</p>
                                        <p className="text-[#606e8a] text-sm">{seller.productCount} produk</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </>
            ) : (
                <div className="text-center py-20 text-[#606e8a]">
                    <BarChart2 className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p>Gagal memuat data analitik</p>
                </div>
            )}
        </div>
    );
};

export default AdminAnalyticsPage;
