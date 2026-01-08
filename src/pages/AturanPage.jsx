import { Link, useLocation } from 'react-router-dom';
import {
    Store, ShoppingBag, Shield, Scale, FileWarning, Info,
    ChevronRight, BookOpen, Ban, CheckCircle, AlertTriangle,
    Gavel, BadgeCheck, Users, HelpCircle
} from 'lucide-react';

const sidebarLinks = [
    { path: '/cara-jual', label: 'Cara Jual', icon: Store },
    { path: '/cara-beli', label: 'Cara Beli', icon: ShoppingBag },
    { path: '/tips-cod', label: 'Tips COD Aman', icon: Shield },
    { path: '/aturan', label: 'Aturan Platform', icon: Scale },
    { path: '/privasi', label: 'Kebijakan Privasi', icon: FileWarning },
    { path: '/tentang-kami', label: 'Tentang Kami', icon: Info },
];

function AturanPage() {
    const location = useLocation();

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Header Banner */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-12">
                <div className="max-w-6xl mx-auto px-4">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div>
                            <h1 className="text-3xl md:text-4xl font-bold mb-2">Pusat Bantuan</h1>
                            <p className="text-blue-100 text-lg">Pedoman komunitas dan aturan penggunaan</p>
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
                                    Kode Etik
                                </span>
                                <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-4">
                                    Aturan & Ketentuan
                                </h2>
                                <p className="text-slate-600 text-lg leading-relaxed">
                                    Demi kenyamanan bersama, seluruh pengguna LapakNesa wajib mematuhi aturan berikut ini.
                                </p>
                            </div>

                            <div className="grid gap-8">
                                {/* Aturan Umum */}
                                <div className="bg-slate-50 rounded-xl p-6 border border-slate-200">
                                    <h3 className="text-lg font-bold text-slate-900 mb-4">
                                        1. Aturan Umum Pengguna
                                    </h3>
                                    <ul className="space-y-3">
                                        {[
                                            "Pengguna wajib mahasiswa aktif UNESA yang terverifikasi.",
                                            "Wajib menggunakan identitas asli (Nama & NIM).",
                                            "Dilarang melakukan spam atau promosi di luar konteks jual beli.",
                                            "Jaga sopan santun dalam chat maupun deskripsi produk."
                                        ].map((item, i) => (
                                            <li key={i} className="flex gap-3 text-slate-700">
                                                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                                                <span>{item}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                {/* Penjual & Pembeli Grid */}
                                <div className="grid md:grid-cols-2 gap-6">
                                    {/* Penjual */}
                                    <div className="bg-slate-50 rounded-xl p-6 border border-slate-200">
                                        <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                                            <Store className="w-5 h-5 text-indigo-600" />
                                            2. Untuk Penjual
                                        </h3>
                                        <ul className="space-y-3">
                                            {[
                                                "Foto produk harus asli (Real Pict).",
                                                "Deskripsi jujur, sebutkan jika ada minus.",
                                                "Harga wajar & masuk akal.",
                                                "Responsif membalas chat pembeli."
                                            ].map((item, i) => (
                                                <li key={i} className="flex gap-3 text-sm text-slate-700">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-2 flex-shrink-0"></div>
                                                    <span>{item}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>

                                    {/* Pembeli */}
                                    <div className="bg-slate-50 rounded-xl p-6 border border-slate-200">
                                        <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                                            <ShoppingBag className="w-5 h-5 text-teal-600" />
                                            3. Untuk Pembeli
                                        </h3>
                                        <ul className="space-y-3">
                                            {[
                                                "Baca deskripsi sebelum bertanya.",
                                                "Dilarang 'Hit and Run' (Deal lalu kabur).",
                                                "Datang tepat waktu saat COD.",
                                                "Cek barang dengan teliti di tempat."
                                            ].map((item, i) => (
                                                <li key={i} className="flex gap-3 text-sm text-slate-700">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-teal-400 mt-2 flex-shrink-0"></div>
                                                    <span>{item}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>

                                {/* Barang Terlarang */}
                                <div className="bg-red-50 rounded-xl p-6 border border-red-100">
                                    <h3 className="text-lg font-bold text-red-800 mb-4 flex items-center gap-2">
                                        <Ban className="w-5 h-5" />
                                        4. Barang Sangat Dilarang (Prohibited Items)
                                    </h3>
                                    <div className="grid sm:grid-cols-2 gap-4">
                                        {[
                                            "Narkoba, Obat-obatan terlarang & Alkohol",
                                            "Senjata tajam, Senjata api & Bahan peledak",
                                            "Barang hasil curian / Penadahan",
                                            "Akun/Joki tugas ilegal",
                                            "Produk dewasa / Konten pornografi",
                                            "Hewan peliharaan yang dilindungi"
                                        ].map((item, i) => (
                                            <div key={i} className="flex items-center gap-2 text-red-700 bg-white/50 p-2 rounded-lg border border-red-100/50">
                                                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                                                <span className="text-sm font-medium">{item}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Sanksi */}
                                <div className="border border-slate-200 rounded-xl p-6">
                                    <h3 className="text-lg font-bold text-slate-900 mb-3 flex items-center gap-2">
                                        <Gavel className="w-5 h-5 text-slate-600" />
                                        5. Sanksi Pelanggaran
                                    </h3>
                                    <p className="text-slate-600 mb-4 text-sm">
                                        Admin berhak memberikan sanksi bertahap bagi pengguna yang melanggar aturan di atas.
                                    </p>
                                    <div className="flex flex-wrap gap-2 text-sm font-semibold text-slate-700">
                                        <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full border border-yellow-200">1. Peringatan</span>
                                        <span className="text-slate-400">➔</span>
                                        <span className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full border border-orange-200">2. Suspend Sementara</span>
                                        <span className="text-slate-400">➔</span>
                                        <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full border border-red-200">3. Ban Permanen</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AturanPage;
