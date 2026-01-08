import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
    Plus, Inbox, CheckCircle, Clock, XCircle, ChevronRight, X, Package, User,
    HelpCircle, Search, Loader2, ImagePlus, Trash2, Send, AlertCircle
} from 'lucide-react';
import reportService from '../services/reportService';
import productService from '../services/productService';
import { useToast } from './ToastProvider';

const statusConfig = {
    open: { bg: 'bg-amber-50', text: 'text-amber-700', label: 'Menunggu Ditinjau' },
    in_progress: { bg: 'bg-blue-50', text: 'text-blue-700', label: 'Sedang Diproses' },
    resolved: { bg: 'bg-green-50', text: 'text-green-700', label: 'Selesai' },
    closed: { bg: 'bg-slate-100', text: 'text-slate-600', label: 'Ditutup' },
};

const categoryLabels = {
    penipuan: 'Penipuan',
    produk_palsu: 'Produk Palsu',
    konten_tidak_pantas: 'Konten Tidak Pantas',
    harga_tidak_wajar: 'Harga Tidak Wajar',
    spam: 'Spam',
    pelecehan: 'Pelecehan',
    akun_palsu: 'Akun Palsu',
    bug_sistem: 'Bug Sistem',
    saran: 'Saran',
    pertanyaan: 'Pertanyaan',
    lainnya: 'Lainnya',
};

const reportTypes = [
    {
        value: 'product',
        label: 'Produk',
        desc: 'Laporkan produk bermasalah',
        icon: Package,
        categories: [
            { value: 'penipuan', label: 'Penipuan' },
            { value: 'produk_palsu', label: 'Produk Palsu / Tidak Sesuai' },
            { value: 'konten_tidak_pantas', label: 'Konten Tidak Pantas' },
            { value: 'harga_tidak_wajar', label: 'Harga Tidak Wajar' },
            { value: 'spam', label: 'Spam / Iklan Berlebihan' },
            { value: 'lainnya', label: 'Lainnya' },
        ]
    },
    {
        value: 'user',
        label: 'Pengguna',
        desc: 'Laporkan pengguna bermasalah',
        icon: User,
        categories: [
            { value: 'penipuan', label: 'Penipuan' },
            { value: 'pelecehan', label: 'Pelecehan' },
            { value: 'akun_palsu', label: 'Akun Palsu' },
            { value: 'spam', label: 'Spam' },
            { value: 'lainnya', label: 'Lainnya' },
        ]
    },
    {
        value: 'general',
        label: 'Umum',
        desc: 'Saran, pertanyaan, atau bug',
        icon: HelpCircle,
        categories: [
            { value: 'bug_sistem', label: 'Bug / Error Sistem' },
            { value: 'saran', label: 'Saran & Masukan' },
            { value: 'pertanyaan', label: 'Pertanyaan' },
            { value: 'lainnya', label: 'Lainnya' },
        ]
    },
];

