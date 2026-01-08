import { useState, useEffect } from 'react';
import {
    Flag, RefreshCw, Search, Inbox, Clock, CheckCircle, AlertTriangle,
    User, Package, MessageSquare, Eye, Ban, X, ExternalLink
} from 'lucide-react';
import reportService from '../services/reportService';
import api from '../services/api';
import { useToast } from '../components/ToastProvider';

const statusConfig = {
    open: { color: 'bg-blue-500/20 text-blue-400', label: 'Terbuka', icon: Inbox },
    in_progress: { color: 'bg-amber-500/20 text-amber-400', label: 'Diproses', icon: Clock },
    resolved: { color: 'bg-green-500/20 text-green-400', label: 'Selesai', icon: CheckCircle },
    closed: { color: 'bg-gray-500/20 text-gray-400', label: 'Ditutup', icon: X },
};

const priorityConfig = {
    low: { color: 'bg-gray-500/20 text-gray-400', label: 'Rendah' },
    medium: { color: 'bg-blue-500/20 text-blue-400', label: 'Sedang' },
    high: { color: 'bg-orange-500/20 text-orange-400', label: 'Tinggi' },
    urgent: { color: 'bg-red-500/20 text-red-400', label: 'Mendesak' },
};

const typeConfig = {
    product: { label: 'Produk', icon: Package },
    user: { label: 'Pengguna', icon: User },
    general: { label: 'Umum', icon: MessageSquare },
};

const categoryLabels = {
    penipuan: 'Penipuan', produk_palsu: 'Produk Palsu', konten_tidak_pantas: 'Konten Tidak Pantas',
    harga_tidak_wajar: 'Harga Tidak Wajar', spam: 'Spam', pelecehan: 'Pelecehan',
    akun_palsu: 'Akun Palsu', bug_sistem: 'Bug Sistem', saran: 'Saran', pertanyaan: 'Pertanyaan', lainnya: 'Lainnya',
};

