import { Link, useLocation } from 'react-router-dom';
import {
    Store, ShoppingBag, Shield, Scale, FileWarning, Info,
    ChevronRight, BookOpen, MapPin, AlertTriangle, Clock,
    Smartphone, CheckSquare, XCircle, Users
} from 'lucide-react';

const sidebarLinks = [
    { path: '/cara-jual', label: 'Cara Jual', icon: Store },
    { path: '/cara-beli', label: 'Cara Beli', icon: ShoppingBag },
    { path: '/tips-cod', label: 'Tips COD Aman', icon: Shield },
    { path: '/aturan', label: 'Aturan Platform', icon: Scale },
    { path: '/privasi', label: 'Kebijakan Privasi', icon: FileWarning },
    { path: '/tentang-kami', label: 'Tentang Kami', icon: Info },
];

function TipsCODPage() {
    const location = useLocation();

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Header Banner */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-12">
                <div className="max-w-6xl mx-auto px-4">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div>
                            <h1 className="text-3xl md:text-4xl font-bold mb-2">Pusat Bantuan</h1>
                            <p className="text-blue-100 text-lg">Panduan keamanan Cash On Delivery (COD)</p>
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
                                    Prioritas Keamanan
                                </span>
                                <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-4">
                                    Tips COD Aman
                                </h2>
                                <p className="text-slate-600 text-lg leading-relaxed">
                                    Keselamatanmu adalah prioritas nomor satu. Ikuti panduan ini untuk menghindari risiko kejahatan saat bertransaksi.
                                </p>
                            </div>

                            {/* Alert Utama */}
                            <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded-r-xl mb-10">
                                <h3 className="text-red-800 font-bold text-lg mb-2 flex items-center gap-2">
                                    Golden Rule
                                </h3>
                                <p className="text-red-700">
                                    "Jika ada sesuatu yang terasa mencurigakan atau terlalu memaksa, segera batalkan transaksi. Jangan ambil risiko!"
                                </p>
                            </div>

                            <div className="grid md:grid-cols-2 gap-8 mb-10">
                                {/* Do's */}
                                <div>
                                    <h3 className="text-xl font-bold text-slate-900 mb-4">
                                        Lakukan Ini (Do's)
                                    </h3>
                                    <ul className="space-y-4">
                                        <li className="flex gap-3">
                                            <div className="w-8 h-8 rounded-full bg-green-100 text-green-600 flex items-center justify-center flex-shrink-0">
                                                <Users className="w-4 h-4" />
                                            </div>
                                            <div>
                                                <h4 className="font-semibold text-slate-800">Bawa Teman</h4>
                                                <p className="text-sm text-slate-600">Ajak minimal 1 teman jika barang bernilai mahal.</p>
                                            </div>
                                        </li>
                                        <li className="flex gap-3">
                                            <div className="w-8 h-8 rounded-full bg-green-100 text-green-600 flex items-center justify-center flex-shrink-0">
                                                <MapPin className="w-4 h-4" />
                                            </div>
                                            <div>
                                                <h4 className="font-semibold text-slate-800">Tempat Ramai</h4>
                                                <p className="text-sm text-slate-600">Pilih lokasi publik di dalam kampus (Perpus, Kantin, Lobby).</p>
                                            </div>
                                        </li>
                                        <li className="flex gap-3">
                                            <div className="w-8 h-8 rounded-full bg-green-100 text-green-600 flex items-center justify-center flex-shrink-0">
                                                <Clock className="w-4 h-4" />
                                            </div>
                                            <div>
                                                <h4 className="font-semibold text-slate-800">Waktu Terang</h4>
                                                <p className="text-sm text-slate-600">Bertemu antara jam 08.00 - 16.00 WIB.</p>
                                            </div>
                                        </li>
                                    </ul>
                                </div>

                                {/* Don'ts */}
                                <div>
                                    <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                                        <XCircle className="w-6 h-6 text-red-500" />
                                        Hindari Ini (Don'ts)
                                    </h3>
                                    <ul className="space-y-4">
                                        <li className="flex gap-3">
                                            <div className="w-8 h-8 rounded-full bg-red-100 text-red-600 flex items-center justify-center flex-shrink-0">
                                                <MapPin className="w-4 h-4" />
                                            </div>
                                            <div>
                                                <h4 className="font-semibold text-slate-800">Tempat Sepi</h4>
                                                <p className="text-sm text-slate-600">Jangan mau diajak ke parkiran sepi, gang kecil, atau kosan pribadi.</p>
                                            </div>
                                        </li>
                                        <li className="flex gap-3">
                                            <div className="w-8 h-8 rounded-full bg-red-100 text-red-600 flex items-center justify-center flex-shrink-0">
                                                <Smartphone className="w-4 h-4" />
                                            </div>
                                            <div>
                                                <h4 className="font-semibold text-slate-800">Transfer Duluan</h4>
                                                <p className="text-sm text-slate-600">Jangan transfer DP sebelum melihat barangnya langsung.</p>
                                            </div>
                                        </li>
                                    </ul>
                                </div>
                            </div>

                            {/* Lokasi Aman */}
                            <div className="bg-slate-50 rounded-xl p-6 border border-slate-200">
                                <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                                    <MapPin className="w-5 h-5 text-blue-600" />
                                    Rekomendasi Lokasi Aman di UNESA
                                </h3>
                                <div className="grid sm:grid-cols-2 gap-4">
                                    <div className="bg-white p-4 rounded-lg border border-slate-100 shadow-sm">
                                        <h4 className="font-semibold text-slate-800 mb-1">Perpustakaan Pusat</h4>
                                        <p className="text-xs text-slate-500">Lidah Wetan, Gedung Learning Center</p>
                                    </div>
                                    <div className="bg-white p-4 rounded-lg border border-slate-100 shadow-sm">
                                        <h4 className="font-semibold text-slate-800 mb-1">Danau UNESA</h4>
                                        <p className="text-xs text-slate-500">Area kuliner atau jogging track yang ramai</p>
                                    </div>
                                    <div className="bg-white p-4 rounded-lg border border-slate-100 shadow-sm">
                                        <h4 className="font-semibold text-slate-800 mb-1">Lobby Fakultas</h4>
                                        <p className="text-xs text-slate-500">Semua fakultas di jam kuliah aktif</p>
                                    </div>
                                    <div className="bg-white p-4 rounded-lg border border-slate-100 shadow-sm">
                                        <h4 className="font-semibold text-slate-800 mb-1">Area Foodcourt</h4>
                                        <p className="text-xs text-slate-500">Kantin pusat atau kantin fakultas</p>
                                    </div>
                                </div>
                            </div>

                            {/* Contact Support */}
                            <div className="mt-8 text-center pt-8 border-t border-slate-100">
                                <p className="text-slate-600 mb-2">Merasa tidak aman atau menemukan penipuan?</p>
                                <a href="mailto:lapaknesa@unesa.ac.id" className="inline-flex items-center gap-2 text-blue-600 font-semibold hover:text-blue-700 hover:underline">
                                    Laporkan ke Admin <AlertTriangle className="w-4 h-4" />
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default TipsCODPage;
