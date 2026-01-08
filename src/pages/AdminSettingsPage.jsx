import { useState, useEffect } from 'react';
import {
    Settings, Globe, Palette, Shield, Mail, Save, RefreshCw,
    CheckCircle, AlertCircle, Image, Bell, AlertTriangle
} from 'lucide-react';
import api from '../services/api';
import useAuthStore from '../store/authStore';

// Move these components OUTSIDE of AdminSettingsPage to prevent re-creation on every render
const SettingCard = ({ title, description, children }) => (
    <div className="bg-[#1a2332] rounded-xl border border-[#2d3748] p-6">
        <div className="mb-4">
            <h3 className="font-semibold text-white">{title}</h3>
            <p className="text-sm text-[#606e8a]">{description}</p>
        </div>
        {children}
    </div>
);

const Toggle = ({ enabled, onChange, disabled }) => (
    <button
        type="button"
        onClick={() => !disabled && onChange(!enabled)}
        disabled={disabled}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${enabled ? 'bg-primary' : 'bg-[#2d3748]'
            } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${enabled ? 'translate-x-6' : 'translate-x-1'}`} />
    </button>
);

const AdminSettingsPage = () => {
    const { user } = useAuthStore();
    const isSuperAdmin = user?.role === 'super_admin';
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [settings, setSettings] = useState({
        siteName: 'LapakNesa',
        siteDescription: 'Marketplace Mahasiswa Sumatera Utara',
        maintenanceMode: false,
        allowRegistration: true,
        allowSellerVerification: true,
        maxProductImages: 5,
        maxFileSize: 5,
        contactEmail: 'admin@lapaknesa.id',
        contactWhatsapp: '',
        primaryColor: '#0d59f2',
        enableNotifications: true,
    });

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            setLoading(true);
            const response = await api.get('/admin/settings');
            if (response.data.success) {
                setSettings(response.data.data);
            }
        } catch (error) {
            console.error('Failed to fetch settings:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (key, value) => {
        setSettings(prev => ({ ...prev, [key]: value }));
        setMessage({ type: '', text: '' });
    };

    const handleSave = async () => {
        if (!isSuperAdmin) {
            setMessage({ type: 'error', text: 'Hanya Super Admin yang bisa mengubah pengaturan' });
            return;
        }

        setSaving(true);
        try {
            const response = await api.put('/admin/settings', settings);
            if (response.data.success) {
                setMessage({ type: 'success', text: 'Pengaturan berhasil disimpan!' });
                setTimeout(() => setMessage({ type: '', text: '' }), 3000);
            }
        } catch (error) {
            setMessage({ type: 'error', text: error.response?.data?.message || 'Gagal menyimpan pengaturan' });
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full min-h-[400px]">
                <RefreshCw className="w-8 h-8 text-primary animate-spin" />
            </div>
        );
    }

    return (
        <div className="p-6 md:p-8 space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white">
                        Pengaturan Situs
                    </h1>
                    <p className="text-sm text-[#606e8a] mt-1">Konfigurasi pengaturan platform</p>
                </div>
                <button
                    onClick={handleSave}
                    disabled={saving || !isSuperAdmin}
                    className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
                >
                    {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    Simpan Pengaturan
                </button>
            </div>

            {/* Warning for non-super admin */}
            {!isSuperAdmin && (
                <div className="bg-yellow-500/20 border border-yellow-500/30 text-yellow-400 px-4 py-3 rounded-lg flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5" />
                    Anda hanya bisa melihat pengaturan. Hanya Super Admin yang bisa mengubah.
                </div>
            )}

            {/* Message */}
            {message.text && (
                <div className={`p-4 rounded-lg flex items-center gap-2 ${message.type === 'success'
                    ? 'bg-green-500/20 border border-green-500/50 text-green-400'
                    : 'bg-red-500/20 border border-red-500/50 text-red-400'
                    }`}>
                    {message.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                    {message.text}
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* General Settings */}
                <SettingCard title="Informasi Situs" description="Nama dan deskripsi platform">
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-[#606e8a] mb-2">Nama Situs</label>
                            <input
                                type="text"
                                value={settings.siteName}
                                onChange={(e) => handleChange('siteName', e.target.value)}
                                disabled={!isSuperAdmin}
                                className="w-full px-4 py-2.5 bg-[#0f1520] border border-[#2d3748] rounded-lg text-white focus:ring-2 focus:ring-primary disabled:opacity-50"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-[#606e8a] mb-2">Deskripsi Situs</label>
                            <textarea
                                value={settings.siteDescription}
                                onChange={(e) => handleChange('siteDescription', e.target.value)}
                                disabled={!isSuperAdmin}
                                rows={3}
                                className="w-full px-4 py-2.5 bg-[#0f1520] border border-[#2d3748] rounded-lg text-white focus:ring-2 focus:ring-primary resize-none disabled:opacity-50"
                            />
                        </div>
                    </div>
                </SettingCard>

                {/* Contact Settings */}
                <SettingCard title="Kontak" description="Informasi kontak platform">
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-[#606e8a] mb-2">Email Kontak</label>
                            <input
                                type="email"
                                value={settings.contactEmail}
                                onChange={(e) => handleChange('contactEmail', e.target.value)}
                                disabled={!isSuperAdmin}
                                className="w-full px-4 py-2.5 bg-[#0f1520] border border-[#2d3748] rounded-lg text-white focus:ring-2 focus:ring-primary disabled:opacity-50"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-[#606e8a] mb-2">WhatsApp (opsional)</label>
                            <input
                                type="text"
                                value={settings.contactWhatsapp}
                                onChange={(e) => handleChange('contactWhatsapp', e.target.value)}
                                disabled={!isSuperAdmin}
                                placeholder="62812xxxx"
                                className="w-full px-4 py-2.5 bg-[#0f1520] border border-[#2d3748] rounded-lg text-white focus:ring-2 focus:ring-primary placeholder-[#606e8a] disabled:opacity-50"
                            />
                        </div>
                    </div>
                </SettingCard>

                {/* Upload Settings */}
                <SettingCard title="Upload" description="Pengaturan upload file">
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-[#606e8a] mb-2">Maksimal Gambar Produk</label>
                            <input
                                type="number"
                                min={1}
                                max={10}
                                value={settings.maxProductImages}
                                onChange={(e) => handleChange('maxProductImages', parseInt(e.target.value))}
                                disabled={!isSuperAdmin}
                                className="w-full px-4 py-2.5 bg-[#0f1520] border border-[#2d3748] rounded-lg text-white focus:ring-2 focus:ring-primary disabled:opacity-50"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-[#606e8a] mb-2">Maksimal Ukuran File (MB)</label>
                            <input
                                type="number"
                                min={1}
                                max={20}
                                value={settings.maxFileSize}
                                onChange={(e) => handleChange('maxFileSize', parseInt(e.target.value))}
                                disabled={!isSuperAdmin}
                                className="w-full px-4 py-2.5 bg-[#0f1520] border border-[#2d3748] rounded-lg text-white focus:ring-2 focus:ring-primary disabled:opacity-50"
                            />
                        </div>
                    </div>
                </SettingCard>

                {/* Feature Toggles */}
                <SettingCard title="Fitur" description="Aktifkan/nonaktifkan fitur">
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-white font-medium">Mode Maintenance</p>
                                <p className="text-xs text-[#606e8a]">Nonaktifkan akses publik sementara</p>
                            </div>
                            <Toggle enabled={settings.maintenanceMode} onChange={(v) => handleChange('maintenanceMode', v)} disabled={!isSuperAdmin} />
                        </div>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-white font-medium">Izinkan Registrasi</p>
                                <p className="text-xs text-[#606e8a]">Pengguna baru dapat mendaftar</p>
                            </div>
                            <Toggle enabled={settings.allowRegistration} onChange={(v) => handleChange('allowRegistration', v)} disabled={!isSuperAdmin} />
                        </div>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-white font-medium">Verifikasi Penjual</p>
                                <p className="text-xs text-[#606e8a]">Wajib verifikasi untuk jadi penjual</p>
                            </div>
                            <Toggle enabled={settings.allowSellerVerification} onChange={(v) => handleChange('allowSellerVerification', v)} disabled={!isSuperAdmin} />
                        </div>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-white font-medium">Notifikasi</p>
                                <p className="text-xs text-[#606e8a]">Kirim notifikasi ke pengguna</p>
                            </div>
                            <Toggle enabled={settings.enableNotifications} onChange={(v) => handleChange('enableNotifications', v)} disabled={!isSuperAdmin} />
                        </div>
                    </div>
                </SettingCard>
            </div>

            {/* Theme Settings */}
            <SettingCard title="Tampilan" description="Warna dan tema platform">
                <div className="flex items-center gap-4">
                    <div>
                        <label className="block text-sm font-medium text-[#606e8a] mb-2">Warna Utama</label>
                        <div className="flex items-center gap-3">
                            <input
                                type="color"
                                value={settings.primaryColor}
                                onChange={(e) => handleChange('primaryColor', e.target.value)}
                                disabled={!isSuperAdmin}
                                className="w-12 h-12 rounded-lg border border-[#2d3748] cursor-pointer disabled:opacity-50"
                            />
                            <input
                                type="text"
                                value={settings.primaryColor}
                                onChange={(e) => handleChange('primaryColor', e.target.value)}
                                disabled={!isSuperAdmin}
                                className="w-32 px-4 py-2.5 bg-[#0f1520] border border-[#2d3748] rounded-lg text-white font-mono focus:ring-2 focus:ring-primary disabled:opacity-50"
                            />
                        </div>
                    </div>
                </div>
            </SettingCard>
        </div>
    );
};

export default AdminSettingsPage;
