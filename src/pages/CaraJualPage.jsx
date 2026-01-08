import { Link, useLocation } from 'react-router-dom';
import {
    LogIn, UserCheck, Store, FileText, Upload, MessageCircle,
    Lightbulb, ChevronRight, HelpCircle, Shield, ShoppingBag,
    BookOpen, Scale, FileWarning, Info
} from 'lucide-react';

const sidebarLinks = [
    { path: '/cara-jual', label: 'Cara Jual', icon: Store },
    { path: '/cara-beli', label: 'Cara Beli', icon: ShoppingBag },
    { path: '/tips-cod', label: 'Tips COD Aman', icon: Shield },
    { path: '/aturan', label: 'Aturan Platform', icon: Scale },
    { path: '/privasi', label: 'Kebijakan Privasi', icon: FileWarning },
    { path: '/tentang-kami', label: 'Tentang Kami', icon: Info },
];

function CaraJualPage() {
    const location = useLocation();

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Header Banner */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-12">
                <div className="max-w-6xl mx-auto px-4">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div>
                            <h1 className="text-3xl md:text-4xl font-bold mb-2">Pusat Bantuan</h1>
                            <p className="text-blue-100 text-lg">Panduan lengkap berjualan di LapakNesa</p>
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
                                    Panduan Penjual
                                </span>
                                <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-4">
                                    Cara Mulai Berjualan
                                </h2>
                                <p className="text-slate-600 text-lg leading-relaxed">
                                    Ikuti 6 langkah mudah berikut untuk mulai menawarkan produkmu kepada ratusan mahasiswa UNESA lainnya.
                                </p>
                            </div>

                            {/* Steps Grid */}
                            <div className="grid gap-6 md:gap-8 relative">
                                {/* Vertical Line (Desktop) */}
                                <div className="hidden md:block absolute left-8 top-8 bottom-8 w-0.5 bg-slate-100"></div>

                                {/* Step 1 */}
                                <div className="relative pl-0 md:pl-24 group">
                                    <div className="hidden md:flex absolute left-0 top-0 w-16 h-16 bg-blue-50 rounded-2xl border border-blue-100 items-center justify-center text-blue-600 z-10 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">
                                        <LogIn className="w-7 h-7" />
                                    </div>
                                    <div className="bg-slate-50 rounded-xl p-6 border border-slate-100 hover:border-blue-200 hover:shadow-md transition-all duration-300">
                                        <div className="flex items-center gap-3 mb-3 md:hidden">
                                            <div className="p-2 bg-blue-100 text-blue-700 rounded-lg hidden">
                                                <LogIn className="w-5 h-5" />
                                            </div>
                                            <span className="font-semibold text-blue-600">Langkah 1</span>
                                        </div>
                                        <h3 className="text-xl font-bold text-slate-900 mb-2">Login dengan Akun Siakadu</h3>
                                        <p className="text-slate-600 leading-relaxed">
                                            Masuk menggunakan akun Google <strong>@mhs.unesa.ac.id</strong> kamu. Sistem otomatis mendeteksi status mahasiswa aktifmu.
                                        </p>
                                    </div>
                                </div>

                                {/* Step 2 */}
                                <div className="relative pl-0 md:pl-24 group">
                                    <div className="hidden md:flex absolute left-0 top-0 w-16 h-16 bg-indigo-50 rounded-2xl border border-indigo-100 items-center justify-center text-indigo-600 z-10 group-hover:bg-indigo-600 group-hover:text-white transition-colors duration-300">
                                        <UserCheck className="w-7 h-7" />
                                    </div>
                                    <div className="bg-slate-50 rounded-xl p-6 border border-slate-100 hover:border-indigo-200 hover:shadow-md transition-all duration-300">
                                        <div className="flex items-center gap-3 mb-3 md:hidden">
                                            <div className="p-2 bg-indigo-100 text-indigo-700 rounded-lg">
                                                <UserCheck className="w-5 h-5" />
                                            </div>
                                            <span className="font-semibold text-indigo-600">Langkah 2</span>
                                        </div>
                                        <h3 className="text-xl font-bold text-slate-900 mb-2">Lengkapi Profil & Verifikasi</h3>
                                        <p className="text-slate-600 leading-relaxed mb-3">
                                            Lengkapi data diri (NIM, Fakultas, WhatsApp) dan upload <strong>foto KTM</strong>. Verifikasi ini penting untuk membangun kepercayaan pembeli.
                                        </p>
                                        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-yellow-50 text-yellow-700 rounded-lg text-sm border border-yellow-100">
                                            <Shield className="w-4 h-4" />
                                            Status: Menunggu Verifikasi Admin
                                        </div>
                                    </div>
                                </div>

                                {/* Step 3 */}
                                <div className="relative pl-0 md:pl-24 group">
                                    <div className="hidden md:flex absolute left-0 top-0 w-16 h-16 bg-blue-50 rounded-2xl border border-blue-100 items-center justify-center text-blue-600 z-10 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">
                                        <Store className="w-7 h-7" />
                                    </div>
                                    <div className="bg-slate-50 rounded-xl p-6 border border-slate-100 hover:border-blue-200 hover:shadow-md transition-all duration-300">
                                        <h3 className="text-xl font-bold text-slate-900 mb-2">Mulai Jualan</h3>
                                        <p className="text-slate-600 leading-relaxed">
                                            Setelah terverifikasi, klik tombol <strong>"Jual Barang"</strong> di dashboard atau navbar atas.
                                        </p>
                                    </div>
                                </div>

                                {/* Step 4 */}
                                <div className="relative pl-0 md:pl-24 group">
                                    <div className="hidden md:flex absolute left-0 top-0 w-16 h-16 bg-indigo-50 rounded-2xl border border-indigo-100 items-center justify-center text-indigo-600 z-10 group-hover:bg-indigo-600 group-hover:text-white transition-colors duration-300">
                                        <FileText className="w-7 h-7" />
                                    </div>
                                    <div className="bg-slate-50 rounded-xl p-6 border border-slate-100 hover:border-indigo-200 hover:shadow-md transition-all duration-300">
                                        <h3 className="text-xl font-bold text-slate-900 mb-2">Isi Detail Produk</h3>
                                        <p className="text-slate-600 mb-4">Pastikan informasimu lengkap agar pembeli tidak ragu:</p>
                                        <ul className="grid sm:grid-cols-2 gap-2 text-sm text-slate-600">
                                            <li className="flex items-center gap-2">
                                                <Upload className="w-4 h-4 text-green-500" />
                                                Foto Jelas & Terang
                                            </li>
                                            <li className="flex items-center gap-2">
                                                <div className="w-1.5 h-1.5 rounded-full bg-slate-300"></div>
                                                Nama Produk Deskriptif
                                            </li>
                                            <li className="flex items-center gap-2">
                                                <div className="w-1.5 h-1.5 rounded-full bg-slate-300"></div>
                                                Harga Wajar & Bersaing
                                            </li>
                                            <li className="flex items-center gap-2">
                                                <div className="w-1.5 h-1.5 rounded-full bg-slate-300"></div>
                                                Deskripsi Kekurangan Barang
                                            </li>
                                        </ul>
                                    </div>
                                </div>

                                {/* Step 5 & 6 Combined */}
                                <div className="relative pl-0 md:pl-24 group">
                                    <div className="hidden md:flex absolute left-0 top-0 w-16 h-16 bg-green-50 rounded-2xl border border-green-100 items-center justify-center text-green-600 z-10 group-hover:bg-green-600 group-hover:text-white transition-colors duration-300">
                                        <MessageCircle className="w-7 h-7" />
                                    </div>
                                    <div className="bg-slate-50 rounded-xl p-6 border border-slate-100 hover:border-green-200 hover:shadow-md transition-all duration-300">
                                        <h3 className="text-xl font-bold text-slate-900 mb-2">Deal & COD</h3>
                                        <p className="text-slate-600 leading-relaxed">
                                            Tunggu notifikasi chat dari pembeli. Lakukan tawar-menawar yang sopan dan sepakati lokasi <strong>COD di area kampus UNESA</strong> agar aman.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Pro Tips */}
                            <div className="mt-12 bg-gradient-to-br from-yellow-50 to-orange-50 rounded-2xl p-6 md:p-8 border border-yellow-100">
                                <div className="flex items-start gap-4">
                                    <div className="p-3 bg-yellow-100 text-yellow-600 rounded-xl flex-shrink-0">
                                        <Lightbulb className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-yellow-900 mb-2">Tips Agar Cepat Laku ⚡</h3>
                                        <ul className="space-y-2 text-yellow-800/80">
                                            <li>• Gunakan foto asli, bukan ambil dari internet.</li>
                                            <li>• Berikan respon cepat pada chat yang masuk.</li>
                                            <li>• Promosikan link produkmu ke grup WhatsApp kelas/angkatan.</li>
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

export default CaraJualPage;
