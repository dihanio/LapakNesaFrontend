import { useState, useEffect } from 'react';
import useAuthStore from '../store/authStore';
import CustomSelect from '../components/CustomSelect';
import api from '../services/api';
import { fakultasOptions } from '../constants/formOptions';
import { CheckCircle2, Clock, Upload, FileText, Phone, ShieldCheck, Loader2 } from 'lucide-react';

function SellerVerificationTab({ onSuccess }) {
    const { user, setUser } = useAuthStore();
    const [formData, setFormData] = useState({
        nim: '',
        fakultas: '',
        whatsapp: '',
    });
    const [ktmFile, setKtmFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [successMsg, setSuccessMsg] = useState('');

    // Pre-fill
    useEffect(() => {
        if (user) {
            setFormData({
                nim: user.nim || '',
                fakultas: user.fakultas || '',
                whatsapp: user.whatsapp ?
                    (user.whatsapp.startsWith('62') ? '0' + user.whatsapp.slice(2) : user.whatsapp)
                    : '',
            });
        }
    }, [user]);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 2 * 1024 * 1024) { // 2MB limit
                setError('Ukuran file maksimal 2MB');
                return;
            }
            setKtmFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccessMsg('');

        if (!formData.nim || !formData.fakultas || !formData.whatsapp) {
            setError('Semua data diri wajib diisi');
            return;
        }

        if (!ktmFile) {
            setError('Wajib upload foto KTM untuk verifikasi');
            return;
        }

        const waNumber = formData.whatsapp.replace(/\D/g, '');
        if (waNumber.length < 10 || waNumber.length > 15) {
            setError('Nomor WhatsApp tidak valid');
            return;
        }

        try {
            setLoading(true);
            const data = new FormData();
            data.append('nim', formData.nim);
            data.append('fakultas', formData.fakultas);
            data.append('whatsapp', formData.whatsapp.startsWith('08') ? '62' + formData.whatsapp.slice(1) : formData.whatsapp);
            data.append('role', 'penjual'); // Request upgrade
            data.append('ktmImage', ktmFile);

            const response = await api.put('/auth/complete-profile', data, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            setUser(response.data.data);
            setSuccessMsg('Pengajuan berhasil dikirim! Menunggu verifikasi admin.');
            if (onSuccess) onSuccess();
        } catch (err) {
            setError(err.response?.data?.message || 'Gagal mengirim pengajuan');
        } finally {
            setLoading(false);
        }
    };

    // If user is pending verification
    if (user?.verification?.status === 'pending') {
        return (
            <div className="w-full max-w-2xl mx-auto text-center py-12">
                <div className="bg-white p-8 rounded-[2.5rem] shadow-xl shadow-blue-900/5 border border-slate-100 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                    <div className="mx-auto w-24 h-24 bg-yellow-100 text-yellow-600 rounded-3xl flex items-center justify-center mb-6 relative z-10 animate-pulse">
                        <Clock className="w-12 h-12" />
                    </div>
                    <h2 className="text-2xl font-black text-slate-900 mb-2 relative z-10">Menunggu Verifikasi</h2>
                    <p className="text-slate-500 font-medium mb-8 relative z-10 leading-relaxed max-w-md mx-auto">
                        Data dan KTM Anda sedang diperiksa oleh Admin. Proses ini biasanya memakan waktu 1x24 jam.
                    </p>
                </div>
            </div>
        );
    }

    if (successMsg) {
        return (
            <div className="w-full max-w-2xl mx-auto text-center py-12">
                <div className="bg-white p-8 rounded-[2.5rem] shadow-xl shadow-blue-900/5 border border-slate-100">
                    <div className="mx-auto w-24 h-24 bg-green-100 text-green-600 rounded-3xl flex items-center justify-center mb-6">
                        <CheckCircle2 className="w-12 h-12" />
                    </div>
                    <h2 className="text-2xl font-black text-slate-900 mb-2">Pengajuan Terkirim!</h2>
                    <p className="text-slate-500 font-medium mb-8 leading-relaxed max-w-md mx-auto">
                        Terima kasih telah mendaftar. Kami akan segera memproses verifikasi akun penjual Anda.
                    </p>
                    <button
                        onClick={() => onSuccess && onSuccess()}
                        className="bg-blue-600 text-white px-8 py-3 rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/30"
                    >
                        Kembali ke Dashboard
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full max-w-3xl mx-auto py-6">
            <div className="rounded-[2.5rem] bg-white p-8 md:p-10 shadow-2xl shadow-blue-900/5 border border-slate-100 relative overflow-hidden">
                {/* Background decoration */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 opacity-50"></div>
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-50 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 opacity-50"></div>

                {/* Header */}
                <div className="text-center mb-10 relative z-10">
                    <div className="mx-auto w-20 h-20 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-blue-600/20 transform rotate-3">
                        <ShieldCheck className="text-white w-10 h-10" />
                    </div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">
                        Daftar Menjadi Penjual
                    </h1>
                    <p className="mt-3 text-slate-500 font-medium">
                        Upload KTM dan lengkapi data untuk mulai berjualan di LapakNesa
                    </p>
                </div>

                {error && (
                    <div className="mb-8 rounded-2xl bg-red-50 p-4 text-sm font-bold text-red-600 flex items-center gap-3 relative z-10 animate-shake">
                        <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center shrink-0">
                            <span className="text-lg">!</span>
                        </div>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
                    {/* NIM */}
                    <div>
                        <label className="block text-sm font-bold text-slate-900 mb-2">
                            Nomor Induk Mahasiswa (NIM)
                        </label>
                        <div className="relative group">
                            <input
                                type="text"
                                value={formData.nim}
                                onChange={(e) => setFormData({ ...formData, nim: e.target.value })}
                                className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3.5 pl-12 pr-4 text-sm font-medium shadow-sm transition-all focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 focus:outline-none"
                                placeholder="Contoh: 21050524001"
                            />
                            <div className="absolute left-4 top-3.5 text-slate-400 group-focus-within:text-blue-500 transition-colors">
                                <FileText className="w-5 h-5" />
                            </div>
                        </div>
                    </div>

                    {/* Fakultas */}
                    <div className="relative z-20"> {/* z-index to ensure dropdown is on top */}
                        <CustomSelect
                            options={fakultasOptions}
                            value={formData.fakultas}
                            onChange={(value) => setFormData({ ...formData, fakultas: value })}
                            placeholder="Pilih Fakultas"
                            icon="fi fi-rr-graduation-cap"
                            label="Fakultas"
                        />
                    </div>

                    {/* WhatsApp */}
                    <div>
                        <label className="block text-sm font-bold text-slate-900 mb-2">
                            Nomor WhatsApp
                        </label>
                        <div className="relative group">
                            <input
                                type="tel"
                                value={formData.whatsapp}
                                onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                                className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3.5 pl-12 pr-4 text-sm font-medium shadow-sm transition-all focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 focus:outline-none"
                                placeholder="08123456789"
                            />
                            <div className="absolute left-4 top-3.5 text-slate-400 group-focus-within:text-blue-500 transition-colors">
                                <Phone className="w-5 h-5" />
                            </div>
                        </div>
                    </div>

                    {/* KTM Upload */}
                    <div>
                        <label className="block text-sm font-bold text-slate-900 mb-2">
                            Foto KTM (Kartu Tanda Mahasiswa)
                        </label>
                        <div className={`mt-1 flex justify-center px-6 py-8 border-2 border-dashed rounded-3xl transition-all duration-300 ${ktmFile ? 'border-blue-500 bg-blue-50/50' : 'border-slate-300 hover:border-blue-400 hover:bg-slate-50'}`}>
                            <div className="space-y-2 text-center w-full">
                                {previewUrl ? (
                                    <div className="relative mb-4 group">
                                        <img src={previewUrl} alt="KTM Preview" className="mx-auto h-40 object-contain rounded-xl shadow-md bg-white p-2" />
                                        <button
                                            type="button"
                                            onClick={(e) => { e.preventDefault(); setKtmFile(null); setPreviewUrl(null); }}
                                            className="absolute -top-3 -right-3 bg-red-500 text-white p-1.5 rounded-full shadow-lg hover:bg-red-600 transition-transform hover:scale-110"
                                        >
                                            <div className="w-4 h-4 flex items-center justify-center font-bold">✕</div>
                                        </button>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center">
                                        <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-4">
                                            <Upload className="w-8 h-8" />
                                        </div>
                                        <label htmlFor="ktm-upload" className="cursor-pointer">
                                            <span className="text-blue-600 font-bold hover:underline">Upload Foto</span>
                                            <span className="text-slate-500 font-medium"> atau drag & drop</span>
                                            <input id="ktm-upload" name="ktm-upload" type="file" className="sr-only" accept="image/*" onChange={handleFileChange} />
                                        </label>
                                        <p className="text-xs text-slate-400 mt-2 font-medium">PNG, JPG up to 2MB</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Submit */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full flex items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 py-4 px-6 text-sm font-bold text-white shadow-xl shadow-blue-600/30 hover:shadow-blue-600/40 hover:-translate-y-1 transition-all disabled:opacity-50 disabled:hover:translate-y-0"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                Memproses...
                            </>
                        ) : (
                            <>
                                Ajukan Verifikasi
                                <ShieldCheck className="w-5 h-5" />
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default SellerVerificationTab;
