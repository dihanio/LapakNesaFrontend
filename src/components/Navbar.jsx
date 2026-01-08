import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
    Search, PlusCircle, ShieldCheck, User, Menu, X, LayoutDashboard,
    Users, Package, Flag, Store, Heart, Settings, LogOut, BadgeCheck
} from 'lucide-react';
import useAuthStore from '../store/authStore';
import useLoginModalStore from '../store/loginModalStore';


function Navbar() {
    const { isAuthenticated, user, logout } = useAuthStore();
    const { openLoginModal } = useLoginModalStore();
    const navigate = useNavigate();
    const location = useLocation();
    const [showDropdown, setShowDropdown] = useState(false);
    const [showMobileMenu, setShowMobileMenu] = useState(false);
    const [showMobileSearch, setShowMobileSearch] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const dropdownRef = useRef(null);

    // Check if user is admin or super_admin
    const isAdmin = user?.role === 'admin' || user?.role === 'super_admin';

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        setShowMobileMenu(false);
    }, [location.pathname]);

    const handleLogout = () => {
        logout();
        setShowDropdown(false);
        navigate('/');
    };

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/jelajah?q=${encodeURIComponent(searchQuery.trim())}`);
        }
    };

    return (
        <header className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-md border-b border-slate-200 transition-all">
            <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex h-16 items-center justify-between gap-4">
                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-2 min-w-fit group">
                        <img src="/LN.png" alt="Logo" className="h-9 w-auto object-contain transition-transform group-hover:scale-105" />
                        <div className="flex flex-col">
                            <h1 className="text-xl font-extrabold tracking-tight leading-none">
                                <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Lapak</span>
                                <span className="text-yellow-500">Nesa</span>
                            </h1>
                            <span className="text-[10px] font-medium text-slate-500 leading-tight tracking-wide">Marketplace Mahasiswa</span>
                        </div>
                    </Link>

                    {/* Search Bar - Desktop */}
                    <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-xl mx-8">
                        <div className="relative group w-full">
                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                <Search className="w-4.5 h-4.5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                            </div>
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="block w-full pl-10 pr-3 py-2.5 border border-slate-200 rounded-full leading-5 bg-slate-50 text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 sm:text-sm transition-all shadow-sm"
                                placeholder="Cari buku, elektronik, atau kost di UNESA..."
                            />
                        </div>
                    </form>

                    {/* Actions */}
                    <div className="flex items-center gap-1.5 sm:gap-3">
                        {/* Desktop Navigation Links */}
                        <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-slate-600 mr-4">
                            <Link to="/jelajah" className="hover:text-blue-600 transition-colors">Jelajah</Link>
                            <Link to="/cara-jual" className="hover:text-blue-600 transition-colors">Panduan</Link>
                        </nav>

                        {/* Jual Barang Button - Hide for admin/super_admin */}
                        {!isAdmin && (
                            isAuthenticated ? (
                                <Link
                                    to="/jual"
                                    className="hidden sm:inline-flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-5 py-2.5 rounded-full font-semibold text-sm transition-all shadow-sm shadow-blue-500/20 hover:shadow-blue-500/30 active:scale-95"
                                >
                                    <PlusCircle className="w-4.5 h-4.5" />
                                    Jual Barang
                                </Link>
                            ) : (
                                <button
                                    onClick={openLoginModal}
                                    className="hidden sm:inline-flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-5 py-2.5 rounded-full font-semibold text-sm transition-all shadow-sm shadow-blue-500/20 hover:shadow-blue-500/30 active:scale-95"
                                >
                                    <PlusCircle className="w-4.5 h-4.5" />
                                    Jual Barang
                                </button>
                            )
                        )}

                        {/* Admin Panel Button */}
                        {isAdmin && isAuthenticated && (
                            <Link
                                to="/admin/dashboard"
                                className="hidden sm:inline-flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-5 py-2.5 rounded-full font-semibold text-sm transition-all shadow-sm hover:shadow-md active:scale-95"
                            >
                                <ShieldCheck className="w-4.5 h-4.5" />
                                Admin Panel
                            </Link>
                        )}

                        {/* Notification & Chat Icons (Placeholder for now, show if auth) */}


                        {/* User Menu */}
                        <div className="relative" ref={dropdownRef}>
                            {isAuthenticated ? (
                                <button
                                    onClick={() => setShowDropdown(!showDropdown)}
                                    className={`flex items-center gap-2 p-1 rounded-full transition-all ${showDropdown ? 'bg-blue-50 ring-2 ring-blue-500/20' : 'hover:bg-slate-50'}`}
                                >
                                    {user?.avatar ? (
                                        <img src={user.avatar} alt={user.nama} className="size-9 rounded-full object-cover border border-slate-200" referrerPolicy="no-referrer" />
                                    ) : (
                                        <div className="size-9 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-sm font-bold text-white shadow-sm">
                                            {user?.nama?.charAt(0).toUpperCase() || 'U'}
                                        </div>
                                    )}
                                </button>
                            ) : (
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={openLoginModal}
                                        className="hidden sm:flex text-sm font-semibold text-slate-600 hover:text-blue-600 px-4 py-2 rounded-full hover:bg-slate-50 transition-colors"
                                    >
                                        Masuk
                                    </button>
                                    <button
                                        onClick={openLoginModal}
                                        className="hidden sm:flex text-sm font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 px-4 py-2 rounded-full transition-colors border border-blue-100"
                                    >
                                        Daftar
                                    </button>
                                    <button
                                        onClick={openLoginModal}
                                        className="sm:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-full"
                                    >
                                        <User className="w-6 h-6" />
                                    </button>
                                </div>
                            )}

                            {/* Dropdown Menu */}
                            {showDropdown && isAuthenticated && (
                                <div className="absolute right-0 mt-3 w-72 bg-white border border-slate-100 rounded-2xl shadow-xl shadow-slate-200/50 py-2 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                                    <div className="px-5 py-4 border-b border-slate-50 bg-slate-50/50">
                                        <div className="flex items-center gap-3">
                                            {user?.avatar ? (
                                                <img src={user.avatar} alt={user.nama} className="size-10 rounded-full object-cover border border-white shadow-sm" referrerPolicy="no-referrer" />
                                            ) : (
                                                <div className="size-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold shadow-sm">
                                                    {user?.nama?.charAt(0).toUpperCase() || 'U'}
                                                </div>
                                            )}
                                            <div className="min-w-0 flex-1">
                                                <p className="font-semibold text-slate-900 truncate flex items-center gap-1.5">
                                                    {user?.nama}
                                                    {user?.role === 'penjual' && <BadgeCheck className="w-4 h-4 text-blue-500 fill-blue-50" />}
                                                </p>
                                                <p className="text-xs text-slate-500 truncate font-medium">{user?.email}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="py-2 px-2">
                                        {isAdmin ? (
                                            <>
                                                <DropdownItem to="/admin/dashboard" icon={ShieldCheck} label="Admin Dashboard" onClick={() => setShowDropdown(false)} accent />
                                                <DropdownItem to="/admin/users" icon={Users} label="Kelola User" onClick={() => setShowDropdown(false)} />
                                                <DropdownItem to="/admin/products" icon={Package} label="Kelola Produk" onClick={() => setShowDropdown(false)} />
                                                <DropdownItem to="/admin/reports" icon={Flag} label="Laporan" onClick={() => setShowDropdown(false)} />
                                            </>
                                        ) : (
                                            <>
                                                <DropdownItem to="/dashboard" icon={LayoutDashboard} label="Dashboard" onClick={() => setShowDropdown(false)} />
                                                {user?.role === 'penjual' ? (
                                                    <DropdownItem to="/jual" icon={PlusCircle} label="Jual Barang" onClick={() => setShowDropdown(false)} accent />
                                                ) : (
                                                    <DropdownItem to="/dashboard?tab=verification" icon={Store} label="Mulai Berjualan" onClick={() => setShowDropdown(false)} accent />
                                                )}
                                                <div className="my-1.5 border-t border-slate-100 mx-2"></div>
                                                <DropdownItem to="/dashboard?tab=wishlist" icon={Heart} label="Wishlist Saya" onClick={() => setShowDropdown(false)} />
                                                <DropdownItem to="/dashboard?tab=profile" icon={User} label="Edit Profil" onClick={() => setShowDropdown(false)} />
                                                <DropdownItem to="/dashboard?tab=settings" icon={Settings} label="Pengaturan" onClick={() => setShowDropdown(false)} />
                                            </>
                                        )}
                                    </div>

                                    <div className="mx-2 mt-1 border-t border-slate-100 pt-2 pb-1">
                                        <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors group">
                                            <LogOut className="w-4.5 h-4.5 group-hover:-translate-x-0.5 transition-transform" />
                                            Keluar
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Mobile Search Toggle */}
                        <button
                            onClick={() => setShowMobileSearch(!showMobileSearch)}
                            className="md:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
                        >
                            {showMobileSearch ? <X className="w-6 h-6" /> : <Search className="w-6 h-6" />}
                        </button>

                        {/* Mobile Menu Toggle */}
                        <button
                            onClick={() => setShowMobileMenu(!showMobileMenu)}
                            className="md:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
                        >
                            {showMobileMenu ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                        </button>
                    </div>
                </div>

                {/* Mobile Search Bar */}
                {showMobileSearch && (
                    <div className="md:hidden pb-4 px-2 animate-in slide-in-from-top-2">
                        <form onSubmit={(e) => { handleSearch(e); setShowMobileSearch(false); }}>
                            <div className="relative">
                                <Search className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="block w-full pl-10 pr-4 py-2.5 bg-slate-100 border-none rounded-xl text-slate-900 placeholder-slate-500 focus:ring-2 focus:ring-blue-500"
                                    placeholder="Cari sesuatu..."
                                    autoFocus
                                />
                            </div>
                        </form>
                    </div>
                )}

                {/* Mobile Menu */}
                {showMobileMenu && (
                    <div className="md:hidden border-t border-slate-100 py-4 animate-in slide-in-from-top-5">
                        <nav className="space-y-1.5 px-2">
                            <MobileNavLink to="/" onClick={() => setShowMobileMenu(false)}>Beranda</MobileNavLink>
                            <MobileNavLink to="/jelajah" onClick={() => setShowMobileMenu(false)}>Jelajah</MobileNavLink>

                            {!isAuthenticated && (
                                <>
                                    <div className="my-3 border-t border-slate-100"></div>
                                    <button onClick={() => { openLoginModal(); setShowMobileMenu(false); }} className="w-full text-left flex items-center gap-3 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 rounded-xl">
                                        Masuk / Daftar
                                    </button>
                                </>
                            )}

                            {isAuthenticated && (
                                <>
                                    <div className="my-3 border-t border-slate-100"></div>
                                    {isAdmin ? (
                                        <>
                                            <MobileNavLink to="/admin/dashboard" onClick={() => setShowMobileMenu(false)} active>Admin Panel</MobileNavLink>
                                            <MobileNavLink to="/admin/users" onClick={() => setShowMobileMenu(false)}>Kelola User</MobileNavLink>
                                        </>
                                    ) : (
                                        <>
                                            <MobileNavLink to="/dashboard" onClick={() => setShowMobileMenu(false)}>Dashboard</MobileNavLink>
                                            <MobileNavLink to="/jual" onClick={() => setShowMobileMenu(false)} active>+ Jual Barang</MobileNavLink>
                                        </>
                                    )}
                                </>
                            )}
                        </nav>
                    </div>
                )}
            </div>
        </header>
    );
}

// Helper Components
function DropdownItem({ to, icon: Icon, label, onClick, accent = false }) {
    return (
        <Link
            to={to}
            onClick={onClick}
            className={`flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-colors ${accent
                ? 'text-blue-600 bg-blue-50/50 hover:bg-blue-50 hover:text-blue-700'
                : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'
                }`}
        >
            <Icon className={`w-4.5 h-4.5 ${accent ? 'text-blue-500' : 'text-slate-400 group-hover:text-slate-600'}`} />
            {label}
        </Link>
    );
}

function MobileNavLink({ to, children, onClick, active = false }) {
    return (
        <Link
            to={to}
            onClick={onClick}
            className={`block px-4 py-3 text-sm font-medium rounded-xl transition-colors ${active
                ? 'bg-blue-50 text-blue-700'
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
        >
            {children}
        </Link>
    );
}

export default Navbar;
