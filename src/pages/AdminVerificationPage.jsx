import { useState, useEffect } from 'react';
import {
    ShieldCheck, RefreshCw, Check, X, Phone, Image, Calendar,
    ExternalLink, AlertCircle, CheckCircle, Clock, User, Mail, GraduationCap
} from 'lucide-react';
import api from '../services/api';

function AdminVerificationPage() {
    const [verifications, setVerifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [processing, setProcessing] = useState(null);
    const [previewImage, setPreviewImage] = useState(null);
    const [rejectModal, setRejectModal] = useState({ show: false, id: null, name: '' });
    const [rejectReason, setRejectReason] = useState('');
    const [stats, setStats] = useState({ approvedToday: 0, rejectedMonth: 0 });

    useEffect(() => {
        fetchVerifications();
    }, []);

    const fetchVerifications = async () => {
        try {
            setLoading(true);
            const response = await api.get('/admin/verifications');
            setVerifications(response.data.data);
            if (response.data.stats) {
                setStats(response.data.stats);
            }
        } catch (err) {
            setError('Gagal mengambil data verifikasi');
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (id, name) => {
        if (!confirm(`Setujui ${name} sebagai Penjual?`)) return;
        setProcessing(id);
        try {
            await api.post(`/admin/verifications/${id}/approve`);
            setVerifications(verifications.filter(v => v._id !== id));
        } catch (err) {
            alert('Gagal memverifikasi user');
        } finally {
            setProcessing(null);
        }
    };

    const handleReject = async () => {
        if (!rejectReason.trim()) {
            alert('Mohon isi alasan penolakan');
            return;
        }
        setProcessing(rejectModal.id);
        try {
            await api.post(`/admin/verifications/${rejectModal.id}/reject`, { reason: rejectReason });
            setVerifications(verifications.filter(v => v._id !== rejectModal.id));
            setRejectModal({ show: false, id: null, name: '' });
            setRejectReason('');
        } catch (err) {
            alert('Gagal menolak user');
        } finally {
            setProcessing(null);
        }
    };

    if (loading && verifications.length === 0) {
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
                        Verifikasi Penjual
                    </h1>
                    <p className="text-sm text-[#606e8a] mt-1">
                        {verifications.length} pengajuan menunggu verifikasi
                    </p>
                </div>
                <button
                    onClick={fetchVerifications}
                    disabled={loading}
                    className="flex items-center gap-2 px-4 py-2 bg-[#2d3748] hover:bg-[#374151] text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                >
                    <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                    Refresh
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-[#1a2332] p-5 rounded-xl border border-[#2d3748] relative overflow-hidden group hover:shadow-lg transition-shadow">
                    <p className="text-sm font-medium text-[#606e8a]">Menunggu</p>
                    <h3 className="text-2xl font-bold text-white mt-1">{verifications.length}</h3>
                    {verifications.length > 0 && (
                        <span className="text-xs bg-yellow-500/20 text-yellow-400 px-2 py-0.5 rounded-full mt-1 inline-block">Perlu Review</span>
                    )}
                </div>
                <div className="bg-[#1a2332] p-5 rounded-xl border border-[#2d3748] relative overflow-hidden group hover:shadow-lg transition-shadow">
                    <p className="text-sm font-medium text-[#606e8a]">Hari Ini</p>
                    <h3 className="text-2xl font-bold text-white mt-1">{loading ? '-' : (stats.approvedToday || 0)}</h3>
                    <span className="text-xs text-[#606e8a]">Disetujui</span>
                </div>
                <div className="bg-[#1a2332] p-5 rounded-xl border border-[#2d3748] relative overflow-hidden group hover:shadow-lg transition-shadow">
                    <p className="text-sm font-medium text-[#606e8a]">Ditolak</p>
                    <h3 className="text-2xl font-bold text-white mt-1">{loading ? '-' : (stats.rejectedMonth || 0)}</h3>
                    <span className="text-xs text-[#606e8a]">Bulan ini</span>
                </div>
            </div>

            {error && (
                <div className="bg-red-500/20 border border-red-500/30 text-red-400 p-4 rounded-xl flex items-center gap-3">
                    <AlertCircle className="w-5 h-5" />
                    {error}
                </div>
            )}

            {verifications.length === 0 && !loading ? (
                <div className="bg-[#1a2332] rounded-xl border border-[#2d3748] p-12 text-center">
                    <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CheckCircle className="w-8 h-8 text-emerald-400" />
                    </div>
                    <h3 className="text-lg font-bold text-white">Tidak ada pengajuan pending</h3>
                    <p className="text-[#606e8a] mt-1">Semua verifikasi telah diproses.</p>
                </div>
            ) : (
                <div className="bg-[#1a2332] rounded-xl border border-[#2d3748] overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-[#0f1520] text-xs uppercase text-[#606e8a] font-semibold tracking-wider">
                                <tr>
                                    <th className="px-6 py-4">User</th>
                                    <th className="px-6 py-4">NIM & Fakultas</th>
                                    <th className="px-6 py-4">WhatsApp</th>
                                    <th className="px-6 py-4">Foto KTM</th>
                                    <th className="px-6 py-4">Diajukan</th>
                                    <th className="px-6 py-4 text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="text-sm divide-y divide-[#2d3748]">
                                {verifications.map((userData) => (
                                    <tr key={userData._id} className="hover:bg-[#0f1520] transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                {userData.avatar ? (
                                                    <img src={userData.avatar} alt="" className="w-10 h-10 rounded-full object-cover" referrerPolicy="no-referrer" />
                                                ) : (
                                                    <div className="w-10 h-10 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold">
                                                        {userData.nama?.charAt(0)}
                                                    </div>
                                                )}
                                                <div>
                                                    <p className="font-semibold text-white">{userData.nama}</p>
                                                    <p className="text-xs text-[#606e8a] flex items-center gap-1">
                                                        <Mail className="w-3 h-3" />
                                                        {userData.email}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="font-mono text-white">{userData.nim}</p>
                                            <p className="text-xs text-[#606e8a] flex items-center gap-1">
                                                <GraduationCap className="w-3 h-3" />
                                                {userData.fakultas}
                                            </p>
                                        </td>
                                        <td className="px-6 py-4">
                                            {userData.whatsapp ? (
                                                <a
                                                    href={`https://wa.me/${userData.whatsapp}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center gap-1.5 text-green-400 hover:text-green-300 text-sm"
                                                >
                                                    <Phone className="w-4 h-4" />
                                                    +{userData.whatsapp}
                                                </a>
                                            ) : (
                                                <span className="text-[#606e8a]">-</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            {userData.verification?.ktmImage ? (
                                                <button
                                                    onClick={() => setPreviewImage(userData.verification.ktmImage)}
                                                    className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-colors text-xs font-semibold"
                                                >
                                                    <Image className="w-4 h-4" />
                                                    Lihat KTM
                                                </button>
                                            ) : (
                                                <span className="text-[#606e8a] italic text-xs">Tidak ada</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-[#606e8a]">
                                            <div className="flex items-center gap-1">
                                                <Calendar className="w-3 h-3" />
                                                {userData.verification?.submittedAt
                                                    ? new Date(userData.verification.submittedAt).toLocaleDateString('id-ID')
                                                    : '-'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    onClick={() => { setRejectModal({ show: true, id: userData._id, name: userData.nama }); setRejectReason(''); }}
                                                    disabled={processing === userData._id}
                                                    className="p-2 rounded-lg hover:bg-red-500/20 text-red-400 transition-colors disabled:opacity-50"
                                                    title="Tolak"
                                                >
                                                    <X className="w-5 h-5" />
                                                </button>
                                                <button
                                                    onClick={() => handleApprove(userData._id, userData.nama)}
                                                    disabled={processing === userData._id}
                                                    className="p-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white transition-colors disabled:opacity-50"
                                                    title="Setujui"
                                                >
                                                    {processing === userData._id ? (
                                                        <RefreshCw className="w-5 h-5 animate-spin" />
                                                    ) : (
                                                        <Check className="w-5 h-5" />
                                                    )}
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Image Preview Modal */}
            {previewImage && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onClick={() => setPreviewImage(null)}>
                    <div className="relative max-w-3xl max-h-[90vh] bg-[#1a2332] rounded-xl overflow-hidden border border-[#2d3748]" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-between px-4 py-3 border-b border-[#2d3748]">
                            <h3 className="font-semibold text-white">Foto KTM</h3>
                            <button onClick={() => setPreviewImage(null)} className="p-1 rounded-lg hover:bg-[#2d3748] transition-colors text-[#606e8a]">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="p-4">
                            <img src={previewImage} alt="KTM Preview" className="max-w-full max-h-[70vh] object-contain mx-auto rounded-lg" />
                        </div>
                        <div className="px-4 py-3 border-t border-[#2d3748] flex justify-end">
                            <a
                                href={previewImage}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
                            >
                                <ExternalLink className="w-4 h-4" />
                                Buka Tab Baru
                            </a>
                        </div>
                    </div>
                </div>
            )}

            {/* Reject Modal */}
            {rejectModal.show && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
                    <div className="bg-[#1a2332] rounded-xl p-6 w-full max-w-md border border-[#2d3748]">
                        <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-red-500/20 rounded-full">
                            <X className="w-8 h-8 text-red-400" />
                        </div>
                        <h3 className="text-lg font-bold text-white text-center mb-2">Tolak Verifikasi</h3>
                        <p className="text-sm text-[#606e8a] text-center mb-4">
                            Tolak pengajuan dari "<span className="text-white font-medium">{rejectModal.name}</span>"?
                        </p>
                        <textarea
                            value={rejectReason}
                            onChange={(e) => setRejectReason(e.target.value)}
                            placeholder="Alasan penolakan..."
                            className="w-full h-24 px-3 py-2 border border-[#2d3748] rounded-lg bg-[#0f1520] text-white resize-none focus:ring-2 focus:ring-primary"
                        />
                        <div className="flex gap-3 mt-4">
                            <button onClick={() => setRejectModal({ show: false, id: null, name: '' })} className="flex-1 px-4 py-2 rounded-lg border border-[#2d3748] text-[#606e8a] hover:bg-[#2d3748] transition-colors">
                                Batal
                            </button>
                            <button onClick={handleReject} disabled={processing === rejectModal.id} className="flex-1 px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors disabled:opacity-50">
                                {processing === rejectModal.id ? 'Memproses...' : 'Tolak'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default AdminVerificationPage;
