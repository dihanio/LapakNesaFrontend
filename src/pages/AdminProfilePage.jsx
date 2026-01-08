import { useState, useRef } from 'react';
import { User, Upload, Save, Shield, ShieldAlert, CheckCircle, AlertCircle, RefreshCw, Mail, BadgeCheck } from 'lucide-react';
import useAuthStore from '../store/authStore';
import api from '../services/api';

const AdminProfilePage = () => {
    const { user, setUser } = useAuthStore();
    const [nama, setNama] = useState(user?.nama || '');
    const [avatar, setAvatar] = useState(user?.avatar || '');
    const [previewAvatar, setPreviewAvatar] = useState(user?.avatar || '');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const fileInputRef = useRef(null);

    const handleAvatarChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 2 * 1024 * 1024) {
                setMessage({ type: 'error', text: 'Ukuran file maksimal 2MB' });
                return;
            }
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewAvatar(reader.result);
                setAvatar(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ type: '', text: '' });

        try {
            const response = await api.put('/auth/profile', {
                nama: nama.trim(),
                avatar: avatar || user?.avatar,
            });
            if (response.data.success) {
                setUser(response.data.data);
                setMessage({ type: 'success', text: 'Profil berhasil diperbarui!' });
            }
        } catch (error) {
            setMessage({ type: 'error', text: error.response?.data?.message || 'Gagal memperbarui profil' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6 md:p-8 max-w-2xl mx-auto">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-white">
                    Edit Profil Admin
                </h1>
                <p className="text-[#606e8a] mt-1">Perbarui nama dan foto profil Anda</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Avatar Section */}
                <div className="bg-[#1a2332] rounded-xl border border-[#2d3748] p-6">
                    <h2 className="text-lg font-semibold text-white mb-4">Foto Profil</h2>
                    <div className="flex items-center gap-6">
                        <div className="relative group">
                            <div className="size-24 rounded-full bg-gradient-to-br from-primary/20 to-primary/40 flex items-center justify-center overflow-hidden border-4 border-[#2d3748] shadow-lg">
                                {previewAvatar ? (
                                    <img src={previewAvatar} alt="Avatar" className="size-full object-cover" />
                                ) : (
                                    <span className="text-3xl font-bold text-primary">{nama?.charAt(0)?.toUpperCase() || 'A'}</span>
                                )}
                            </div>
                            {(user?.role === 'admin' || user?.role === 'super_admin') && (
                                <div className="absolute -bottom-1 -right-1 size-8 bg-blue-500 rounded-full flex items-center justify-center border-2 border-[#1a2332] shadow">
                                    <BadgeCheck className="w-4 h-4 text-white" />
                                </div>
                            )}
                        </div>

                        <div className="flex-1">
                            <input type="file" ref={fileInputRef} onChange={handleAvatarChange} accept="image/*" className="hidden" />
                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                className="px-4 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors flex items-center gap-2"
                            >
                                <Upload className="w-4 h-4" />
                                Upload Foto
                            </button>
                            <p className="text-xs text-[#606e8a] mt-2">JPG, PNG, atau GIF. Maks 2MB.</p>
                        </div>
                    </div>
                </div>

                {/* Name Section */}
                <div className="bg-[#1a2332] rounded-xl border border-[#2d3748] p-6">
                    <h2 className="text-lg font-semibold text-white mb-4">Informasi Akun</h2>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-[#606e8a] mb-2">Nama Lengkap</label>
                            <input
                                type="text"
                                value={nama}
                                onChange={(e) => setNama(e.target.value)}
                                className="w-full px-4 py-3 bg-[#0f1520] border border-[#2d3748] rounded-lg text-white focus:ring-2 focus:ring-primary placeholder-[#606e8a]"
                                placeholder="Masukkan nama lengkap"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-[#606e8a] mb-2 flex items-center gap-1">
                                <Mail className="w-3 h-3" />
                                Email
                            </label>
                            <input
                                type="email"
                                value={user?.email || ''}
                                disabled
                                className="w-full px-4 py-3 bg-[#0f1520]/50 border border-[#2d3748] rounded-lg text-[#606e8a] cursor-not-allowed"
                            />
                            <p className="text-xs text-[#606e8a] mt-1">Email tidak dapat diubah</p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-[#606e8a] mb-2">Role</label>
                            <div className="flex items-center gap-2">
                                {user?.role === 'super_admin' ? (
                                    <span className="px-3 py-1.5 bg-gradient-to-r from-purple-500 to-blue-500 text-white text-sm font-bold rounded-lg flex items-center gap-2">
                                        <Shield className="w-4 h-4" />
                                        Super Admin
                                    </span>
                                ) : (
                                    <span className="px-3 py-1.5 bg-blue-500 text-white text-sm font-bold rounded-lg flex items-center gap-2">
                                        <ShieldAlert className="w-4 h-4" />
                                        Admin
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Message */}
                {message.text && (
                    <div className={`p-4 rounded-lg flex items-center gap-2 ${message.type === 'success' ? 'bg-green-500/20 border border-green-500/50 text-green-400' : 'bg-red-500/20 border border-red-500/50 text-red-400'}`}>
                        {message.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                        {message.text}
                    </div>
                )}

                {/* Submit Button */}
                <div className="flex justify-end">
                    <button
                        type="submit"
                        disabled={loading}
                        className="px-6 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary/90 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? (
                            <>
                                <RefreshCw className="w-4 h-4 animate-spin" />
                                Menyimpan...
                            </>
                        ) : (
                            <>
                                <Save className="w-4 h-4" />
                                Simpan Perubahan
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AdminProfilePage;
