import { Link, useLocation } from 'react-router-dom';
import {
    Store, ShoppingBag, Shield, Scale, FileWarning, Info,
    ChevronRight, BookOpen, Search, Eye, MessageCircle,
    MapPin, CheckCircle, Smile, AlertCircle
} from 'lucide-react';

const sidebarLinks = [
    { path: '/cara-jual', label: 'Cara Jual', icon: Store },
    { path: '/cara-beli', label: 'Cara Beli', icon: ShoppingBag },
    { path: '/tips-cod', label: 'Tips COD Aman', icon: Shield },
    { path: '/aturan', label: 'Aturan Platform', icon: Scale },
    { path: '/privasi', label: 'Kebijakan Privasi', icon: FileWarning },
    { path: '/tentang-kami', label: 'Tentang Kami', icon: Info },
];

function CaraBeliPage() {
    const location = useLocation();

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Header Banner */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-12">
                <div className="max-w-6xl mx-auto px-4">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div>
                            <h1 className="text-3xl md:text-4xl font-bold mb-2">Pusat Bantuan</h1>
                            <p className="text-blue-100 text-lg">Panduan lengkap belanja di LapakNesa</p>
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
                                    Panduan Pembeli
                                </span>
                                <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-4">
                                    Cara Belanja Aman
                                </h2>
                                <p className="text-slate-600 text-lg leading-relaxed">
                                    Ikuti panduan ini untuk mendapatkan barang impianmu dengan aman dan nyaman di lingkungan kampus UNESA.
                                </p>
                            </div>

                            {/* Steps Grid */}
                            <div className="grid gap-6 md:gap-8 relative">
                                {/* Vertical Line (Desktop) */}
                                <div className="hidden md:block absolute left-8 top-8 bottom-8 w-0.5 bg-slate-100"></div>

                                {/* Step 1 */}
                                <div className="relative pl-0 md:pl-24 group">
                                    <div className="hidden md:flex absolute left-0 top-0 w-16 h-16 bg-blue-50 rounded-2xl border border-blue-100 items-center justify-center text-blue-600 z-10 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">
                                        <Search className="w-7 h-7" />
                                    </div>
                                    <div className="bg-slate-50 rounded-xl p-6 border border-slate-100 hover:border-blue-200 hover:shadow-md transition-all duration-300">
                                        <div className="flex items-center gap-3 mb-3 md:hidden">
                                            <div className="p-2 bg-blue-100 text-blue-700 rounded-lg hidden">
                                                <Search className="w-5 h-5" />
                                            </div>
                                            <span className="font-semibold text-blue-600">Langkah 1</span>
                                        </div>
                                        <h3 className="text-xl font-bold text-slate-900 mb-2">Cari Barang</h3>
                                        <p className="text-slate-600 leading-relaxed">
                                            Gunakan fitur <strong>Pencarian</strong> atau jelajahi Kategori di homepage. Gunakan filter kondisi (Baru/Bekas) untuk hasil yang lebih spesifik.
                                        </p>
                                    </div>
                                </div>

                                {/* Step 2 */}
                                <div className="relative pl-0 md:pl-24 group">
                                    <div className="hidden md:flex absolute left-0 top-0 w-16 h-16 bg-indigo-50 rounded-2xl border border-indigo-100 items-center justify-center text-indigo-600 z-10 group-hover:bg-indigo-600 group-hover:text-white transition-colors duration-300">
                                        <Eye className="w-7 h-7" />
                                    </div>
                                    <div className="bg-slate-50 rounded-xl p-6 border border-slate-100 hover:border-indigo-200 hover:shadow-md transition-all duration-300">
                                        <h3 className="text-xl font-bold text-slate-900 mb-2">Cek Detail Produk</h3>
                                        <p className="text-slate-600 leading-relaxed mb-3">
                                            Baca deskripsi dengan teliti. Perhatikan kondisi barang, kelengkapan, dan minus (jika ada).
                                        </p>
                                    </div>
                                </div>

                                {/* Step 3 */}
                                <div className="relative pl-0 md:pl-24 group">
                                    <div className="hidden md:flex absolute left-0 top-0 w-16 h-16 bg-green-50 rounded-2xl border border-green-100 items-center justify-center text-green-600 z-10 group-hover:bg-green-600 group-hover:text-white transition-colors duration-300">
                                        <MessageCircle className="w-7 h-7" />
                                    </div>
                                    <div className="bg-slate-50 rounded-xl p-6 border border-slate-100 hover:border-green-200 hover:shadow-md transition-all duration-300">
                                        <h3 className="text-xl font-bold text-slate-900 mb-2">Chat Penjual</h3>
                                        <p className="text-slate-600 leading-relaxed mb-3">
                                            Klik tombol <strong>"Chat"</strong> untuk menghubungi penjual. Tanyakan detail yang kurang jelas atau minta foto terbaru.
                                        </p>
                                        <div className="p-3 bg-green-50 rounded-lg border border-green-100 text-sm text-green-800 italic">
                                            "Halo, apakah barang ini masih ada? Kondisinya bagaimana ya?"
                                        </div>
                                    </div>
                                </div>

                                {/* Step 4 */}
                                <div className="relative pl-0 md:pl-24 group">
                                    <div className="hidden md:flex absolute left-0 top-0 w-16 h-16 bg-purple-50 rounded-2xl border border-purple-100 items-center justify-center text-purple-600 z-10 group-hover:bg-purple-600 group-hover:text-white transition-colors duration-300">
                                        <MapPin className="w-7 h-7" />
                                    </div>
                                    <div className="bg-slate-50 rounded-xl p-6 border border-slate-100 hover:border-purple-200 hover:shadow-md transition-all duration-300">
                                        <h3 className="text-xl font-bold text-slate-900 mb-2">Janjian COD</h3>
                                        <p className="text-slate-600 leading-relaxed">
                                            Sepakati harga dan lokasi bertemu. Pilih tempat ramai di sekitar kampus seperti <strong>Perpus Pusat</strong> atau <strong>Danau UNESA</strong>.
                                        </p>
                                    </div>
                                </div>

                                {/* Step 5 */}
                                <div className="relative pl-0 md:pl-24 group">
                                    <div className="hidden md:flex absolute left-0 top-0 w-16 h-16 bg-orange-50 rounded-2xl border border-orange-100 items-center justify-center text-orange-600 z-10 group-hover:bg-orange-600 group-hover:text-white transition-colors duration-300">
                                        <CheckCircle className="w-7 h-7" />
                                    </div>
                                    <div className="bg-slate-50 rounded-xl p-6 border border-slate-100 hover:border-orange-200 hover:shadow-md transition-all duration-300">
                                        <h3 className="text-xl font-bold text-slate-900 mb-2">Cek & Bayar</h3>
                                        <p className="text-slate-600 leading-relaxed">
                                            Cek barang secara langsung. Jika sesuai, lakukan pembayaran (Tunai/QRIS).
                                            <span className="text-red-600 font-medium ml-1">Jangan transfer sebelum lihat barang!</span>
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Alert Box */}
                            <div className="mt-12 bg-red-50 rounded-2xl p-6 md:p-8 border border-red-100">
                                <div className="flex items-start gap-4">
                                    <div className="p-3 bg-red-100 text-red-600 rounded-xl flex-shrink-0">
                                        <AlertCircle className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-red-900 mb-2">Penting: Anti Penipuan</h3>
                                        <ul className="space-y-2 text-red-800/80">
                                            <li>• Jangan pernah mau transfer "DP" (Down Payment) duluan.</li>
                                            <li>• Jangan mau diajak ketemuan di tempat sepi/gelap.</li>
                                            <li>• Waspada harga terlalu murah tidak masuk akal.</li>
                                        </ul>
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

export default CaraBeliPage;
