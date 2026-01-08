import { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import {
    Clock, ArrowUp, ArrowDown, RefreshCw, X, Package,
    ChevronLeft, ChevronRight, SearchX, Filter, SlidersHorizontal,
    Monitor, Shirt, BookOpen, Sofa, PenTool, Trophy, Car, Pizza, Gamepad2, Briefcase, MoreHorizontal
} from 'lucide-react';
import ProductCard from '../components/ProductCard';
import productService from '../services/productService';
import useAuthStore from '../store/authStore';

// Categories matching HomePage with 3D Icons
const categories = [
    { name: 'Elektronik', value: 'Elektronik', icon: '/categories/cat3d_new_elektronik.png' },
    { name: 'Fashion', value: 'Fashion', icon: '/categories/cat3d_new_fashion.png' },
    { name: 'Buku', value: 'Buku', icon: '/categories/cat3d_new_buku.png' },
    { name: 'Perabotan', value: 'Perabotan', icon: '/categories/cat3d_new_perabotan.png' },
    { name: 'Alat Kuliah', value: 'Alat Kuliah', icon: '/categories/cat3d_new_alat_kuliah.png' },
    { name: 'Olahraga', value: 'Olahraga', icon: '/categories/cat3d_new_olahraga.png' },
    { name: 'Otomotif', value: 'Otomotif', icon: '/categories/cat3d_new_otomotif.png' },
    { name: 'Makanan', value: 'Makanan', icon: '/categories/cat3d_new_makanan.png' },
    { name: 'Hobi', value: 'Hobi', icon: '/categories/cat3d_new_hobi.png' },
    { name: 'Jasa', value: 'Jasa', icon: '/categories/cat3d_new_jasa.png' },
    { name: 'Lainnya', value: 'Lainnya', icon: '/categories/cat3d_new_lainnya.png' },
];

const kondisis = ['Baru', 'Seperti Baru', 'Bekas - Mulus', 'Lecet Pemakaian'];

function BrowsePage() {
    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const searchQuery = searchParams.get('q') || '';
    const kategoriFromUrl = searchParams.get('kategori') || '';

    // Initialize state from URL on first load
    const [sortBy, setSortBy] = useState('newest');
    const [selectedKategori, setSelectedKategori] = useState(kategoriFromUrl);
    const [selectedKondisi, setSelectedKondisi] = useState('');
    const [searchInput, setSearchInput] = useState(searchQuery);
    const [showMyProducts, setShowMyProducts] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(20);

    const { user, isAuthenticated } = useAuthStore();

    // Sync state with URL when URL params change
    useEffect(() => {
        if (kategoriFromUrl !== selectedKategori) {
            setSelectedKategori(kategoriFromUrl);
        }
        if (searchQuery !== searchInput) {
            setSearchInput(searchQuery);
        }
    }, [kategoriFromUrl, searchQuery]);

    useEffect(() => {
        fetchProducts();
        setCurrentPage(1);
    }, [selectedKategori, selectedKondisi, sortBy, searchQuery, showMyProducts]);

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const params = {};

            if (searchQuery) params.search = searchQuery;
            if (selectedKategori) params.kategori = selectedKategori;
            if (selectedKondisi) params.kondisi = selectedKondisi;
            if (sortBy === 'price_asc') params.sort = 'price_asc';
            if (sortBy === 'price_desc') params.sort = 'price_desc';
            if (sortBy === 'oldest') params.sort = 'oldest';

            const response = await productService.getProducts(params);
            let filteredProducts = response.data || [];

            // Client-side search filter
            if (searchQuery && filteredProducts.length > 0) {
                const query = searchQuery.toLowerCase();
                filteredProducts = filteredProducts.filter(p =>
                    p.namaBarang?.toLowerCase().includes(query) ||
                    p.deskripsi?.toLowerCase().includes(query) ||
                    p.kategori?.toLowerCase().includes(query)
                );
            }

            // Filter by current user if showMyProducts is enabled
            if (showMyProducts && user?._id) {
                filteredProducts = filteredProducts.filter(p => p.penjual?._id === user._id);
            }

            setProducts(filteredProducts);
        } catch (error) {
            console.error('Error fetching products:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCategoryClick = (value) => {
        const newValue = selectedKategori === value ? '' : value;
        setSelectedKategori(newValue);
        const newParams = new URLSearchParams(searchParams);
        if (newValue) {
            newParams.set('kategori', newValue);
        } else {
            newParams.delete('kategori');
        }
        setSearchParams(newParams, { replace: true });
    };

    const clearFilters = () => {
        setSelectedKategori('');
        setSelectedKondisi('');
        setSearchInput('');
        const newParams = new URLSearchParams(searchParams);
        newParams.delete('kategori');
        newParams.delete('q');
        setSearchParams(newParams, { replace: true });
    };

    const hasFilters = selectedKategori || selectedKondisi || searchQuery;

    // Calculate pagination
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentProducts = products.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(products.length / itemsPerPage);

    return (
        <div className="min-h-screen bg-slate-50 pb-20 font-sans">
            {/* Header Section */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 pt-8 pb-32">
                <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div>
                            <h1 className="text-3xl font-extrabold text-white tracking-tight mb-2">
                                Jelajahi Produk
                            </h1>
                            <p className="text-blue-100 text-lg">
                                Temukan berbagai barang menarik di sekitar kampus UNESA.
                            </p>
                        </div>
                        {/* Search in Header for Mobile Visibility / Quick access */}
                        <div className="relative w-full md:w-96 hidden md:block">
                            {/* Search is primarily handled by Navbar, but we can show stats or filter summary here */}
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content Area - Overlapping Header */}
            <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 -mt-24">

                {/* Categories Scroll */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-8 overflow-hidden">
                    <div className="flex items-center gap-2 mb-2">
                        <h2 className="font-bold text-slate-800">Kategori</h2>
                    </div>
                    <div className="flex gap-4 overflow-x-auto pt-4 pb-4 scrollbar-hide snap-x">
                        {categories.map((cat) => (
                            <button
                                key={cat.value}
                                onClick={() => handleCategoryClick(cat.value)}
                                className={`flex flex-col items-center gap-3 min-w-[80px] group snap-start transition-all duration-300 ${selectedKategori === cat.value ? 'scale-105' : 'hover:scale-105 opacity-80 hover:opacity-100'
                                    }`}
                            >
                                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-300 bg-blue-50 border border-blue-100 p-2 ${selectedKategori === cat.value
                                    ? `bg-blue-100 border-blue-300 shadow-lg shadow-blue-500/20 scale-110`
                                    : `hover:shadow-md`
                                    }`}>
                                    <img src={cat.icon} alt={cat.name} className="w-full h-full object-contain drop-shadow-sm" />
                                </div>
                                <span className={`text-xs font-semibold whitespace-nowrap transition-colors ${selectedKategori === cat.value ? 'text-blue-600' : 'text-slate-600'
                                    }`}>
                                    {cat.name}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Filters & Content Layout */}
                <div className="flex flex-col lg:flex-row gap-8">

                    {/* Sidebar Filters (Desktop) / Top Filters (Mobile) */}
                    <div className="lg:w-64 flex-shrink-0 space-y-6">
                        {/* Active Filters Summary */}
                        {hasFilters && (
                            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
                                <div className="flex items-center justify-between mb-3">
                                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Filter Aktif</span>
                                    <button onClick={clearFilters} className="text-xs text-red-500 hover:text-red-600 font-medium flex items-center gap-1">
                                        <RefreshCw className="w-3 h-3" /> Reset
                                    </button>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {searchQuery && (
                                        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 text-slate-700 rounded-md text-xs font-medium border border-slate-200">
                                            "{searchQuery}"
                                            <button onClick={() => {
                                                setSearchInput('');
                                                const newParams = new URLSearchParams(searchParams);
                                                newParams.delete('q');
                                                setSearchParams(newParams, { replace: true });
                                            }} className="hover:text-red-500 ml-1"><X className="w-3 h-3" /></button>
                                        </span>
                                    )}
                                    {selectedKategori && (
                                        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-50 text-blue-700 rounded-md text-xs font-medium border border-blue-100">
                                            {selectedKategori}
                                            <button onClick={() => handleCategoryClick(selectedKategori)} className="hover:text-blue-900 ml-1"><X className="w-3 h-3" /></button>
                                        </span>
                                    )}
                                    {selectedKondisi && (
                                        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-indigo-50 text-indigo-700 rounded-md text-xs font-medium border border-indigo-100">
                                            {selectedKondisi}
                                            <button onClick={() => setSelectedKondisi('')} className="hover:text-indigo-900 ml-1"><X className="w-3 h-3" /></button>
                                        </span>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Quick Actions */}
                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
                            <h3 className="font-bold text-slate-800 mb-4">
                                Filter & Sort
                            </h3>

                            {/* Sort */}
                            <div className="mb-6">
                                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 block">Urutkan</label>
                                <div className="space-y-2">
                                    {[
                                        { value: 'newest', label: 'Terbaru', Icon: Clock },
                                        { value: 'price_asc', label: 'Termurah', Icon: ArrowUp },
                                        { value: 'price_desc', label: 'Termahal', Icon: ArrowDown },
                                    ].map(sort => (
                                        <button
                                            key={sort.value}
                                            onClick={() => setSortBy(sort.value)}
                                            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-all ${sortBy === sort.value
                                                ? 'bg-slate-900 text-white shadow-sm'
                                                : 'text-slate-600 hover:bg-slate-50'
                                                }`}
                                        >
                                            <span className="flex items-center gap-2"><sort.Icon className="w-4 h-4 opacity-70" /> {sort.label}</span>
                                            {sortBy === sort.value && <div className="w-1.5 h-1.5 rounded-full bg-white"></div>}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Kondisi */}
                            <div>
                                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 block">Kondisi</label>
                                <div className="space-y-2">
                                    <button
                                        onClick={() => setSelectedKondisi('')}
                                        className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all ${selectedKondisi === ''
                                            ? 'bg-blue-50 text-blue-700 font-medium'
                                            : 'text-slate-600 hover:bg-slate-50'
                                            }`}
                                    >
                                        Semua Kondisi
                                    </button>
                                    {kondisis.map(k => (
                                        <button
                                            key={k}
                                            onClick={() => setSelectedKondisi(k)}
                                            className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all ${selectedKondisi === k
                                                ? 'bg-blue-50 text-blue-700 font-medium'
                                                : 'text-slate-600 hover:bg-slate-50'
                                                }`}
                                        >
                                            {k}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* My Products Toggle */}
                            {isAuthenticated && (
                                <div className="mt-6 pt-6 border-t border-slate-100">
                                    <label className="flex items-center justify-between cursor-pointer group">
                                        <span className="text-sm font-medium text-slate-700 group-hover:text-blue-600 transition-colors">Barang Saya</span>
                                        <div className="relative">
                                            <input
                                                type="checkbox"
                                                checked={showMyProducts}
                                                onChange={(e) => setShowMyProducts(e.target.checked)}
                                                className="sr-only peer"
                                            />
                                            <div className="w-9 h-5 bg-slate-200 rounded-full peer peer-focus:ring-2 peer-focus:ring-blue-300 peer-checked:bg-blue-600 transition-colors"></div>
                                            <div className="absolute left-0.5 top-0.5 w-4 h-4 bg-white rounded-full shadow-sm peer-checked:translate-x-4 transition-transform"></div>
                                        </div>
                                    </label>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Product Grid */}
                    <div className="flex-1">
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 min-h-[500px]">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="font-bold text-xl text-slate-800">
                                    Daftar Produk
                                </h2>
                                <span className="text-sm text-slate-500 bg-slate-100 px-3 py-1 rounded-full font-medium">
                                    {loading ? '...' : `${products.length} barang`}
                                </span>
                            </div>

                            {loading ? (
                                <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-6">
                                    {[...Array(8)].map((_, i) => (
                                        <div key={i} className="animate-pulse">
                                            <div className="bg-slate-200 aspect-[4/3] rounded-xl mb-3"></div>
                                            <div className="h-4 bg-slate-200 rounded w-3/4 mb-2"></div>
                                            <div className="h-3 bg-slate-200 rounded w-1/2"></div>
                                        </div>
                                    ))}
                                </div>
                            ) : products.length > 0 ? (
                                <>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-6">
                                        {currentProducts.map((product) => (
                                            <ProductCard key={product._id} product={product} />
                                        ))}
                                    </div>

                                    {/* Pagination */}
                                    {totalPages > 1 && (
                                        <div className="mt-12 flex flex-col sm:flex-row items-center justify-between gap-6 border-t border-slate-100 pt-6">
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm text-slate-500">Barang per halaman:</span>
                                                <select
                                                    value={itemsPerPage}
                                                    onChange={(e) => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }}
                                                    className="bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-1.5"
                                                >
                                                    <option value="10">10</option>
                                                    <option value="20">20</option>
                                                    <option value="40">40</option>
                                                    <option value="60">60</option>
                                                </select>
                                            </div>

                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                                    disabled={currentPage === 1}
                                                    className="p-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                                                >
                                                    <ChevronLeft className="w-5 h-5" />
                                                </button>

                                                <div className="flex gap-1">
                                                    {(() => {
                                                        const pages = [];
                                                        const maxVisible = 5;
                                                        let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
                                                        let end = Math.min(totalPages, start + maxVisible - 1);

                                                        if (end - start + 1 < maxVisible) {
                                                            start = Math.max(1, end - maxVisible + 1);
                                                        }

                                                        for (let i = start; i <= end; i++) {
                                                            pages.push(
                                                                <button
                                                                    key={i}
                                                                    onClick={() => setCurrentPage(i)}
                                                                    className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${currentPage === i
                                                                        ? 'bg-blue-600 text-white shadow-sm'
                                                                        : 'text-slate-600 hover:bg-slate-100'
                                                                        }`}
                                                                >
                                                                    {i}
                                                                </button>
                                                            );
                                                        }
                                                        return pages;
                                                    })()}
                                                </div>

                                                <button
                                                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                                    disabled={currentPage === totalPages}
                                                    className="p-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                                                >
                                                    <ChevronRight className="w-5 h-5" />
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </>
                            ) : (
                                <div className="flex flex-col items-center justify-center py-20 text-center">
                                    <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                                        <SearchX className="w-10 h-10 text-slate-300" />
                                    </div>
                                    <h3 className="text-lg font-bold text-slate-900 mb-2">Produk tidak ditemukan</h3>
                                    <p className="text-slate-500 max-w-sm mb-6">
                                        Coba ubah kata kunci pencarian atau kurangi filter yang digunakan.
                                    </p>
                                    <button
                                        onClick={clearFilters}
                                        className="px-6 py-2.5 bg-blue-600 text-white rounded-full font-medium hover:bg-blue-700 transition-colors shadow-sm"
                                    >
                                        Reset Filter
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default BrowsePage;
