import { Link, useLocation } from 'react-router-dom';
import {
    Store, ShoppingBag, Shield, Scale, FileWarning, Info,
    ChevronRight, BookOpen, Lock, Server, Eye, Database,
    UserCheck, FileText, AlertCircle
} from 'lucide-react';

const sidebarLinks = [
    { path: '/cara-jual', label: 'Cara Jual', icon: Store },
    { path: '/cara-beli', label: 'Cara Beli', icon: ShoppingBag },
    { path: '/tips-cod', label: 'Tips COD Aman', icon: Shield },
    { path: '/aturan', label: 'Aturan Platform', icon: Scale },
    { path: '/privasi', label: 'Kebijakan Privasi', icon: FileWarning },
    { path: '/tentang-kami', label: 'Tentang Kami', icon: Info },
];

function PrivasiPage() {
    const location = useLocation();

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Header Banner */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-12">
                <div className="max-w-6xl mx-auto px-4">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div>
                            <h1 className="text-3xl md:text-4xl font-bold mb-2">Pusat Bantuan</h1>
                            <p className="text-blue-100 text-lg">Transparansi dan keamanan data Anda</p>
                        </div>
                        <div className="hidden md:block">
                            <BookOpen className="w-24 h-24 text-white/10" />
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-4 -mt-8">
                <div className="flex flex-col md:flex-row gap-8">
                    {/* Sidebar Navigation */}
                    <div className="md:w-64 flex-shrink-0">
                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 sticky top-24 overflow-hidden">
                            <div className="p-4 border-b border-slate-100">
                                <h3 className="font-semibold text-slate-800">Menu Bantuan</h3>
                            </div>
                            <nav className="p-2 space-y-1">
                                {sidebarLinks.map((link) => {
                                    const Icon = link.icon;
                                    const isActive = location.pathname === link.path;
                                    return (
                                        <Link
                                            key={link.path}
                                            to={link.path}
                                            className={`flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-all ${isActive
                                                ? 'bg-blue-50 text-blue-700'
                                                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                                                }`}
                                        >
                                            <Icon className={`w-4 h-4 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
                                            {link.label}
                                            {isActive && <ChevronRight className="w-4 h-4 ml-auto" />}
                                        </Link>
                                    );
                                })}
                            </nav>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="flex-1 pb-16">
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-8">
                            <div className="mb-8">
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-semibold uppercase tracking-wide mb-3">
                                    Data & Privasi
                                </span>
                                <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-4">
                                    Kebijakan Privasi
                                </h2>
                                <p className="text-slate-600 text-lg leading-relaxed border-l-4 border-blue-500 pl-4 bg-slate-50 py-2 rounded-r-lg">
                                    LapakNesa berkomitmen penuh untuk melindungi privasi data mahasiswa UNESA.
                                    Kami transparan mengenai data apa yang kami kumpulkan dan bagaimana kami menggunakannya.
                                </p>
                            </div>

                            <div className="space-y-8">
                                {/* Collection */}
                                <div>
                                    <h3 className="text-xl font-bold text-slate-900 mb-4">
                                        1. Data yang Kami Kumpulkan
                                    </h3>
                                    <div className="grid md:grid-cols-2 gap-4">
                                        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                                            <h4 className="font-semibold text-slate-800 mb-2">Informasi Akun</h4>
                                            <p className="text-sm text-slate-600">Nama Lengkap, Foto Profil (opsional), Jurusan, dan Angkatan untuk keperluan verifikasi.</p>
                                        </div>
                                        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                                            <h4 className="font-semibold text-slate-800 mb-2">Kontak & Verifikasi</h4>
                                            <p className="text-sm text-slate-600">Email Mahasiswa (SSO), Nomor WhatsApp (untuk fitur Chat/Call), dan NIM.</p>
                                        </div>
                                        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                                            <h4 className="font-semibold text-slate-800 mb-2">Aktivitas Platform</h4>
                                            <p className="text-sm text-slate-600">Listing produk yang kamu buat, riwayat chat, dan wishlist produk.</p>
                                        </div>
                                        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                                            <h4 className="font-semibold text-slate-800 mb-2">Cookies</h4>
                                            <p className="text-sm text-slate-600">Kami menggunakan cookies untuk menyimpan sesi login agar kamu tidak perlu login berulang kali.</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Usage */}
                                <div>
                                    <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                                        <Server className="w-6 h-6 text-indigo-600" />
                                        2. Penggunaan Data
                                    </h3>
                                    <ul className="space-y-3">
                                        {[
                                            "Memverifikasi bahwa kamu benar-benar mahasiswa aktif UNESA.",
                                            "Menghubungkan penjual dan pembeli melalui fitur chat.",
                                            "Menampilkan produk yang relevan di beranda.",
                                            "Keamanan: Mendeteksi aktivitas mencurigakan atau penipuan."
                                        ].map((item, i) => (
                                            <li key={i} className="flex gap-3 text-slate-700">
                                                <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center flex-shrink-0 text-xs font-bold">{i + 1}</div>
                                                <span>{item}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                {/* Protection Badge */}
                                <div className="bg-green-50 border border-green-200 rounded-2xl p-6 md:p-8 text-center">
                                    <Shield className="w-12 h-12 text-green-600 mx-auto mb-4" />
                                    <h3 className="text-xl font-bold text-green-800 mb-2">Data Kamu Aman</h3>
                                    <p className="text-green-700 max-w-2xl mx-auto">
                                        Kami <strong>TIDAK PERNAH</strong> menjual atau membagikan data pribadimu kepada pihak ketiga untuk kepentingan iklan/marketing.
                                        Semua password dienkripsi dengan standar keamanan tinggi.
                                    </p>
                                </div>

                                {/* User Rights */}
                                <div>
                                    <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                                        <UserCheck className="w-6 h-6 text-teal-600" />
                                        3. Hak Pengguna
                                    </h3>
                                    <div className="prose prose-slate text-slate-600">
                                        <p>Sebagai pengguna, kamu memiliki hak penuh untuk:</p>
                                        <ul className="list-disc pl-5 space-y-1">
                                            <li>Mengakses dan mengedit profil pribadimu kapan saja.</li>
                                            <li>Menghapus semua produk yang kamu jual.</li>
                                            <li>Meminta penghapusan akun permanen beserta seluruh datanya dengan menghubungi admin.</li>
                                        </ul>
                                    </div>
                                </div>

                                {/* Contact */}
                                <div className="pt-6 border-t border-slate-100">
                                    <p className="text-sm text-slate-500 text-center">
                                        Ada pertanyaan spesifik mengenai data? Hubungi Data Protection Officer kami di{' '}
                                        <a href="mailto:privacy@lapaknesa.unesa.ac.id" className="text-blue-600 hover:underline">
                                            privacy@lapaknesa.unesa.ac.id
                                        </a>
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default PrivasiPage;
