import { useState, useEffect, useRef } from 'react';
import {
    Image, Plus, RefreshCw, ChevronLeft, ChevronRight, Edit, Trash2,
    Eye, EyeOff, Upload, X, Link as LinkIcon, AlertCircle
} from 'lucide-react';
import bannerService from '../services/bannerService';

function AdminBannersPage() {
    const [banners, setBanners] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedBanner, setSelectedBanner] = useState(null);
    const [currentBanner, setCurrentBanner] = useState(0);
    const [formData, setFormData] = useState({ image: '', title: '', link: '', isActive: true });
    const [imagePreview, setImagePreview] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const fileInputRef = useRef(null);

    useEffect(() => {
        fetchBanners();
    }, []);

    const fetchBanners = async () => {
        try {
            setLoading(true);
            const response = await bannerService.getAllBanners();
            setBanners(response.data || []);
        } catch (err) {
            setError('Gagal memuat data banner');
        } finally {
            setLoading(false);
        }
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                setError('Ukuran file maksimal 5MB');
                return;
            }
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData(prev => ({ ...prev, image: reader.result }));
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.image && !selectedBanner) {
            setError('Gambar banner wajib diupload');
            return;
        }
        try {
            setSubmitting(true);
            setError('');
            if (selectedBanner) {
                await bannerService.updateBanner(selectedBanner._id, formData);
            } else {
                await bannerService.createBanner(formData);
            }
            setShowAddModal(false);
            resetForm();
            fetchBanners();
        } catch (err) {
            setError(err.response?.data?.message || 'Gagal menyimpan banner');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async () => {
        if (!selectedBanner) return;
        try {
            setSubmitting(true);
            await bannerService.deleteBanner(selectedBanner._id);
            setShowDeleteModal(false);
            setSelectedBanner(null);
            fetchBanners();
        } catch (err) {
            setError(err.response?.data?.message || 'Gagal menghapus banner');
        } finally {
            setSubmitting(false);
        }
    };

    const handleToggleActive = async (banner) => {
        try {
            await bannerService.updateBanner(banner._id, { isActive: !banner.isActive });
            fetchBanners();
        } catch (err) {
            console.error('Error toggling banner status:', err);
        }
    };

    const openEditModal = (banner) => {
        setSelectedBanner(banner);
        setFormData({ image: '', title: banner.title || '', link: banner.link || '', isActive: banner.isActive });
        setImagePreview(banner.imageUrl);
        setShowAddModal(true);
    };

    const resetForm = () => {
        setFormData({ image: '', title: '', link: '', isActive: true });
        setImagePreview('');
        setSelectedBanner(null);
        setError('');
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    return (
        <div className="p-6 md:p-8 space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white">
                        Manajemen Banner
                    </h1>
                    <p className="text-sm text-[#606e8a] mt-1">Kelola banner homepage marketplace</p>
                </div>
                <div className="flex gap-2">
                    <button onClick={fetchBanners} className="flex items-center gap-2 px-4 py-2 bg-[#2d3748] hover:bg-[#374151] text-white rounded-lg text-sm font-medium transition-colors">
                        <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                    </button>
                    <button onClick={() => { resetForm(); setShowAddModal(true); }} className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors">
                        <Plus className="w-4 h-4" />
                        Tambah Banner
                    </button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-[#1a2332] p-5 rounded-xl border border-[#2d3748] relative overflow-hidden group hover:shadow-lg transition-shadow">
                    <p className="text-sm font-medium text-[#606e8a]">Total Banner</p>
                    <h3 className="text-2xl font-bold text-white mt-1">{banners.length}</h3>
                </div>
                <div className="bg-[#1a2332] p-5 rounded-xl border border-[#2d3748] relative overflow-hidden group hover:shadow-lg transition-shadow">
                    <p className="text-sm font-medium text-[#606e8a]">Aktif</p>
                    <h3 className="text-2xl font-bold text-white mt-1">{banners.filter(b => b.isActive).length}</h3>
                </div>
                <div className="bg-[#1a2332] p-5 rounded-xl border border-[#2d3748] relative overflow-hidden group hover:shadow-lg transition-shadow">
                    <p className="text-sm font-medium text-[#606e8a]">Nonaktif</p>
                    <h3 className="text-2xl font-bold text-white mt-1">{banners.filter(b => !b.isActive).length}</h3>
                </div>
            </div>

            {/* Error Alert */}
            {error && !showAddModal && (
                <div className="bg-red-500/20 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg flex items-center gap-2">
                    <AlertCircle className="w-5 h-5" />
                    {error}
                </div>
            )}

            {/* Banners Display */}
            {loading ? (
                <div className="bg-[#1a2332] rounded-xl border border-[#2d3748] overflow-hidden animate-pulse">
                    <div className="w-full h-64 bg-[#2d3748]"></div>
                </div>
            ) : banners.length > 0 ? (
                <div className="bg-[#1a2332] rounded-xl border border-[#2d3748] overflow-hidden">
                    <div className="relative w-full">
                        {banners.map((banner, index) => (
                            <div key={banner._id} className={`${index === currentBanner ? 'block' : 'hidden'} relative group`}>
                                <img src={banner.imageUrl} alt={banner.title || 'Banner'} className="w-full h-auto object-contain" />
                                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-6 pt-12 flex items-end justify-between opacity-0 group-hover:opacity-100 transition-opacity">
                                    <div className="text-white">
                                        <div className="flex gap-2 mb-2">
                                            <span className={`px-2 py-0.5 rounded text-xs font-bold ${banner.isActive ? 'bg-green-500' : 'bg-gray-500'}`}>
                                                {banner.isActive ? 'AKTIF' : 'NONAKTIF'}
                                            </span>
                                        </div>
                                        <h3 className="text-2xl font-bold drop-shadow-md">{banner.title || 'Tanpa Judul'}</h3>
                                        {banner.link && (
                                            <p className="text-sm opacity-90 drop-shadow-md flex items-center gap-1">
                                                <LinkIcon className="w-3 h-3" />
                                                {banner.link}
                                            </p>
                                        )}
                                    </div>
                                    <div className="flex gap-2">
                                        <button onClick={() => handleToggleActive(banner)} className="p-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white rounded-lg transition-colors" title={banner.isActive ? 'Sembunyikan' : 'Tampilkan'}>
                                            {banner.isActive ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                        </button>
                                        <button onClick={() => openEditModal(banner)} className="p-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors" title="Edit">
                                            <Edit className="w-5 h-5" />
                                        </button>
                                        <button onClick={() => { setSelectedBanner(banner); setShowDeleteModal(true); }} className="p-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors" title="Hapus">
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}

                        {banners.length > 1 && (
                            <>
                                <button onClick={() => setCurrentBanner((prev) => (prev - 1 + banners.length) % banners.length)} className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-2 bg-white/80 hover:bg-white rounded-full shadow-md transition-colors">
                                    <ChevronLeft className="w-5 h-5 text-gray-700" />
                                </button>
                                <button onClick={() => setCurrentBanner((prev) => (prev + 1) % banners.length)} className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-2 bg-white/80 hover:bg-white rounded-full shadow-md transition-colors">
                                    <ChevronRight className="w-5 h-5 text-gray-700" />
                                </button>
                            </>
                        )}
                    </div>

                    {banners.length > 1 && (
                        <div className="p-4 border-t border-[#2d3748] flex justify-center gap-2">
                            {banners.map((_, index) => (
                                <button key={index} onClick={() => setCurrentBanner(index)} className={`w-3 h-3 rounded-full transition-all ${index === currentBanner ? 'bg-primary w-6' : 'bg-[#606e8a] hover:bg-primary/50'}`} />
                            ))}
                        </div>
                    )}
                </div>
            ) : (
                <div className="text-center py-12 bg-[#1a2332] border border-[#2d3748] rounded-xl">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#2d3748] flex items-center justify-center">
                        <Image className="w-8 h-8 text-[#606e8a]" />
                    </div>
                    <p className="text-[#606e8a] mb-4">Belum ada banner</p>
                    <button onClick={() => setShowAddModal(true)} className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors">
                        <Plus className="w-4 h-4" />
                        Tambah Banner Pertama
                    </button>
                </div>
            )}

            {/* Add/Edit Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
                    <div className="bg-[#1a2332] rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto border border-[#2d3748]">
                        <div className="sticky top-0 bg-[#1a2332] border-b border-[#2d3748] px-6 py-4 flex items-center justify-between">
                            <h2 className="text-lg font-bold text-white">{selectedBanner ? 'Edit Banner' : 'Tambah Banner'}</h2>
                            <button onClick={() => { setShowAddModal(false); resetForm(); }} className="p-1 hover:bg-[#2d3748] rounded-full transition-colors text-[#606e8a]">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            {error && (
                                <div className="bg-red-500/20 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg text-sm flex items-center gap-2">
                                    <AlertCircle className="w-4 h-4" />
                                    {error}
                                </div>
                            )}

                            {/* Image Upload */}
                            <div>
                                <label className="block text-sm font-medium text-[#606e8a] mb-2">Gambar Banner <span className="text-red-500">*</span></label>
                                <div onClick={() => fileInputRef.current?.click()} className="border-2 border-dashed border-[#2d3748] rounded-xl p-4 text-center cursor-pointer hover:border-primary transition-colors bg-[#0f1520]">
                                    {imagePreview ? (
                                        <div className="relative">
                                            <img src={imagePreview} alt="Preview" className="w-full h-auto rounded-lg" />
                                            <div className="mt-2 text-sm text-[#606e8a]">Klik untuk ganti gambar</div>
                                        </div>
                                    ) : (
                                        <div className="py-8">
                                            <Upload className="w-10 h-10 mx-auto text-[#606e8a]" />
                                            <p className="mt-2 text-sm text-[#606e8a]">Klik untuk upload gambar</p>
                                            <p className="text-xs text-[#606e8a] mt-1">Rekomendasi: 2000x500px, Max 5MB</p>
                                        </div>
                                    )}
                                </div>
                                <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                            </div>

                            {/* Title */}
                            <div>
                                <label className="block text-sm font-medium text-[#606e8a] mb-2">Judul (opsional)</label>
                                <input
                                    type="text"
                                    value={formData.title}
                                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                                    placeholder="Judul banner untuk alt text"
                                    className="w-full px-4 py-2.5 border border-[#2d3748] bg-[#0f1520] text-white rounded-lg focus:ring-2 focus:ring-primary placeholder-[#606e8a]"
                                />
                            </div>

                            {/* Link */}
                            <div>
                                <label className="block text-sm font-medium text-[#606e8a] mb-2">Link (opsional)</label>
                                <input
                                    type="text"
                                    value={formData.link}
                                    onChange={(e) => setFormData(prev => ({ ...prev, link: e.target.value }))}
                                    placeholder="URL tujuan saat banner diklik"
                                    className="w-full px-4 py-2.5 border border-[#2d3748] bg-[#0f1520] text-white rounded-lg focus:ring-2 focus:ring-primary placeholder-[#606e8a]"
                                />
                                <p className="text-xs text-[#606e8a] mt-1">Contoh: /jelajah atau https://example.com</p>
                            </div>

                            {/* Active Toggle */}
                            <div className="flex items-center justify-between">
                                <div>
                                    <label className="block text-sm font-medium text-[#606e8a]">Status Aktif</label>
                                    <p className="text-xs text-[#606e8a]">Banner akan ditampilkan di homepage</p>
                                </div>
                                <button type="button" onClick={() => setFormData(prev => ({ ...prev, isActive: !prev.isActive }))} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${formData.isActive ? 'bg-primary' : 'bg-[#2d3748]'}`}>
                                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${formData.isActive ? 'translate-x-6' : 'translate-x-1'}`} />
                                </button>
                            </div>

                            {/* Submit */}
                            <div className="flex gap-3 pt-4">
                                <button type="button" onClick={() => { setShowAddModal(false); resetForm(); }} className="flex-1 px-4 py-2.5 border border-[#2d3748] text-[#606e8a] rounded-lg hover:bg-[#2d3748] transition-colors">
                                    Batal
                                </button>
                                <button type="submit" disabled={submitting} className="flex-1 px-4 py-2.5 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                                    {submitting ? (
                                        <>
                                            <RefreshCw className="w-4 h-4 animate-spin" />
                                            Menyimpan...
                                        </>
                                    ) : 'Simpan'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Modal */}
            {showDeleteModal && selectedBanner && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
                    <div className="bg-[#1a2332] rounded-xl w-full max-w-md border border-[#2d3748]">
                        <div className="p-6 text-center">
                            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-500/20 flex items-center justify-center">
                                <Trash2 className="w-8 h-8 text-red-400" />
                            </div>
                            <h3 className="text-lg font-bold text-white mb-2">Hapus Banner?</h3>
                            <p className="text-[#606e8a] text-sm mb-4">Banner ini akan dihapus secara permanen.</p>
                            {selectedBanner.imageUrl && (
                                <img src={selectedBanner.imageUrl} alt="Banner to delete" className="w-full h-auto rounded-lg mb-4" />
                            )}
                        </div>
                        <div className="flex border-t border-[#2d3748]">
                            <button onClick={() => { setShowDeleteModal(false); setSelectedBanner(null); }} className="flex-1 px-4 py-3 text-[#606e8a] font-medium hover:bg-[#2d3748] transition-colors">
                                Batal
                            </button>
                            <button onClick={handleDelete} disabled={submitting} className="flex-1 px-4 py-3 text-red-400 font-medium hover:bg-red-500/20 transition-colors border-l border-[#2d3748] disabled:opacity-50">
                                {submitting ? 'Menghapus...' : 'Hapus'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default AdminBannersPage;
