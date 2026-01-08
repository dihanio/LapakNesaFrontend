import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import productService from '../services/productService';
import useAuthStore from '../store/authStore';
import ProductCard from './ProductCard';
import { formatNumber } from '../utils/formatUtils';
import { lokasiList, categories, tipeTransaksi as tipeTransaksiList, getKondisiList } from '../constants/formOptions';
import {
    Image, ArrowLeftRight, LayoutGrid, FileText, Banknote, List, MapPin,
    Rocket, Upload, Trash2, CheckCircle2, Circle, Eye, Sparkles, BookOpen,
    MonitorSmartphone, Shirt, Car, Utensils, Armchair, Hammer, Tag, CalendarClock,
    User, AlertCircle, X, Check, Loader2, Info
} from 'lucide-react';

const ICON_MAP = {
    BookOpen, MonitorSmartphone, Shirt, Car, Utensils, Armchair, Hammer, LayoutGrid, Tag, CalendarClock
};

// Live Preview Component - Uses actual ProductCard
const LivePreview = ({ formData, preview, user, handleSubmit, loading, isEditMode }) => {

    const completionPercentage = () => {
        let filled = 0;
        let total = 5;
        if (formData.namaBarang) filled++;
        if (formData.harga) filled++;
        if (formData.kategori) filled++;
        if (formData.kondisi) filled++;
        if (preview) filled++;
        return Math.round((filled / total) * 100);
    };

    const percentage = completionPercentage();

    // Create mock product object for ProductCard
    const mockProduct = {
        _id: 'preview',
        namaBarang: formData.namaBarang || 'Nama produk...',
        harga: formData.harga || 0,
        gambar: preview || null,
        lokasi: formData.lokasi || 'UNESA',
        kondisi: formData.kondisi,
        kategori: formData.kategori,
        status: 'aktif',
        createdAt: new Date().toISOString(),
        penjual: {
            nama: user?.nama || 'Penjual',
            avatar: user?.avatar || null,
        }
    };

    return (
        <div className="sticky top-6">
            {/* Submit Button - At top of preview */}
            <button onClick={handleSubmit} disabled={loading}
                className="w-full mb-4 py-4 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-2xl font-semibold disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-blue-500/25 transition-all hover:scale-[1.02] active:scale-[0.98]">
                {loading ? (
                    <><Loader2 className="w-5 h-5 animate-spin" />Menyimpan...</>
                ) : (
                    <><Rocket className="w-5 h-5" />{isEditMode ? 'Simpan Perubahan' : 'Pasang Iklan Sekarang'}</>
                )}
            </button>

            {/* Completion Progress */}
            <div className="bg-white rounded-2xl border border-slate-200 p-4 mb-4">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-slate-700">Kelengkapan Iklan</span>
                    <span className={`text-sm font-bold ${percentage === 100 ? 'text-green-600' : 'text-blue-600'}`}>{percentage}%</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                        className={`h-full rounded-full transition-all duration-500 ${percentage === 100 ? 'bg-gradient-to-r from-green-400 to-emerald-500' : 'bg-gradient-to-r from-blue-400 to-blue-600'}`}
                        style={{ width: `${percentage}%` }}
                    />
                </div>
                <div className="flex flex-wrap gap-2 mt-3">
                    {[
                        { label: 'Foto', done: !!preview },
                        { label: 'Nama', done: !!formData.namaBarang },
                        { label: 'Harga', done: !!formData.harga },
                        { label: 'Kategori', done: !!formData.kategori },
                        { label: 'Kondisi', done: !!formData.kondisi },
                    ].map((item, i) => (
                        <span key={i} className={`text-xs px-2 py-1 rounded-full flex items-center gap-1 ${item.done ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                            {item.done ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Circle className="w-3.5 h-3.5" />}
                            {item.label}
                        </span>
                    ))}
                </div>
            </div>

            {/* Preview Card using actual ProductCard */}
            <div className="bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 rounded-2xl border border-slate-200 p-4">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                        <Eye className="w-5 h-5 text-blue-500" />
                        Preview Iklan
                    </h3>
                    <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded-full font-medium">Live</span>
                </div>

                {/* Actual ProductCard */}
                <div className="pointer-events-none">
                    <ProductCard product={mockProduct} />
                </div>

                {/* Product Details Preview */}
                <div className="mt-4 p-4 bg-white rounded-xl border border-slate-100 space-y-3">
                    <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider mb-2">Detail Produk</h4>

                    <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                        <div className="bg-slate-50 p-2 rounded-lg">
                            <span className="text-slate-500 block text-[10px]">Kategori</span>
                            <span className="font-semibold text-slate-700">{formData.kategori || '-'}</span>
                        </div>
                        <div className="bg-slate-50 p-2 rounded-lg">
                            <span className="text-slate-500 block text-[10px]">Kondisi</span>
                            <span className="font-semibold text-slate-700">{formData.kondisi || '-'}</span>
                        </div>
                    </div>

                    <div>
                        <span className="text-slate-500 block text-[10px] mb-1">Deskripsi</span>
                        <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-wrap line-clamp-6">
                            {formData.deskripsi || 'Deskripsi produk akan muncul disini...'}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

function SellProductForm({ productId, onSuccess }) {
    const navigate = useNavigate();
    const { user } = useAuthStore();
    const isEditMode = Boolean(productId);

    const [formData, setFormData] = useState({
        namaBarang: '', harga: '', kategori: '', kondisi: '', deskripsi: '', lokasi: '', stok: 1, tipeTransaksi: 'jual',
        expiry: '', isHalal: true, portion: '', isPreOrder: false,
        elektronikBrand: '', elektronikWarranty: '', elektronikSpecs: '',
        fashionSize: '', fashionColor: '', fashionBrand: '', fashionMaterial: '',
        bukuAuthor: '', bukuPublisher: '', bukuYear: '', bukuIsbn: '',
        otomotifTipe: 'kendaraan', otomotifBrand: '', otomotifYear: '', otomotifTransmission: '', otomotifCc: '',
        otomotifJenisPart: '', otomotifKompatibel: '', otomotifKondisiPart: '', otomotifJenisAksesoris: '', otomotifUkuran: '',
        jasaServiceType: '', jasaAvailability: '', jasaDuration: '', jasaExperience: '', jasaPriceType: 'per jam',
        perabotanDimensions: '', perabotanMaterial: '', perabotanWeight: '',
        rentalPricePerDay: '', rentalPricePerWeek: '', rentalPricePerMonth: '', rentalDeposit: '', rentalMinDuration: '', rentalMaxDuration: '',
    });

    const [gambar, setGambar] = useState(null);
    const [preview, setPreview] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const isFood = formData.kategori === 'Makanan';
    const isElektronik = formData.kategori === 'Elektronik';
    const isFashion = formData.kategori === 'Fashion';
    const isBuku = formData.kategori === 'Buku';
    const isOtomotif = formData.kategori === 'Otomotif';
    const isJasa = formData.kategori === 'Jasa';
    const isPerabotan = formData.kategori === 'Perabotan';
    const isSewa = formData.tipeTransaksi === 'sewa';
    const hasCategoryDetails = isFood || isElektronik || isFashion || isBuku || isOtomotif || isJasa || isPerabotan;

    const getFilteredCategories = () => {
        if (formData.tipeTransaksi === 'jasa') return categories.filter(c => c.value === 'Jasa');
        if (formData.tipeTransaksi === 'sewa') return categories.filter(c => !['Makanan', 'Fashion', 'Buku', 'Jasa'].includes(c.value));
        return categories.filter(c => c.value !== 'Jasa');
    };
    const filteredCategories = getFilteredCategories();

    useEffect(() => {
        if (isEditMode && productId) {
            productService.getProduct(productId).then(res => {
                const p = res.data;
                setFormData({
                    namaBarang: p.namaBarang || '', harga: p.harga || '', kategori: p.kategori || '', kondisi: p.kondisi || '',
                    deskripsi: p.deskripsi || '', lokasi: p.lokasi || '', stok: p.stok || 1, tipeTransaksi: p.tipeTransaksi || 'jual',
                    expiry: p.foodDetails?.expiry ? new Date(p.foodDetails.expiry).toISOString().split('T')[0] : '',
                    isHalal: p.foodDetails?.isHalal ?? true, portion: p.foodDetails?.portion || '', isPreOrder: p.foodDetails?.isPreOrder || false,
                    elektronikBrand: p.elektronikDetails?.brand || '', elektronikWarranty: p.elektronikDetails?.warranty || '', elektronikSpecs: p.elektronikDetails?.specs || '',
                    fashionSize: p.fashionDetails?.size || '', fashionColor: p.fashionDetails?.color || '', fashionBrand: p.fashionDetails?.brand || '', fashionMaterial: p.fashionDetails?.material || '',
                    bukuAuthor: p.bukuDetails?.author || '', bukuPublisher: p.bukuDetails?.publisher || '', bukuYear: p.bukuDetails?.year || '', bukuIsbn: p.bukuDetails?.isbn || '',
                    otomotifTipe: p.otomotifDetails?.tipeOtomotif || 'kendaraan', otomotifBrand: p.otomotifDetails?.brand || '', otomotifYear: p.otomotifDetails?.year || '',
                    otomotifTransmission: p.otomotifDetails?.transmission || '', otomotifCc: p.otomotifDetails?.cc || '',
                    otomotifJenisPart: p.otomotifDetails?.jenisPart || '', otomotifKompatibel: p.otomotifDetails?.kompatibel || '', otomotifKondisiPart: p.otomotifDetails?.kondisiPart || '',
                    otomotifJenisAksesoris: p.otomotifDetails?.jenisAksesoris || '', otomotifUkuran: p.otomotifDetails?.ukuran || '',
                    jasaServiceType: p.jasaDetails?.serviceType || '', jasaAvailability: p.jasaDetails?.availability || '', jasaDuration: p.jasaDetails?.duration || '',
                    jasaExperience: p.jasaDetails?.experience || '', jasaPriceType: p.jasaDetails?.priceType || 'per jam',
                    perabotanDimensions: p.perabotanDetails?.dimensions || '', perabotanMaterial: p.perabotanDetails?.material || '', perabotanWeight: p.perabotanDetails?.weight || '',
                    rentalPricePerDay: p.rentalDetails?.pricePerDay || '', rentalPricePerWeek: p.rentalDetails?.pricePerWeek || '', rentalPricePerMonth: p.rentalDetails?.pricePerMonth || '',
                    rentalDeposit: p.rentalDetails?.deposit || '', rentalMinDuration: p.rentalDetails?.minDuration || '', rentalMaxDuration: p.rentalDetails?.maxDuration || '',
                });
                if (p.gambar) setPreview(p.gambar.startsWith('http') ? p.gambar : `${(import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace('/api', '')}${p.gambar}`);
            }).catch(() => setError('Gagal memuat data produk'));
        }
    }, [productId, isEditMode]);

    useEffect(() => {
        if (formData.kategori === 'Jasa' && formData.tipeTransaksi !== 'jasa') setFormData(prev => ({ ...prev, tipeTransaksi: 'jasa' }));
    }, [formData.kategori]);

    // Reset kondisi when kategori changes if current kondisi is not valid
    useEffect(() => {
        const validKondisi = getKondisiList(formData.kategori);
        if (formData.kondisi && !validKondisi.includes(formData.kondisi)) {
            setFormData(prev => ({ ...prev, kondisi: '' }));
        }
    }, [formData.kategori]);

    useEffect(() => {
        const valid = getFilteredCategories().map(c => c.value);
        if (formData.kategori && !valid.includes(formData.kategori)) setFormData(prev => ({ ...prev, kategori: '' }));
    }, [formData.tipeTransaksi]);

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) { if (file.size > 5 * 1024 * 1024) { setError('Max 5MB'); return; } setGambar(file); setPreview(URL.createObjectURL(file)); setError(''); }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.namaBarang || !formData.harga || !formData.kategori || !formData.kondisi) { setError('Lengkapi semua field wajib'); return; }
        setLoading(true);
        try {
            const data = new FormData();
            ['namaBarang', 'harga', 'kategori', 'kondisi', 'deskripsi', 'lokasi', 'stok', 'tipeTransaksi'].forEach(k => data.append(k, formData[k]));
            if (isFood) data.append('foodDetails', JSON.stringify({ expiry: formData.expiry, isHalal: formData.isHalal, portion: formData.portion, isPreOrder: formData.isPreOrder }));
            if (isElektronik) data.append('elektronikDetails', JSON.stringify({ brand: formData.elektronikBrand, warranty: formData.elektronikWarranty, specs: formData.elektronikSpecs }));
            if (isFashion) data.append('fashionDetails', JSON.stringify({ size: formData.fashionSize, color: formData.fashionColor, brand: formData.fashionBrand, material: formData.fashionMaterial }));
            if (isBuku) data.append('bukuDetails', JSON.stringify({ author: formData.bukuAuthor, publisher: formData.bukuPublisher, year: formData.bukuYear, isbn: formData.bukuIsbn }));
            if (isOtomotif) data.append('otomotifDetails', JSON.stringify({ tipeOtomotif: formData.otomotifTipe, brand: formData.otomotifBrand, year: formData.otomotifYear, transmission: formData.otomotifTransmission, cc: formData.otomotifCc, jenisPart: formData.otomotifJenisPart, kompatibel: formData.otomotifKompatibel, kondisiPart: formData.otomotifKondisiPart, jenisAksesoris: formData.otomotifJenisAksesoris, ukuran: formData.otomotifUkuran }));
            if (isJasa) data.append('jasaDetails', JSON.stringify({ serviceType: formData.jasaServiceType, availability: formData.jasaAvailability, duration: formData.jasaDuration, experience: formData.jasaExperience, priceType: formData.jasaPriceType }));
            if (isPerabotan) data.append('perabotanDetails', JSON.stringify({ dimensions: formData.perabotanDimensions, material: formData.perabotanMaterial, weight: formData.perabotanWeight }));
            if (isSewa) data.append('rentalDetails', JSON.stringify({ pricePerDay: formData.rentalPricePerDay, pricePerWeek: formData.rentalPricePerWeek, pricePerMonth: formData.rentalPricePerMonth, deposit: formData.rentalDeposit, minDuration: formData.rentalMinDuration, maxDuration: formData.rentalMaxDuration }));
            if (gambar) data.append('gambar', gambar);
            isEditMode ? await productService.updateProduct(productId, data) : await productService.createProduct(data);
            if (onSuccess) onSuccess();
            else navigate('/dashboard?tab=products');
        } catch (err) { setError(err.response?.data?.message || 'Gagal menyimpan'); } finally { setLoading(false); }
    };

    return (
        <div className="w-full">
            {error && (
                <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 flex items-center gap-3">
                    <AlertCircle className="w-5 h-5" />
                    <span className="text-sm font-medium">{error}</span>
                </div>
            )}

            <div className="flex flex-col lg:flex-row gap-8">
                {/* Form Section */}
                <div className="flex-1 min-w-0">
                    <form onSubmit={handleSubmit}>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Column 1 - Photo, Transaction Type, Category */}
                            <div className="space-y-6">
                                <Card title="Foto Produk" icon={Image} important>
                                    <div className="flex flex-col items-center">
                                        {preview ? (
                                            <div className="relative group w-full aspect-[4/3] rounded-2xl overflow-hidden shadow-sm border border-slate-200">
                                                <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col items-center justify-center gap-3">
                                                    <label className="cursor-pointer bg-white/95 backdrop-blur-sm px-5 py-2.5 rounded-xl text-sm font-bold text-slate-700 hover:bg-white hover:scale-105 transition-all flex items-center gap-2 shadow-lg">
                                                        <ArrowLeftRight className="w-4 h-4 text-blue-600" />
                                                        Ganti Foto
                                                        <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                                                    </label>
                                                    <button type="button" onClick={() => { setGambar(null); setPreview(null); }}
                                                        className="bg-red-500/90 backdrop-blur-sm px-5 py-2.5 rounded-xl text-sm font-bold text-white hover:bg-red-600 hover:scale-105 transition-all flex items-center gap-2 shadow-lg">
                                                        <Trash2 className="w-4 h-4" />
                                                        Hapus
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <label className="w-full aspect-[4/3] border-3 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:border-blue-400 hover:bg-blue-50/50 transition-all group relative overflow-hidden">
                                                <div className="absolute inset-0 bg-slate-50/50 pattern-dots opacity-50"></div>
                                                <div className="relative z-10 flex flex-col items-center">
                                                    <div className="size-16 rounded-2xl bg-white shadow-sm border border-slate-100 flex items-center justify-center mb-4 group-hover:scale-110 group-hover:shadow-md transition-all duration-300">
                                                        <Upload className="w-8 h-8 text-blue-500 group-hover:text-blue-600" />
                                                    </div>
                                                    <span className="text-sm font-bold text-slate-700 group-hover:text-blue-600 transition-colors">Upload Foto Produk</span>
                                                    <span className="text-xs text-slate-400 mt-1 font-medium">JPG, PNG (Max 5MB)</span>
                                                </div>
                                                <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                                            </label>
                                        )}
                                    </div>
                                </Card>

                                <Card title="Spesifikasi Dasar" icon={LayoutGrid} important>
                                    <div className="space-y-6">
                                        {/* Tipe Transaksi */}
                                        <div className="grid grid-cols-2 gap-3">
                                            {tipeTransaksiList.map(t => {
                                                const Icon = ICON_MAP[t.icon] || Circle;
                                                return (
                                                    <button key={t.value} type="button" onClick={() => setFormData({ ...formData, tipeTransaksi: t.value })}
                                                        className={`p-3 rounded-xl border-2 flex flex-col items-center justify-center gap-2 transition-all ${formData.tipeTransaksi === t.value ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-slate-100 hover:border-slate-200 text-slate-600'}`}>
                                                        <Icon className={`w-5 h-5 ${formData.tipeTransaksi === t.value ? 'text-blue-500' : 'text-slate-400'}`} />
                                                        <span className="text-xs font-bold">{t.label}</span>
                                                    </button>
                                                );
                                            })}
                                        </div>

                                        {/* Kategori */}
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Kategori</label>
                                            <div className="grid grid-cols-3 gap-2">
                                                {filteredCategories.map(c => {
                                                    const Icon = ICON_MAP[c.icon] || Circle;
                                                    return (
                                                        <button key={c.value} type="button" onClick={() => setFormData({ ...formData, kategori: c.value })}
                                                            className={`p-2.5 rounded-xl border-2 text-center transition-all ${formData.kategori === c.value ? 'border-blue-500 bg-blue-50' : 'border-slate-100 hover:border-slate-200'}`}>
                                                            <div className="flex justify-center mb-1">
                                                                <Icon className={`w-6 h-6 ${formData.kategori === c.value ? 'text-blue-500' : 'text-slate-400'}`} />
                                                            </div>
                                                            <p className={`text-[10px] font-bold mt-1 leading-tight truncate ${formData.kategori === c.value ? 'text-blue-600' : 'text-slate-500'}`}>{c.name}</p>
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>

                                        {/* Kondisi */}
                                        {formData.kategori && (
                                            <div>
                                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Kondisi</label>
                                                <div className="grid grid-cols-2 gap-2">
                                                    {getKondisiList(formData.kategori).map(k => (
                                                        <button key={k} type="button" onClick={() => setFormData({ ...formData, kondisi: k })}
                                                            className={`px-3 py-2.5 rounded-xl border-2 text-xs font-bold transition-all ${formData.kondisi === k ? 'border-blue-500 bg-blue-50 text-blue-600' : 'border-slate-100 text-slate-600 hover:border-slate-200'}`}>
                                                            {k}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </Card>
                            </div>

                            {/* Column 2 - Product Details */}
                            <div className="space-y-6">
                                <Card title="Detail Informasi" icon={FileText} important>
                                    <div className="space-y-5">
                                        <div>
                                            <label className="block text-sm font-bold text-slate-700 mb-1.5">Nama Produk <span className="text-red-500">*</span></label>
                                            <input type="text" name="namaBarang" value={formData.namaBarang} onChange={handleChange}
                                                placeholder="Contoh: Laptop Gamming ASUS ROG (Bekas)"
                                                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all font-medium" />
                                        </div>
                                        <div>
                                            <div className="flex justify-between mb-1.5">
                                                <label className="block text-sm font-bold text-slate-700">Deskripsi</label>
                                                <button type="button"
                                                    onClick={() => {
                                                        const templates = {
                                                            'Elektronik': "Spesifikasi:\n- Processor: \n- RAM: \n- Storage: \n- Layar: \n\nKondisi:\n- Body: \n- Fungsi: \n\nKelengkapan:\n- \n- \n\nMinus:\n- ",
                                                            'Otomotif': "Spesifikasi:\n- Tahun: \n- Kilometer: \n- Pajak: \n- Transmisi: \n\nKondisi Mesin:\n- \n\nKondisi Body:\n- \n\nRiwayat Servis:\n- ",
                                                            'Fashion': "Detail Produk:\n- Bahan: \n- Ukuran (PxL): \n- Warna: \n\nKondisi:\n- \n\nMinus:\n- ",
                                                            'Makanan': "Komposisi:\n- \n- \n\nDaya Tahan:\n- Suhu Ruang: \n- Kulkas: \n\nCara Penyajian:\n1. \n2. ",
                                                            'Jasa': "Layanan mencakup:\n1. \n2. \n3. \n\nCara kerja:\n- \n- \n\nPortofolio/Pengalaman:\n- ",
                                                            'Sewa': "Fasilitas:\n- \n- \n\nSyarat Sewa:\n1. \n2. \n\nKetentuan Denda:\n- ",
                                                            'default': "Spesifikasi:\n- \n- \n\nKondisi:\n- \n\nAlasan Jual:\n- "
                                                        };
                                                        const template = templates[formData.kategori] || templates['default'];
                                                        setFormData({ ...formData, deskripsi: formData.deskripsi ? formData.deskripsi + '\n\n' + template : template });
                                                    }}
                                                    className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1">
                                                    <Sparkles className="w-3.5 h-3.5" />
                                                    Gunakan Template
                                                </button>
                                            </div>
                                            <textarea name="deskripsi" value={formData.deskripsi} onChange={handleChange} rows={6}
                                                placeholder="Jelaskan kondisi barang, minus (jika ada), kelengkapan, dan alasan dijual secara detail agar pembeli percaya..."
                                                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 resize-none transition-all text-sm leading-relaxed font-sans" />
                                        </div>
                                    </div>
                                </Card>

                                {hasCategoryDetails && (
                                    <Card title={`Spesifikasi ${formData.kategori}`} icon={List}>
                                        {isFood && <FoodFields formData={formData} setFormData={setFormData} handleChange={handleChange} />}
                                        {isElektronik && <ElektronikFields formData={formData} handleChange={handleChange} />}
                                        {isFashion && <FashionFields formData={formData} handleChange={handleChange} />}
                                        {isBuku && <BukuFields formData={formData} handleChange={handleChange} />}
                                        {isOtomotif && <OtomotifFields formData={formData} setFormData={setFormData} handleChange={handleChange} />}
                                        {isJasa && <JasaFields formData={formData} setFormData={setFormData} handleChange={handleChange} />}
                                        {isPerabotan && <PerabotanFields formData={formData} handleChange={handleChange} />}
                                    </Card>
                                )}

                                <Card title="Penjualan & Lokasi" icon={Banknote} important>
                                    <div className="space-y-6">
                                        {/* Harga & Stok Row */}
                                        <div className="grid grid-cols-3 gap-4">
                                            <div className={!isSewa && !isJasa ? "col-span-2" : "col-span-3"}>
                                                <label className="block text-sm font-bold text-slate-700 mb-1.5">
                                                    Harga {isSewa ? 'Dasar' : ''} <span className="text-red-500">*</span>
                                                </label>
                                                <div className="relative">
                                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">Rp</span>
                                                    <input type="number" name="harga" value={formData.harga} onChange={handleChange} placeholder="0"
                                                        className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 transition-all font-bold text-lg text-slate-800" />
                                                </div>
                                            </div>

                                            {!isSewa && !isJasa && (
                                                <div className="col-span-1">
                                                    <label className="block text-sm font-bold text-slate-700 mb-1.5">Stok</label>
                                                    <input type="number" name="stok" value={formData.stok} onChange={handleChange} min="1"
                                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 transition-all font-bold text-center" />
                                                </div>
                                            )}
                                        </div>

                                        {isSewa && (
                                            <div className="bg-slate-50 rounded-xl p-4 space-y-4 border border-slate-100">
                                                <h4 className="text-sm font-bold text-slate-700 flex items-center gap-2">
                                                    <List className="w-5 h-5 text-blue-500" />
                                                    Paket Sewa
                                                </h4>
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                    <InputField label="Per Hari" name="rentalPricePerDay" value={formData.rentalPricePerDay} onChange={handleChange} type="number" prefix="Rp" />
                                                    <InputField label="Per Minggu" name="rentalPricePerWeek" value={formData.rentalPricePerWeek} onChange={handleChange} type="number" prefix="Rp" />
                                                    <InputField label="Per Bulan" name="rentalPricePerMonth" value={formData.rentalPricePerMonth} onChange={handleChange} type="number" prefix="Rp" />
                                                    <InputField label="Deposit" name="rentalDeposit" value={formData.rentalDeposit} onChange={handleChange} type="number" prefix="Rp" />
                                                </div>
                                            </div>
                                        )}

                                        <div className="pt-4 border-t border-slate-100">
                                            <label className="block text-sm font-bold text-slate-700 mb-2">Lokasi COD</label>
                                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                                {lokasiList.map(l => (
                                                    <button key={l} type="button" onClick={() => setFormData({ ...formData, lokasi: l })}
                                                        className={`px-3 py-2 rounded-lg border text-xs font-medium transition-all ${formData.lokasi === l ? 'border-blue-500 bg-blue-50 text-blue-600 shadow-sm' : 'border-slate-200 text-slate-600 hover:border-slate-300'}`}>
                                                        {l}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </Card>

                                {/* Submit Button - Mobile Only (lg and up shows in preview) */}
                                <button type="submit" disabled={loading}
                                    className="lg:hidden w-full py-4 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-2xl font-semibold disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-blue-500/25 transition-all hover:scale-[1.02] active:scale-[0.98]">
                                    {loading ? (
                                        <><Loader2 className="w-5 h-5 animate-spin" />Menyimpan...</>
                                    ) : (
                                        <><Rocket className="w-5 h-5" />{isEditMode ? 'Simpan Perubahan' : 'Pasang Iklan Sekarang'}</>
                                    )}
                                </button>

                            </div>
                        </div>
                    </form>
                </div>

                {/* Live Preview Section - Visible on all screens, stacks on mobile */}
                <div className="w-full lg:w-80 shrink-0">
                    <LivePreview formData={formData} preview={preview} user={user} handleSubmit={handleSubmit} loading={loading} isEditMode={isEditMode} />
                </div>
            </div>
        </div>
    );
}

// Card Component
const Card = ({ title, icon: Icon, children, important }) => (
    <div className={`bg-white rounded-2xl border overflow-hidden transition-all ${important ? 'border-blue-200 shadow-sm shadow-blue-100' : 'border-slate-200'}`}>
        <div className={`px-5 py-3 border-b flex items-center gap-2 ${important ? 'bg-gradient-to-r from-blue-50 to-white border-blue-100' : 'border-slate-100'}`}>
            <Icon className="w-5 h-5 text-blue-500" />
            <h3 className="font-semibold text-slate-900 text-sm">{title}</h3>
            {important && <span className="ml-auto text-xs text-blue-500 font-medium">Wajib</span>}
        </div>
        <div className="p-5">{children}</div>
    </div>
);

// Input Field
const InputField = ({ label, prefix, ...props }) => (
    <div>
        <label className="block text-xs font-medium text-slate-600 mb-1">{label}</label>
        <div className="relative">
            {prefix && <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">{prefix}</span>}
            <input {...props} className={`w-full ${prefix ? 'pl-10' : 'px-3'} pr-3 py-2.5 rounded-lg border border-slate-200 text-sm`} />
        </div>
    </div>
);

// Category Field Components
const FoodFields = ({ formData, setFormData, handleChange }) => (
    <div className="space-y-4">
        <InputField label="Tanggal Kadaluarsa" name="expiry" value={formData.expiry} onChange={handleChange} type="date" />
        <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Porsi</label>
            <select name="portion" value={formData.portion} onChange={handleChange} className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm">
                <option value="">Pilih porsi...</option>
                <option value="Per Pcs">Per Pcs</option>
                <option value="Per Pack">Per Pack</option>
                <option value="Per Box">Per Box</option>
            </select>
        </div>
        <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={formData.isHalal} onChange={e => setFormData({ ...formData, isHalal: e.target.checked })} className="size-4 rounded border-slate-300" />
                <span className="text-sm text-slate-700">Halal</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={formData.isPreOrder} onChange={e => setFormData({ ...formData, isPreOrder: e.target.checked })} className="size-4 rounded border-slate-300" />
                <span className="text-sm text-slate-700">Pre-Order</span>
            </label>
        </div>
    </div>
);

const ElektronikFields = ({ formData, handleChange }) => (
    <div className="space-y-3">
        <InputField label="Merek" name="elektronikBrand" value={formData.elektronikBrand} onChange={handleChange} placeholder="Apple, Samsung, dll" />
        <InputField label="Garansi" name="elektronikWarranty" value={formData.elektronikWarranty} onChange={handleChange} placeholder="6 bulan" />
        <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Spesifikasi</label>
            <textarea name="elektronikSpecs" value={formData.elektronikSpecs} onChange={handleChange} rows={2} placeholder="RAM 8GB, Storage 128GB, dll" className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm resize-none" />
        </div>
    </div>
);

const FashionFields = ({ formData, handleChange }) => (
    <div className="grid grid-cols-2 gap-3">
        <InputField label="Ukuran" name="fashionSize" value={formData.fashionSize} onChange={handleChange} placeholder="S, M, L, XL" />
        <InputField label="Warna" name="fashionColor" value={formData.fashionColor} onChange={handleChange} placeholder="Hitam" />
        <InputField label="Merek" name="fashionBrand" value={formData.fashionBrand} onChange={handleChange} placeholder="Uniqlo" />
        <InputField label="Bahan" name="fashionMaterial" value={formData.fashionMaterial} onChange={handleChange} placeholder="Cotton" />
    </div>
);

const BukuFields = ({ formData, handleChange }) => (
    <div className="grid grid-cols-2 gap-3">
        <InputField label="Penulis" name="bukuAuthor" value={formData.bukuAuthor} onChange={handleChange} />
        <InputField label="Penerbit" name="bukuPublisher" value={formData.bukuPublisher} onChange={handleChange} />
        <InputField label="Tahun Terbit" name="bukuYear" value={formData.bukuYear} onChange={handleChange} type="number" />
        <InputField label="ISBN" name="bukuIsbn" value={formData.bukuIsbn} onChange={handleChange} />
    </div>
);

const OtomotifFields = ({ formData, setFormData, handleChange }) => (
    <div className="space-y-4">
        <div className="grid grid-cols-3 gap-2">
            {[{ v: 'kendaraan', l: 'Kendaraan', i: Car }, { v: 'sparepart', l: 'Sparepart', i: Hammer }, { v: 'aksesoris', l: 'Aksesoris', i: Tag }].map(t => (
                <button key={t.v} type="button" onClick={() => setFormData({ ...formData, otomotifTipe: t.v })}
                    className={`p-2 rounded-lg border-2 text-center transition-all ${formData.otomotifTipe === t.v ? 'border-blue-500 bg-blue-50' : 'border-slate-200'}`}>
                    <div className="flex justify-center">
                        <t.i className={`w-5 h-5 ${formData.otomotifTipe === t.v ? 'text-blue-500' : 'text-slate-400'}`} />
                    </div>
                    <p className={`text-[10px] font-medium mt-0.5 ${formData.otomotifTipe === t.v ? 'text-blue-600' : 'text-slate-500'}`}>{t.l}</p>
                </button>
            ))}
        </div>
        {formData.otomotifTipe === 'kendaraan' && <div className="grid grid-cols-2 gap-3"><InputField label="Merek" name="otomotifBrand" value={formData.otomotifBrand} onChange={handleChange} /><InputField label="Tahun" name="otomotifYear" value={formData.otomotifYear} onChange={handleChange} type="number" /><div><label className="block text-xs font-medium text-slate-600 mb-1">Transmisi</label><select name="otomotifTransmission" value={formData.otomotifTransmission} onChange={handleChange} className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm"><option value="">Pilih</option><option value="Manual">Manual</option><option value="Matic">Matic</option></select></div><InputField label="CC Mesin" name="otomotifCc" value={formData.otomotifCc} onChange={handleChange} type="number" /></div>}
        {formData.otomotifTipe === 'sparepart' && <div className="grid grid-cols-2 gap-3"><div><label className="block text-xs font-medium text-slate-600 mb-1">Jenis Part</label><select name="otomotifJenisPart" value={formData.otomotifJenisPart} onChange={handleChange} className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm"><option value="">Pilih</option><option value="Mesin">Mesin</option><option value="Body">Body</option><option value="Elektrik">Elektrik</option><option value="Kaki-kaki">Kaki-kaki</option></select></div><div><label className="block text-xs font-medium text-slate-600 mb-1">Kondisi Part</label><select name="otomotifKondisiPart" value={formData.otomotifKondisiPart} onChange={handleChange} className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm"><option value="">Pilih</option><option value="OEM">OEM</option><option value="Aftermarket">Aftermarket</option><option value="Copotan">Copotan</option></select></div><div className="col-span-2"><InputField label="Kompatibel dengan" name="otomotifKompatibel" value={formData.otomotifKompatibel} onChange={handleChange} placeholder="Honda Beat, Yamaha NMAX" /></div></div>}
        {formData.otomotifTipe === 'aksesoris' && <div className="grid grid-cols-2 gap-3"><div><label className="block text-xs font-medium text-slate-600 mb-1">Jenis Aksesoris</label><select name="otomotifJenisAksesoris" value={formData.otomotifJenisAksesoris} onChange={handleChange} className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm"><option value="">Pilih</option><option value="Helm">Helm</option><option value="Jaket">Jaket</option><option value="Sarung Tangan">Sarung Tangan</option><option value="Sepatu">Sepatu</option></select></div><InputField label="Merek" name="otomotifBrand" value={formData.otomotifBrand} onChange={handleChange} placeholder="KYT, NHK" /><InputField label="Ukuran" name="otomotifUkuran" value={formData.otomotifUkuran} onChange={handleChange} placeholder="M, L, XL" /></div>}
    </div>
);

const JasaFields = ({ formData, setFormData, handleChange }) => (
    <div className="space-y-3">
        <InputField label="Jenis Layanan" name="jasaServiceType" value={formData.jasaServiceType} onChange={handleChange} placeholder="Les privat, Desain grafis" />
        <InputField label="Ketersediaan" name="jasaAvailability" value={formData.jasaAvailability} onChange={handleChange} placeholder="Senin-Jumat, Weekend" />
        <InputField label="Durasi Layanan" name="jasaDuration" value={formData.jasaDuration} onChange={handleChange} placeholder="1-2 jam" />
        <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Tipe Harga</label>
            <select name="jasaPriceType" value={formData.jasaPriceType} onChange={e => setFormData({ ...formData, jasaPriceType: e.target.value })} className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm">
                <option value="per jam">Per Jam</option>
                <option value="per hari">Per Hari</option>
                <option value="per project">Per Project</option>
            </select>
        </div>
    </div>
);

const PerabotanFields = ({ formData, handleChange }) => (
    <div className="space-y-3">
        <InputField label="Dimensi (PxLxT)" name="perabotanDimensions" value={formData.perabotanDimensions} onChange={handleChange} placeholder="100x50x80 cm" />
        <InputField label="Bahan Material" name="perabotanMaterial" value={formData.perabotanMaterial} onChange={handleChange} placeholder="Kayu jati, MDF" />
        <InputField label="Berat" name="perabotanWeight" value={formData.perabotanWeight} onChange={handleChange} placeholder="5 kg" />
    </div>
);

export default SellProductForm;