function ReportsTab() {
    const toast = useToast();
    const [searchParams, setSearchParams] = useSearchParams();
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedReport, setSelectedReport] = useState(null);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    // Form state
    const [formType, setFormType] = useState('general');
    const [formCategory, setFormCategory] = useState('');
    const [formSubject, setFormSubject] = useState('');
    const [formDescription, setFormDescription] = useState('');
    const [formEvidence, setFormEvidence] = useState([]);
    const [productLink, setProductLink] = useState('');
    const [targetProduct, setTargetProduct] = useState(null);
    const [productLoading, setProductLoading] = useState(false);

    const fetchReports = async () => {
        try {
            setLoading(true);
            const response = await reportService.getMyReports();
            setReports(response.data || []);
        } catch (error) {
            console.error('Failed to fetch reports:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReports();
    }, []);

    // Handle URL params for product report
    useEffect(() => {
        const productId = searchParams.get('productId');
        const type = searchParams.get('type');

        if (productId && type === 'product') {
            fetchProductById(productId);
            setFormType('product');
            setShowCreateModal(true);
            setSearchParams({});
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchParams]);

    const fetchProductById = async (productId) => {
        setProductLoading(true);
        try {
            const response = await productService.getProduct(productId);
            setTargetProduct(response.data);
        } catch {
            toast.error('Gagal memuat data produk');
        } finally {
            setProductLoading(false);
        }
    };

    const extractProductId = (input) => {
        const urlMatch = input.match(/\/produk\/([a-f0-9]{24})/i);
        if (urlMatch) return urlMatch[1];
        const idMatch = input.match(/^[a-f0-9]{24}$/i);
        if (idMatch) return idMatch[0];
        return null;
    };

    const handleProductSearch = async () => {
        const productId = extractProductId(productLink.trim());
        if (!productId) {
            toast.error('Link produk tidak valid');
            return;
        }

        setProductLoading(true);
        try {
            const response = await productService.getProduct(productId);
            setTargetProduct(response.data);
        } catch {
            toast.error('Produk tidak ditemukan');
            setTargetProduct(null);
        } finally {
            setProductLoading(false);
        }
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
        });
    };

    const resetForm = () => {
        setFormType('general');
        setFormCategory('');
        setFormSubject('');
        setFormDescription('');
        setFormEvidence([]);
        setProductLink('');
        setTargetProduct(null);
    };

    const handleOpenCreate = () => {
        resetForm();
        setShowCreateModal(true);
    };

    const handleCloseCreate = () => {
        setShowCreateModal(false);
        resetForm();
    };

    const handleTypeChange = (type) => {
        setFormType(type);
        setFormCategory('');
        if (type !== 'product') {
            setTargetProduct(null);
            setProductLink('');
        }
    };

    const handleImageUpload = (e) => {
        const files = Array.from(e.target.files);
        if (files.length + formEvidence.length > 3) {
            toast.error('Maksimal 3 gambar');
            return;
        }

        files.forEach(file => {
            const reader = new FileReader();
            reader.onload = (ev) => {
                setFormEvidence(prev => [...prev, ev.target.result]);
            };
            reader.readAsDataURL(file);
        });
    };

    const removeImage = (index) => {
        setFormEvidence(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (formType === 'product' && !targetProduct) {
            toast.error('Pilih produk yang ingin dilaporkan');
            return;
        }
        if (!formCategory) {
            toast.error('Pilih kategori masalah');
            return;
        }
        if (!formSubject.trim()) {
            toast.error('Judul laporan wajib diisi');
            return;
        }
        if (!formDescription.trim()) {
            toast.error('Deskripsi wajib diisi');
            return;
        }

        setSubmitting(true);
        try {
            await reportService.createReport({
                type: formType,
                targetProductId: targetProduct?._id || '',
                category: formCategory,
                subject: formSubject,
                description: formDescription,
                evidence: formEvidence,
            });
            toast.success('Laporan berhasil dikirim!');
            handleCloseCreate();
            fetchReports();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Gagal mengirim laporan');
        } finally {
            setSubmitting(false);
        }
    };

    const currentTypeConfig = reportTypes.find(t => t.value === formType);

    if (loading) {
        return (
            <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="bg-white rounded-xl border border-slate-200 p-5 animate-pulse">
                        <div className="flex gap-4">
                            <div className="size-10 bg-slate-200 rounded-full"></div>
                            <div className="flex-1 space-y-2">
                                <div className="h-4 bg-slate-200 rounded w-24"></div>
                                <div className="h-5 bg-slate-200 rounded w-3/4"></div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-start justify-between gap-4">
                <div>
                    <h2 className="text-xl font-bold text-slate-900">Pusat Bantuan</h2>
                    <p className="text-sm text-slate-500 mt-1">Laporkan masalah atau sampaikan saran untuk LapaKNesa</p>
                </div>
                <button
                    onClick={handleOpenCreate}
                    className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2.5 rounded-xl font-medium text-sm transition-colors shrink-0"
                >
                    <Plus className="w-5 h-5" />
                    Buat Laporan
                </button>
            </div>

            {/* Reports List */}
            {reports.length === 0 ? (
                <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
                    <div className="size-16 mx-auto mb-4 bg-slate-100 rounded-full flex items-center justify-center">
                        <Inbox className="w-8 h-8 text-slate-400" />
                    </div>
                    <h3 className="font-semibold text-slate-900 mb-1">Belum Ada Laporan</h3>
                    <p className="text-slate-500 text-sm mb-6">Kamu belum pernah mengirim laporan apapun</p>
                    <button
                        onClick={handleOpenCreate}
                        className="inline-flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-5 py-2.5 rounded-xl font-medium text-sm"
                    >
                        Buat Laporan Pertama
                    </button>
                </div>
            ) : (
                <div className="space-y-3">
                    {reports.map((report) => {
                        const status = statusConfig[report.status] || statusConfig.open;
                        return (
                            <div
                                key={report._id}
                                className="bg-white rounded-xl border border-slate-200 p-4 hover:border-slate-300 transition-colors cursor-pointer"
                                onClick={() => setSelectedReport(report)}
                            >
                                <div className="flex items-start gap-4">
                                    <div className={`size-10 rounded-full flex items-center justify-center shrink-0 ${status.bg}`}>
                                        {report.status === 'resolved' ? <CheckCircle className={`w-5 h-5 ${status.text}`} /> :
                                            report.status === 'in_progress' ? <Clock className={`w-5 h-5 ${status.text}`} /> :
                                                report.status === 'closed' ? <XCircle className={`w-5 h-5 ${status.text}`} /> :
                                                    <Clock className={`w-5 h-5 ${status.text}`} />}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${status.bg} ${status.text}`}>
                                                {status.label}
                                            </span>
                                            <span className="text-xs text-slate-400">•</span>
                                            <span className="text-xs text-slate-500">{report.ticketNumber}</span>
                                        </div>
                                        <h3 className="font-medium text-slate-900 mb-0.5 line-clamp-1">{report.subject}</h3>
                                        <p className="text-sm text-slate-500 line-clamp-1">{report.description}</p>
                                        <p className="text-xs text-slate-400 mt-2">{formatDate(report.createdAt)}</p>
                                    </div>
                                    <ChevronRight className="w-5 h-5 text-slate-300 shrink-0" />
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Report Detail Modal */}
            {selectedReport && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/50" onClick={() => setSelectedReport(null)} />
                    <div className="relative bg-white rounded-2xl max-w-lg w-full max-h-[85vh] overflow-y-auto">
                        <div className="sticky top-0 bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between">
                            <div>
                                <span className="text-xs text-slate-400 font-mono">{selectedReport.ticketNumber}</span>
                                <h2 className="text-lg font-bold text-slate-900 mt-0.5">{selectedReport.subject}</h2>
                            </div>
                            <button onClick={() => setSelectedReport(null)} className="p-2 hover:bg-slate-100 rounded-lg">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-6 space-y-5">
                            {/* Status & Meta */}
                            <div className="flex flex-wrap gap-2">
                                <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusConfig[selectedReport.status]?.bg} ${statusConfig[selectedReport.status]?.text}`}>
                                    {statusConfig[selectedReport.status]?.label}
                                </span>
                                <span className="px-3 py-1 rounded-full text-sm bg-slate-100 text-slate-600 capitalize">
                                    {selectedReport.type === 'product' ? 'Produk' : selectedReport.type === 'user' ? 'Pengguna' : 'Umum'}
                                </span>
                                <span className="px-3 py-1 rounded-full text-sm bg-slate-100 text-slate-600">
                                    {categoryLabels[selectedReport.category]}
                                </span>
                            </div>

                            {/* Target Product */}
                            {selectedReport.targetProduct && (
                                <div className="p-4 bg-slate-50 rounded-xl">
                                    <p className="text-xs text-slate-500 mb-2">Produk yang dilaporkan:</p>
                                    <div className="flex items-center gap-3">
                                        <img
                                            src={selectedReport.targetProduct.gambar?.[0] || selectedReport.targetProduct.gambar}
                                            alt=""
                                            className="size-12 rounded-lg object-cover"
                                        />
                                        <div>
                                            <p className="font-medium text-slate-900">{selectedReport.targetProduct.namaBarang}</p>
                                            <p className="text-sm text-slate-500">oleh {selectedReport.targetProduct.penjual?.nama}</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Description */}
                            <div>
                                <h3 className="text-sm font-medium text-slate-700 mb-2">Deskripsi Masalah</h3>
                                <p className="text-slate-600 whitespace-pre-line text-sm leading-relaxed">{selectedReport.description}</p>
                            </div>

                            {/* Evidence */}
                            {selectedReport.evidence?.length > 0 && (
                                <div>
                                    <h3 className="text-sm font-medium text-slate-700 mb-2">Bukti Pendukung</h3>
                                    <div className="grid grid-cols-3 gap-2">
                                        {selectedReport.evidence.map((img, idx) => (
                                            <a key={idx} href={img} target="_blank" rel="noopener noreferrer" className="block">
                                                <img src={img} alt="" className="aspect-square rounded-lg object-cover border border-slate-200" />
                                            </a>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Admin Resolution */}
                            {selectedReport.resolution && (
                                <div className="p-4 bg-green-50 border border-green-100 rounded-xl">
                                    <h3 className="font-medium text-green-700 mb-2 flex items-center gap-2">
                                        <CheckCircle className="w-5 h-5" />
                                        Tanggapan Admin
                                    </h3>
                                    <p className="text-slate-700 text-sm">{selectedReport.resolution}</p>
                                    <p className="text-xs text-slate-500 mt-2">
                                        Dijawab pada {formatDate(selectedReport.resolvedAt)}
                                    </p>
                                </div>
                            )}

                            {/* Timeline */}
                            <div className="pt-4 border-t border-slate-100">
                                <p className="text-xs text-slate-400 text-center">
                                    Laporan dibuat pada {formatDate(selectedReport.createdAt)}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Create Report Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/50" onClick={handleCloseCreate} />
                    <div className="relative bg-white rounded-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto">
                        {/* Header */}
                        <div className="sticky top-0 bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between z-10">
                            <h2 className="text-lg font-bold text-slate-900">Buat Laporan Baru</h2>
                            <button onClick={handleCloseCreate} className="p-2 hover:bg-slate-100 rounded-lg">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-6">
                            {/* Type Selection */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-3">
                                    Jenis Laporan
                                </label>
                                <div className="grid grid-cols-3 gap-2">
                                    {reportTypes.map((type) => (
                                        <button
                                            key={type.value}
                                            type="button"
                                            onClick={() => handleTypeChange(type.value)}
                                            className={`p-3 rounded-xl border-2 transition-all text-center ${formType === type.value
                                                    ? 'border-blue-500 bg-blue-50'
                                                    : 'border-slate-200 hover:border-slate-300'
                                                }`}
                                        >
                                            <type.icon className={`w-8 h-8 mb-1 ${formType === type.value ? 'text-blue-600' : 'text-slate-400'
                                                }`} />
                                            <p className={`text-sm font-medium ${formType === type.value ? 'text-blue-700' : 'text-slate-700'
                                                }`}>
                                                {type.label}
                                            </p>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Product Selection (for product type) */}
                            {formType === 'product' && (
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        Produk yang Dilaporkan <span className="text-red-500">*</span>
                                    </label>

                                    {!targetProduct ? (
                                        <div className="space-y-3">
                                            <div className="flex gap-2">
                                                <input
                                                    type="text"
                                                    value={productLink}
                                                    onChange={(e) => setProductLink(e.target.value)}
                                                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleProductSearch())}
                                                    placeholder="Paste link produk di sini..."
                                                    className="flex-1 rounded-xl border border-slate-200 py-2.5 px-4 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={handleProductSearch}
                                                    disabled={productLoading || !productLink.trim()}
                                                    className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium rounded-xl disabled:opacity-50 transition-colors"
                                                >
                                                    {productLoading ? (
                                                        <Loader2 className="w-5 h-5 animate-spin" />
                                                    ) : (
                                                        <Search className="w-5 h-5" />
                                                    )}
                                                </button>
                                            </div>
                                            <p className="text-xs text-slate-400">
                                                Copy URL dari halaman produk, contoh: localhost:5173/produk/...
                                            </p>
                                        </div>
                                    ) : (
                                        <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl flex items-center gap-3">
                                            <img
                                                src={targetProduct.gambar?.[0] || targetProduct.gambar}
                                                alt=""
                                                className="size-12 rounded-lg object-cover border border-blue-100"
                                            />
                                            <div className="flex-1 min-w-0">
                                                <p className="font-medium text-slate-900 text-sm truncate">{targetProduct.namaBarang}</p>
                                                <p className="text-xs text-slate-500">oleh {targetProduct.penjual?.nama}</p>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => { setTargetProduct(null); setProductLink(''); }}
                                                className="p-1.5 hover:bg-blue-100 rounded-lg text-slate-500"
                                            >
                                                <X className="w-5 h-5" />
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Category Selection */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    Kategori Masalah <span className="text-red-500">*</span>
                                </label>
                                <div className="grid grid-cols-2 gap-2">
                                    {currentTypeConfig?.categories.map((cat) => (
                                        <button
                                            key={cat.value}
                                            type="button"
                                            onClick={() => setFormCategory(cat.value)}
                                            className={`p-3 rounded-xl border text-left transition-all ${formCategory === cat.value
                                                    ? 'border-blue-500 bg-blue-50'
                                                    : 'border-slate-200 hover:border-slate-300'
                                                }`}
                                        >
                                            <p className={`text-sm font-medium ${formCategory === cat.value ? 'text-blue-700' : 'text-slate-700'
                                                }`}>
                                                {cat.label}
                                            </p>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Subject */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    Judul Laporan <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={formSubject}
                                    onChange={(e) => setFormSubject(e.target.value)}
                                    placeholder="Ringkasan singkat masalah..."
                                    className="w-full rounded-xl border border-slate-200 py-2.5 px-4 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                                    maxLength={200}
                                />
                            </div>

                            {/* Description */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    Deskripsi Lengkap <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    value={formDescription}
                                    onChange={(e) => setFormDescription(e.target.value)}
                                    placeholder="Jelaskan masalah secara detail. Semakin lengkap, semakin cepat kami bisa membantu..."
                                    className="w-full rounded-xl border border-slate-200 py-2.5 px-4 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none resize-none"
                                    rows={4}
                                    maxLength={2000}
                                />
                                <p className="text-xs text-slate-400 mt-1 text-right">{formDescription.length}/2000</p>
                            </div>

                            {/* Evidence Upload */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    Bukti Pendukung <span className="text-slate-400 font-normal">(opsional)</span>
                                </label>
                                <div className="flex gap-3 flex-wrap">
                                    {formEvidence.map((img, idx) => (
                                        <div key={idx} className="relative size-20 rounded-xl overflow-hidden border border-slate-200 group">
                                            <img src={img} alt="" className="w-full h-full object-cover" />
                                            <button
                                                type="button"
                                                onClick={() => removeImage(idx)}
                                                className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <Trash2 className="w-5 h-5 text-white" />
                                            </button>
                                        </div>
                                    ))}

                                    {formEvidence.length < 3 && (
                                        <label className="size-20 rounded-xl border-2 border-dashed border-slate-300 flex flex-col items-center justify-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors">
                                            <ImagePlus className="w-6 h-6 text-slate-400" />
                                            <span className="text-xs text-slate-400 mt-1">Upload</span>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={handleImageUpload}
                                                className="hidden"
                                            />
                                        </label>
                                    )}
                                </div>
                                <p className="text-xs text-slate-400 mt-2">Screenshot atau foto bukti, maks. 3 gambar</p>
                            </div>

                            {/* Submit */}
                            <div className="pt-2">
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-xl font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {submitting ? (
                                        <>
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                            Mengirim...
                                        </>
                                    ) : (
                                        <>
                                            <Send className="w-5 h-5" />
                                            Kirim Laporan
                                        </>
                                    )}
                                </button>
                                <p className="text-xs text-slate-400 text-center mt-3">
                                    Tim kami akan meninjau laporanmu dalam 1-3 hari kerja
                                </p>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default ReportsTab;
