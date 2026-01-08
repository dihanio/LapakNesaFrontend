import { Link, useLocation } from 'react-router-dom';
import {
    Store, ShoppingBag, Shield, Scale, FileWarning, Info,
    ChevronRight, BookOpen, Target, Heart, Award,
    Zap, Users, GraduationCap, Globe
} from 'lucide-react';

const sidebarLinks = [
    { path: '/cara-jual', label: 'Cara Jual', icon: Store },
    { path: '/cara-beli', label: 'Cara Beli', icon: ShoppingBag },
    { path: '/tips-cod', label: 'Tips COD Aman', icon: Shield },
    { path: '/aturan', label: 'Aturan Platform', icon: Scale },
    { path: '/privasi', label: 'Kebijakan Privasi', icon: FileWarning },
    { path: '/tentang-kami', label: 'Tentang Kami', icon: Info },
];

function TentangKamiPage() {
    const location = useLocation();

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Header Banner */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-12">
                <div className="max-w-6xl mx-auto px-4">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div>
                            <h1 className="text-3xl md:text-4xl font-bold mb-2">Pusat Bantuan</h1>
                            <p className="text-blue-100 text-lg">Mengenal lebih dekat platform mahasiswa UNESA</p>
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
                                    Profil Platform
                                </span>
                                <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-4">
                                    Tentang LapakNesa
                                </h2>
                                <p className="text-slate-600 text-lg leading-relaxed">
                                    Platform jual beli eksklusif yang menghubungkan ribuan mahasiswa Universitas Negeri Surabaya dalam satu ekosistem ekonomi kreatif.
                                </p>
                            </div>

                            <div className="space-y-10">
                                {/* Visi Misi */}
                                <div className="grid md:grid-cols-2 gap-6">
                                    <div className="bg-blue-50/50 p-6 rounded-xl border border-blue-100">

                                        <h3 className="text-lg font-bold text-slate-900 mb-3">Visi Kami</h3>
                                        <p className="text-slate-600 leading-relaxed text-sm">
                                            Menjadi pusat ekonomi sirkular terpercaya di lingkungan kampus yang mendukung gaya hidup hemat, aman, dan berkelanjutan bagi seluruh civitas akademika UNESA.
                                        </p>
                                    </div>
                                    <div className="bg-indigo-50/50 p-6 rounded-xl border border-indigo-100">

                                        <h3 className="text-lg font-bold text-slate-900 mb-2">Misi Utama</h3>
                                        <ul className="space-y-2 text-sm text-slate-600">
                                            <li className="flex gap-2">
                                                <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-2 flex-shrink-0"></div>
                                                <span>Menyediakan wadah transaksi yang aman (Verified Students Only).</span>
                                            </li>
                                            <li className="flex gap-2">
                                                <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-2 flex-shrink-0"></div>
                                                <span>Mendukung mahasiswa berwirausaha.</span>
                                            </li>
                                            <li className="flex gap-2">
                                                <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-2 flex-shrink-0"></div>
                                                <span>Mengurangi limbah barang bekas layak pakai.</span>
                                            </li>
                                        </ul>
                                    </div>
                                </div>

                                {/* Why Us */}
                                <div>
                                    <h3 className="text-xl font-bold text-slate-900 mb-6 text-center">Kenapa Memilih LapakNesa?</h3>
                                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                        {[
                                            { icon: GraduationCap, color: "text-blue-600", bg: "bg-blue-100", title: "Eksklusif", desc: "Hanya untuk mahasiswa UNESA." },
                                            { icon: Shield, color: "text-green-600", bg: "bg-green-100", title: "Terverifikasi", desc: "Keamanan transaksi lebih terjamin." },
                                            { icon: Zap, color: "text-yellow-600", bg: "bg-yellow-100", title: "Cepat", desc: "Fitur chat real-time & notifikasi." },
                                            { icon: Globe, color: "text-purple-600", bg: "bg-purple-100", title: "Lokal", desc: "COD mudah di area kampus." }
                                        ].map((item, i) => (
                                            <div key={i} className="text-center p-4 rounded-xl border border-slate-100 hover:shadow-sm transition-shadow">
                                                <div className={`w-12 h-12 mx-auto ${item.bg} ${item.color} rounded-full flex items-center justify-center mb-3`}>
                                                    <item.icon className="w-6 h-6" />
                                                </div>
                                                <h4 className="font-bold text-slate-900 mb-1">{item.title}</h4>
                                                <p className="text-xs text-slate-500">{item.desc}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Community Section */}
                                <div className="border-t border-slate-200 pt-10 mt-10 text-center">
                                    <div className="inline-flex items-center justify-center p-3 bg-red-50 rounded-full mb-6 relative">
                                        <Heart className="w-8 h-8 text-red-500 fill-current animate-pulse" />
                                        <div className="absolute inset-0 bg-red-200 rounded-full opacity-20 animate-ping"></div>
                                    </div>

                                    <h3 className="text-2xl font-bold text-slate-800 mb-3">
                                        Dari Mahasiswa, Untuk Mahasiswa
                                    </h3>

                                    <p className="text-slate-600 max-w-xl mx-auto leading-relaxed mb-8 text-lg">
                                        LapakNesa ini murni karya <span className="font-semibold text-indigo-600">anak UNESA</span>, lho. Kita bikin ini biar gampang jual beli, cari barang murah, atau nawarin jasa di lingkungan kampus sendiri. Yuk, ramein dan saling support!
                                    </p>

                                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                                        <a
                                            href="#"
                                            className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl transition-all shadow-lg shadow-indigo-200 hover:shadow-indigo-300 transform hover:-translate-y-0.5 flex items-center gap-2"
                                        >
                                            <Users className="w-5 h-5" />
                                            Gabung Komunitas
                                        </a>
                                        <div className="text-slate-400 text-sm font-medium px-4">
                                            atau
                                        </div>
                                        <a
                                            href="mailto:lapaknesa@unesa.ac.id"
                                            className="px-8 py-3 bg-white border-2 border-slate-200 hover:border-indigo-200 text-slate-600 hover:text-indigo-600 font-medium rounded-xl transition-all flex items-center gap-2"
                                        >
                                            Hubungi Kami
                                        </a>
                                    </div>

                                    <div className="mt-12 flex items-center justify-center gap-3 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
                                        <img src="/logo-unesa.png" alt="UNESA" className="h-10 object-contain" onError={(e) => e.target.style.display = 'none'} />
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

export default TentangKamiPage;
