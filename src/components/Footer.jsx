import { Link } from 'react-router-dom';
import {
    BadgeCheck, Lock, Instagram, Phone, Mail,
    Facebook, Twitter, MapPin, ExternalLink
} from 'lucide-react';

function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="mt-auto bg-white border-t border-slate-100 pt-16 pb-8" role="contentinfo">
            <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 mb-16">
                    {/* Brand & Description - Spans 4 columns */}
                    <div className="lg:col-span-4 space-y-6">
                        <Link to="/" className="inline-flex items-center gap-2">
                            <img src="/LN.png" alt="Logo LapakNesa" className="size-10 object-contain" />
                            <h2 className="text-2xl font-extrabold tracking-tight">
                                <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Lapak</span>
                                <span className="text-yellow-500">Nesa</span>
                            </h2>
                        </Link>
                        <p className="text-slate-500 text-base leading-relaxed max-w-sm">
                            Marketplace eksklusif mahasiswa UNESA. Jual beli aman, nyaman, dan terpercaya di lingkungan kampus.
                        </p>

                        <div className="flex items-center gap-4">
                            {[
                                { icon: Instagram, href: "https://instagram.com/lapaknesa", label: "Instagram" },
                                { icon: Phone, href: "https://wa.me/6281234567890", label: "WhatsApp" },
                                { icon: Mail, href: "mailto:info@lapaknesa.id", label: "Email" }
                            ].map((social, idx) => (
                                <a
                                    key={idx}
                                    href={social.href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-50 text-slate-500 hover:bg-blue-50 hover:text-blue-600 transition-all duration-300 border border-slate-100 hover:border-blue-100 hover:shadow-sm"
                                    aria-label={social.label}
                                >
                                    <social.icon className="w-5 h-5" />
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Navigation - Spans 8 columns (2+3+3) */}
                    <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-3 gap-8">
                        {/* Panduan */}
                        <div>
                            <h3 className="font-semibold text-slate-900 mb-6 text-sm uppercase tracking-wider">Panduan</h3>
                            <nav className="flex flex-col space-y-4">
                                <Link to="/cara-jual" className="text-slate-500 hover:text-blue-600 transition-colors text-sm">Cara Jual</Link>
                                <Link to="/cara-beli" className="text-slate-500 hover:text-blue-600 transition-colors text-sm">Cara Beli</Link>
                                <Link to="/tips-cod" className="text-slate-500 hover:text-blue-600 transition-colors text-sm">Tips COD Aman</Link>
                                <Link to="/aturan" className="text-slate-500 hover:text-blue-600 transition-colors text-sm">Aturan Platform</Link>
                            </nav>
                        </div>

                        {/* Tentang */}
                        <div>
                            <h3 className="font-semibold text-slate-900 mb-6 text-sm uppercase tracking-wider">LapakNesa</h3>
                            <nav className="flex flex-col space-y-4">
                                <Link to="/tentang-kami" className="text-slate-500 hover:text-blue-600 transition-colors text-sm">Tentang Kami</Link>
                                <Link to="/privasi" className="text-slate-500 hover:text-blue-600 transition-colors text-sm">Kebijakan Privasi</Link>
                                <Link to="/pusat-bantuan" className="text-slate-500 hover:text-blue-600 transition-colors text-sm">Pusat Bantuan</Link>
                                <a href="mailto:karir@lapaknesa.id" className="text-slate-500 hover:text-blue-600 transition-colors text-sm inline-flex items-center gap-1 group">
                                    Karir
                                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-blue-50 text-blue-600 font-medium group-hover:bg-blue-100">Hiring</span>
                                </a>
                            </nav>
                        </div>

                        {/* Kategori */}
                        <div>
                            <h3 className="font-semibold text-slate-900 mb-6 text-sm uppercase tracking-wider">Kategori</h3>
                            <nav className="flex flex-col space-y-4">
                                <Link to="/jelajah?kategori=Elektronik" className="text-slate-500 hover:text-blue-600 transition-colors text-sm">Elektronik</Link>
                                <Link to="/jelajah?kategori=Buku" className="text-slate-500 hover:text-blue-600 transition-colors text-sm">Buku & Alat Tulis</Link>
                                <Link to="/jelajah?kategori=Fashion" className="text-slate-500 hover:text-blue-600 transition-colors text-sm">Fashion</Link>
                                <Link to="/jelajah" className="text-blue-600 font-medium hover:text-blue-700 transition-colors text-sm inline-flex items-center gap-1">
                                    Lihat Semua <ExternalLink className="w-3 h-3" />
                                </Link>
                            </nav>
                        </div>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="pt-8 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-6">
                    <p className="text-sm text-slate-400">
                        © {currentYear} LapakNesa. Dibuat dengan ❤️ oleh Mahasiswa UNESA.
                    </p>
                    <div className="flex flex-wrap items-center justify-center gap-6">
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50/50 border border-blue-100">
                            <BadgeCheck className="w-4 h-4 text-blue-500" />
                            <span className="text-xs font-medium text-slate-600">Verifikasi Mahasiswa</span>
                        </div>
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-50/50 border border-green-100">
                            <Lock className="w-4 h-4 text-green-500" />
                            <span className="text-xs font-medium text-slate-600">Transaksi Aman</span>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}

export default Footer;