function AdminReportsPage() {
    const toast = useToast();
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState(null);
    const [selectedReport, setSelectedReport] = useState(null);
    const [filters, setFilters] = useState({ status: '', type: '', priority: '', search: '' });
    const [resolution, setResolution] = useState('');
    const [resolving, setResolving] = useState(false);
    const [banning, setBanning] = useState(false);

    const fetchReports = async () => {
        try {
            setLoading(true);
            const response = await reportService.getAllReports(filters);
            setReports(response.data);
        } catch {
            toast.error('Gagal memuat laporan');
        } finally {
            setLoading(false);
        }
    };

    const fetchStats = async () => {
        try {
            const response = await reportService.getReportStats();
            setStats(response.data);
        } catch (error) {
            console.error('Failed to fetch stats:', error);
        }
    };

    useEffect(() => {
        fetchReports();
        fetchStats();
    }, [filters]);

    const handleStatusChange = async (reportId, newStatus) => {
        try {
            await reportService.updateReport(reportId, { status: newStatus });
            toast.success('Status berhasil diperbarui');
            fetchReports();
            if (selectedReport?._id === reportId) {
                setSelectedReport(prev => ({ ...prev, status: newStatus }));
            }
        } catch {
            toast.error('Gagal mengubah status');
        }
    };

    const handleResolve = async () => {
        if (!resolution.trim()) {
            toast.error('Resolusi wajib diisi');
            return;
        }
        setResolving(true);
        try {
            await reportService.resolveReport(selectedReport._id, resolution);
            toast.success('Laporan berhasil diselesaikan');
            setSelectedReport(null);
            setResolution('');
            fetchReports();
            fetchStats();
        } catch {
            toast.error('Gagal menyelesaikan laporan');
        } finally {
            setResolving(false);
        }
    };

    const handleBanUser = async (userId, userName) => {
        if (!confirm(`Yakin ingin ban ${userName}?`)) return;
        setBanning(true);
        try {
            await api.put(`/admin/users/${userId}/ban`, { reportId: selectedReport._id });
            toast.success(`${userName} berhasil dibanned`);
            fetchReports();
            fetchStats();
            setSelectedReport(prev => ({
                ...prev,
                targetUser: prev.targetUser?._id === userId ? { ...prev.targetUser, isBanned: true } : prev.targetUser,
                targetProduct: prev.targetProduct?.penjual?._id === userId ? { ...prev.targetProduct, penjual: { ...prev.targetProduct.penjual, isBanned: true } } : prev.targetProduct
            }));
        } catch (error) {
            toast.error(error.response?.data?.message || 'Gagal ban user');
        } finally {
            setBanning(false);
        }
    };

    const formatDate = (date) => new Date(date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

    return (
        <div className="p-6 md:p-8 space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white">
                        Laporan & Tiket
                    </h1>
                    <p className="text-sm text-[#606e8a] mt-1">Kelola laporan dan tiket support dari pengguna</p>
                </div>
                <button onClick={() => { fetchReports(); fetchStats(); }} className="flex items-center gap-2 px-4 py-2 bg-[#2d3748] hover:bg-[#374151] text-white rounded-lg text-sm font-medium transition-colors">
                    <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                    Refresh
                </button>
            </div>

            {/* Stats */}
            {stats && (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-[#1a2332] p-5 rounded-xl border border-[#2d3748] relative overflow-hidden group hover:shadow-lg transition-shadow">
                        <p className="text-sm font-medium text-[#606e8a]">Terbuka</p>
                        <h3 className="text-2xl font-bold text-white mt-1">{stats.byStatus?.open || 0}</h3>
                        {(stats.byStatus?.open || 0) > 0 && <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full mt-1 inline-block">Perlu Aksi</span>}
                    </div>
                    <div className="bg-[#1a2332] p-5 rounded-xl border border-[#2d3748] relative overflow-hidden group hover:shadow-lg transition-shadow">
                        <p className="text-sm font-medium text-[#606e8a]">Diproses</p>
                        <h3 className="text-2xl font-bold text-white mt-1">{stats.byStatus?.in_progress || 0}</h3>
                    </div>
                    <div className="bg-[#1a2332] p-5 rounded-xl border border-[#2d3748] relative overflow-hidden group hover:shadow-lg transition-shadow">
                        <p className="text-sm font-medium text-[#606e8a]">Selesai</p>
                        <h3 className="text-2xl font-bold text-white mt-1">{stats.byStatus?.resolved || 0}</h3>
                    </div>
                    <div className="bg-[#1a2332] p-5 rounded-xl border border-[#2d3748] relative overflow-hidden group hover:shadow-lg transition-shadow">
                        <p className="text-sm font-medium text-[#606e8a]">Prioritas Tinggi</p>
                        <h3 className="text-2xl font-bold text-white mt-1">{(stats.byPriority?.high || 0) + (stats.byPriority?.urgent || 0)}</h3>
                    </div>
                </div>
            )}

            {/* Filters */}
            <div className="bg-[#1a2332] rounded-xl p-4 border border-[#2d3748]">
                <div className="flex flex-wrap gap-3">
                    <div className="relative flex-1 min-w-[200px]">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#606e8a]" />
                        <input
                            type="text"
                            placeholder="Cari ticket..."
                            value={filters.search}
                            onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                            className="w-full pl-10 pr-4 py-2.5 bg-[#0f1520] border border-[#2d3748] rounded-lg text-sm text-white placeholder-[#606e8a] focus:ring-2 focus:ring-primary"
                        />
                    </div>
                    <select value={filters.status} onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))} className="px-4 py-2.5 bg-[#0f1520] border border-[#2d3748] rounded-lg text-sm text-white focus:ring-2 focus:ring-primary">
                        <option value="">Semua Status</option>
                        <option value="open">Terbuka</option>
                        <option value="in_progress">Diproses</option>
                        <option value="resolved">Selesai</option>
                        <option value="closed">Ditutup</option>
                    </select>
                    <select value={filters.type} onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))} className="px-4 py-2.5 bg-[#0f1520] border border-[#2d3748] rounded-lg text-sm text-white focus:ring-2 focus:ring-primary">
                        <option value="">Semua Tipe</option>
                        <option value="product">Produk</option>
                        <option value="user">Pengguna</option>
                        <option value="general">Umum</option>
                    </select>
                    <select value={filters.priority} onChange={(e) => setFilters(prev => ({ ...prev, priority: e.target.value }))} className="px-4 py-2.5 bg-[#0f1520] border border-[#2d3748] rounded-lg text-sm text-white focus:ring-2 focus:ring-primary">
                        <option value="">Semua Prioritas</option>
                        <option value="urgent">Mendesak</option>
                        <option value="high">Tinggi</option>
                        <option value="medium">Sedang</option>
                        <option value="low">Rendah</option>
                    </select>
                </div>
            </div>

            {/* Reports Table */}
            <div className="bg-[#1a2332] rounded-xl border border-[#2d3748] overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-[#0f1520] text-xs uppercase text-[#606e8a] font-semibold tracking-wider">
                            <tr>
                                <th className="text-left py-4 px-4">Ticket</th>
                                <th className="text-left py-4 px-4">Pelapor</th>
                                <th className="text-left py-4 px-4">Tipe</th>
                                <th className="text-left py-4 px-4">Kategori</th>
                                <th className="text-left py-4 px-4">Status</th>
                                <th className="text-left py-4 px-4">Prioritas</th>
                                <th className="text-left py-4 px-4">Tanggal</th>
                                <th className="text-left py-4 px-4">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#2d3748]">
                            {loading ? (
                                <tr><td colSpan="8" className="py-12 text-center"><RefreshCw className="w-8 h-8 text-primary animate-spin mx-auto" /></td></tr>
                            ) : reports.length === 0 ? (
                                <tr><td colSpan="8" className="py-12 text-center text-[#606e8a]">Tidak ada laporan</td></tr>
                            ) : (
                                reports.map((report) => {
                                    const status = statusConfig[report.status] || statusConfig.open;
                                    const priority = priorityConfig[report.priority] || priorityConfig.medium;
                                    const type = typeConfig[report.type] || typeConfig.general;
                                    const TypeIcon = type.icon;
                                    return (
                                        <tr key={report._id} className="hover:bg-[#0f1520] transition-colors">
                                            <td className="py-3 px-4">
                                                <p className="font-mono text-sm font-semibold text-primary">{report.ticketNumber}</p>
                                                <p className="text-sm text-white truncate max-w-[200px]">{report.subject}</p>
                                            </td>
                                            <td className="py-3 px-4">
                                                <div className="flex items-center gap-2">
                                                    {report.reporter?.avatar ? (
                                                        <img src={report.reporter.avatar} alt="" className="w-8 h-8 rounded-full object-cover" />
                                                    ) : (
                                                        <div className="w-8 h-8 rounded-full bg-[#2d3748] flex items-center justify-center text-xs font-bold text-white">
                                                            {report.reporter?.nama?.charAt(0) || '?'}
                                                        </div>
                                                    )}
                                                    <span className="text-sm text-white">{report.reporter?.nama || 'Unknown'}</span>
                                                </div>
                                            </td>
                                            <td className="py-3 px-4">
                                                <span className="flex items-center gap-1 text-sm text-white">
                                                    <TypeIcon className="w-4 h-4 text-[#606e8a]" />
                                                    {type.label}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4 text-sm text-white">{categoryLabels[report.category] || report.category}</td>
                                            <td className="py-3 px-4">
                                                <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${status.color}`}>
                                                    {status.label}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4">
                                                <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${priority.color}`}>
                                                    {priority.label}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4 text-sm text-[#606e8a]">{formatDate(report.createdAt)}</td>
                                            <td className="py-3 px-4">
                                                <button onClick={() => setSelectedReport(report)} className="p-2 rounded-lg hover:bg-primary/20 text-primary transition-colors">
                                                    <Eye className="w-4 h-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Report Detail Modal */}
            {selectedReport && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60" onClick={() => setSelectedReport(null)} />
                    <div className="relative bg-[#1a2332] rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-[#2d3748]">
                        <div className="sticky top-0 bg-[#1a2332] border-b border-[#2d3748] px-6 py-4 flex items-center justify-between">
                            <div>
                                <p className="font-mono text-sm text-primary">{selectedReport.ticketNumber}</p>
                                <h2 className="text-lg font-bold text-white">{selectedReport.subject}</h2>
                            </div>
                            <button onClick={() => setSelectedReport(null)} className="p-2 hover:bg-[#2d3748] rounded-lg text-[#606e8a]">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-6 space-y-6">
                            {/* Meta */}
                            <div className="flex flex-wrap gap-2">
                                <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusConfig[selectedReport.status]?.color || ''}`}>
                                    {statusConfig[selectedReport.status]?.label || selectedReport.status}
                                </span>
                                <span className={`px-3 py-1 rounded-full text-sm font-medium ${priorityConfig[selectedReport.priority]?.color || ''}`}>
                                    {priorityConfig[selectedReport.priority]?.label || selectedReport.priority}
                                </span>
                                <span className="px-3 py-1 rounded-full text-sm font-medium bg-[#2d3748] text-[#606e8a]">
                                    {typeConfig[selectedReport.type]?.label || selectedReport.type}
                                </span>
                                <span className="px-3 py-1 rounded-full text-sm font-medium bg-[#2d3748] text-[#606e8a]">
                                    {categoryLabels[selectedReport.category]}
                                </span>
                            </div>

                            {/* Reporter */}
                            <div className="flex items-center gap-3 p-4 bg-[#0f1520] rounded-xl">
                                {selectedReport.reporter?.avatar ? (
                                    <img src={selectedReport.reporter.avatar} alt="" className="w-12 h-12 rounded-full object-cover" />
                                ) : (
                                    <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                                        {selectedReport.reporter?.nama?.charAt(0) || '?'}
                                    </div>
                                )}
                                <div>
                                    <p className="font-semibold text-white">{selectedReport.reporter?.nama}</p>
                                    <p className="text-sm text-[#606e8a]">{selectedReport.reporter?.email}</p>
                                </div>
                            </div>

                            {/* Target Product */}
                            {selectedReport.targetProduct && (
                                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
                                    <p className="text-sm font-medium text-red-400 mb-2">Produk yang Dilaporkan:</p>
                                    <div className="flex items-center gap-3">
                                        <img src={selectedReport.targetProduct.gambar} alt="" className="w-12 h-12 rounded-lg object-cover" />
                                        <div className="flex-1">
                                            <p className="font-semibold text-white">{selectedReport.targetProduct.namaBarang}</p>
                                            {selectedReport.targetProduct.penjual && (
                                                <p className="text-sm text-[#606e8a]">Penjual: {selectedReport.targetProduct.penjual.nama}</p>
                                            )}
                                        </div>
                                        {selectedReport.targetProduct.penjual && !selectedReport.targetProduct.penjual.isBanned && selectedReport.status !== 'resolved' && selectedReport.status !== 'closed' && (
                                            <button onClick={() => handleBanUser(selectedReport.targetProduct.penjual._id, selectedReport.targetProduct.penjual.nama)} disabled={banning} className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg disabled:opacity-50 flex items-center gap-1">
                                                <Ban className="w-4 h-4" />
                                                {banning ? '...' : 'Ban'}
                                            </button>
                                        )}
                                        {selectedReport.targetProduct.penjual?.isBanned && (
                                            <span className="px-3 py-1.5 bg-red-500/20 text-red-400 text-sm font-medium rounded-lg">Dibanned</span>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Target User */}
                            {selectedReport.targetUser && (
                                <div className="p-4 bg-orange-500/10 border border-orange-500/20 rounded-xl">
                                    <p className="text-sm font-medium text-orange-400 mb-2">Pengguna yang Dilaporkan:</p>
                                    <div className="flex items-center gap-3">
                                        {selectedReport.targetUser.avatar ? (
                                            <img src={selectedReport.targetUser.avatar} alt="" className="w-12 h-12 rounded-full object-cover" />
                                        ) : (
                                            <div className="w-12 h-12 rounded-full bg-orange-500/20 flex items-center justify-center text-orange-400 font-bold">
                                                {selectedReport.targetUser.nama?.charAt(0) || '?'}
                                            </div>
                                        )}
                                        <div className="flex-1">
                                            <p className="font-semibold text-white">{selectedReport.targetUser.nama}</p>
                                            <p className="text-sm text-[#606e8a]">{selectedReport.targetUser.email}</p>
                                        </div>
                                        {!selectedReport.targetUser.isBanned && selectedReport.status !== 'resolved' && selectedReport.status !== 'closed' && (
                                            <button onClick={() => handleBanUser(selectedReport.targetUser._id, selectedReport.targetUser.nama)} disabled={banning} className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg disabled:opacity-50 flex items-center gap-1">
                                                <Ban className="w-4 h-4" />
                                                {banning ? '...' : 'Ban'}
                                            </button>
                                        )}
                                        {selectedReport.targetUser.isBanned && (
                                            <span className="px-3 py-1.5 bg-red-500/20 text-red-400 text-sm font-medium rounded-lg">Dibanned</span>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Description */}
                            <div>
                                <h3 className="font-semibold text-white mb-2">Deskripsi</h3>
                                <p className="text-[#606e8a] whitespace-pre-line">{selectedReport.description}</p>
                            </div>

                            {/* Evidence */}
                            {selectedReport.evidence?.length > 0 && (
                                <div>
                                    <h3 className="font-semibold text-white mb-2">Bukti</h3>
                                    <div className="grid grid-cols-3 gap-3">
                                        {selectedReport.evidence.map((img, idx) => (
                                            <a key={idx} href={img} target="_blank" rel="noopener noreferrer">
                                                <img src={img} alt="" className="aspect-square rounded-lg object-cover border border-[#2d3748]" />
                                            </a>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Resolution */}
                            {selectedReport.resolution && (
                                <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-xl">
                                    <h3 className="font-semibold text-green-400 mb-2">Resolusi</h3>
                                    <p className="text-[#606e8a]">{selectedReport.resolution}</p>
                                    <p className="text-sm text-[#606e8a] mt-2">
                                        Diselesaikan oleh {selectedReport.resolvedBy?.nama} pada {formatDate(selectedReport.resolvedAt)}
                                    </p>
                                </div>
                            )}

                            {/* Actions */}
                            {selectedReport.status !== 'resolved' && selectedReport.status !== 'closed' && (
                                <div className="space-y-4 pt-4 border-t border-[#2d3748]">
                                    <div className="flex gap-2">
                                        {selectedReport.status === 'open' && (
                                            <button onClick={() => handleStatusChange(selectedReport._id, 'in_progress')} className="flex-1 bg-amber-600 hover:bg-amber-700 text-white py-2 rounded-lg font-medium">
                                                Tandai Diproses
                                            </button>
                                        )}
                                        <button onClick={() => handleStatusChange(selectedReport._id, 'closed')} className="flex-1 bg-[#2d3748] hover:bg-[#374151] text-white py-2 rounded-lg font-medium">
                                            Tutup Tiket
                                        </button>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-[#606e8a] mb-1.5">Resolusi</label>
                                        <textarea
                                            value={resolution}
                                            onChange={(e) => setResolution(e.target.value)}
                                            className="w-full rounded-lg border border-[#2d3748] bg-[#0f1520] py-2 px-3 text-sm text-white resize-none focus:ring-2 focus:ring-primary"
                                            rows={3}
                                            placeholder="Tuliskan resolusi..."
                                        />
                                        <button onClick={handleResolve} disabled={resolving} className="mt-2 w-full bg-green-600 hover:bg-green-700 text-white py-2.5 rounded-lg font-medium disabled:opacity-50">
                                            {resolving ? 'Menyimpan...' : 'Selesaikan Laporan'}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default AdminReportsPage;
