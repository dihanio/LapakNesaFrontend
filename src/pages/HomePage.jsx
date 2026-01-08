import { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, X, Package, PlusCircle } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import productService from '../services/productService';
import bannerService from '../services/bannerService';

// Categories with 3D icons (matching backend categories)
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

function HomePage() {
    const [products, setProducts] = useState([]);
    const [banners, setBanners] = useState([]);
    const [currentBanner, setCurrentBanner] = useState(0);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [visibleCount, setVisibleCount] = useState(20);
    const [hasMore, setHasMore] = useState(true);
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const kategori = searchParams.get('kategori');

    const sentinelRef = useRef(null);
    const bannerIntervalRef = useRef(null);

    useEffect(() => {
        const fetchBanners = async () => {
            try {
                const response = await bannerService.getBanners();
                setBanners(response.data || []);
            } catch (error) {
                console.error('Error fetching banners:', error);
            }
        };
        fetchBanners();
    }, []);

    useEffect(() => {
        if (banners.length > 1) {
            bannerIntervalRef.current = setInterval(() => {
                setCurrentBanner((prev) => (prev + 1) % banners.length);
            }, 5000);
        }
        return () => {
            if (bannerIntervalRef.current) {
                clearInterval(bannerIntervalRef.current);
            }
        };
    }, [banners.length]);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                setLoading(true);
                setVisibleCount(20);

                let response;
                if (kategori) {
                    response = await productService.getProducts({ kategori });
                    setHasMore((response.data || []).length > 20);
                } else {
                    response = await productService.getRecommendedProducts(20);
                    setHasMore(false);
                }

                setProducts(response.data || []);
            } catch (error) {
                console.error('Error fetching products:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchProducts();
    }, [kategori]);

    const loadMore = useCallback(() => {
        if (loadingMore || !hasMore) return;
        setLoadingMore(true);
        setTimeout(() => {
            setVisibleCount(prev => {
                const newCount = prev + 12;
                setHasMore(newCount < products.length);
                return newCount;
            });
            setLoadingMore(false);
        }, 200);
    }, [loadingMore, hasMore, products.length]);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && !loading) {
                    loadMore();
                }
            },
            { threshold: 0.1, rootMargin: '100px' }
        );
        const sentinel = sentinelRef.current;
        if (sentinel) observer.observe(sentinel);
        return () => { if (sentinel) observer.unobserve(sentinel); };
    }, [loadMore, loading]);

    const handleBannerClick = (banner) => {
        if (banner.link) {
            if (banner.link.startsWith('http')) {
                window.open(banner.link, '_blank');
            } else {
                navigate(banner.link);
            }
        }
    };

    const goToBanner = (index) => {
        setCurrentBanner(index);
        if (bannerIntervalRef.current) {
            clearInterval(bannerIntervalRef.current);
            bannerIntervalRef.current = setInterval(() => {
                setCurrentBanner((prev) => (prev + 1) % banners.length);
            }, 5000);
        }
    };

    return (
        <div className="bg-blue-50/30 min-h-screen transition-colors">
            {/* Main Content */}
            <main className="w-full max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
                {/* Hero / Banner Section */}
                {banners.length > 0 && (
                    <section className="relative w-full rounded-xl overflow-hidden shadow-lg group">
                        {banners.map((banner, index) => (
                            <div
                                key={banner._id}
                                className={`${index === currentBanner ? 'block' : 'hidden'} relative w-full transition-all duration-500`}
                            >
                                <img
                                    src={banner.imageUrl}
                                    alt={banner.title || `Banner ${index + 1}`}
                                    className="w-full h-auto object-contain"
                                    onClick={() => handleBannerClick(banner)}
                                    style={{ cursor: banner.link ? 'pointer' : 'default' }}
                                />

                                {/* Text Overlay */}
                                {banner.title && (
                                    <div
                                        className="absolute inset-0 bg-gradient-to-r from-blue-900/80 via-blue-900/40 to-transparent flex items-center px-6 sm:px-12 cursor-pointer"
                                        onClick={() => handleBannerClick(banner)}
                                    >
                                        <div className="max-w-xl text-white space-y-2 sm:space-y-4 animate-fade-in-up p-4">
                                            <h2 className="text-2xl sm:text-4xl md:text-5xl font-extrabold tracking-tight drop-shadow-lg">
                                                {banner.title}
                                            </h2>
                                            {banner.subtitle && (
                                                <p className="text-sm sm:text-lg md:text-xl text-blue-100 font-medium opacity-90 drop-shadow-md">
                                                    {banner.subtitle}
                                                </p>
                                            )}
                                            <button className="mt-4 px-6 py-2 bg-yellow-400 hover:bg-yellow-500 text-blue-900 font-bold rounded-full transition-colors shadow-lg">
                                                Mulai Belanja
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}

                        {/* Navigation Arrows */}
                        {banners.length > 1 && (
                            <>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        goToBanner((currentBanner - 1 + banners.length) % banners.length);
                                    }}
                                    className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white/80 hover:bg-white flex items-center justify-center shadow-md transition-all opacity-0 group-hover:opacity-100"
                                    aria-label="Previous banner"
                                >
                                    <ChevronLeft className="w-6 h-6 text-slate-700" />
                                </button>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        goToBanner((currentBanner + 1) % banners.length);
                                    }}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white/80 hover:bg-white flex items-center justify-center shadow-md transition-all opacity-0 group-hover:opacity-100"
                                    aria-label="Next banner"
                                >
                                    <ChevronRight className="w-6 h-6 text-slate-700" />
                                </button>
                            </>
                        )}

                        {/* Dots Navigation */}
                        {banners.length > 1 && (
                            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 flex gap-2">
                                {banners.map((_, index) => (
                                    <button
                                        key={index}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            goToBanner(index);
                                        }}
                                        className={`w-2.5 h-2.5 rounded-full transition-all shadow-sm ${index === currentBanner
                                            ? 'bg-blue-500 w-6'
                                            : 'bg-white/70 hover:bg-white'
                                            }`}
                                        aria-label={`Go to banner ${index + 1}`}
                                    />
                                ))}
                            </div>
                        )}
                    </section>
                )}

                {/* Categories Section */}
                <section>
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-bold text-slate-900">Kategori Utama</h2>
                    </div>
                    <div className="flex justify-between gap-2 pb-2 overflow-x-auto scrollbar-hide">
                        {categories.map((cat) => (
                            <button
                                key={cat.value}
                                onClick={() => navigate(`/?kategori=${cat.value}`)}
                                className="flex flex-col items-center gap-2 flex-1 min-w-[80px] group"
                                aria-label={`Lihat kategori ${cat.name}`}
                            >
                                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-white border border-blue-100 flex items-center justify-center overflow-hidden group-hover:border-blue-500 group-hover:shadow-md transition-all">
                                    <img src={cat.icon} alt="" className="w-12 h-12 sm:w-14 sm:h-14 object-contain" loading="lazy" aria-hidden="true" />
                                </div>
                                <span className="text-xs text-slate-700 text-center font-medium">{cat.name}</span>
                            </button>
                        ))}
                    </div>
                </section>

                {/* Active Category Filter */}
                {kategori && (
                    <section className="flex items-center gap-2">
                        <span className="text-sm text-slate-500">Filter:</span>
                        <span className="px-3 py-1 bg-blue-50 text-blue-600 text-sm font-medium rounded-full flex items-center gap-2 border border-blue-200">
                            {kategori}
                            <button onClick={() => navigate('/')} className="hover:text-blue-800">
                                <X className="w-4 h-4" />
                            </button>
                        </span>
                    </section>
                )}

                {/* Recommendations Grid */}
                <section>
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className="text-xl font-bold text-slate-900">
                                {kategori ? `Produk ${kategori}` : 'Rekomendasi Untukmu'}
                            </h2>
                            <p className="text-blue-500 text-sm mt-1">Barang terbaru yang diupload teman kampusmu</p>
                        </div>
                        <Link to="/jelajah" className="text-blue-500 font-semibold text-sm hover:underline">Lihat Semua</Link>
                    </div>

                    {loading ? (
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                            {[...Array(10)].map((_, i) => (
                                <div key={i} className="bg-white border border-blue-100 rounded-xl overflow-hidden animate-pulse">
                                    <div className="aspect-square bg-blue-100"></div>
                                    <div className="p-3 space-y-2">
                                        <div className="h-4 bg-blue-100 rounded w-3/4"></div>
                                        <div className="h-3 bg-blue-100 rounded w-1/2"></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : products.length > 0 ? (
                        <>
                            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                                {products.slice(0, visibleCount).map((product) => (
                                    <ProductCard key={product._id} product={product} />
                                ))}
                            </div>

                            {/* Load More Button */}
                            <div className="mt-8 flex justify-center">
                                {hasMore ? (
                                    <button
                                        onClick={loadMore}
                                        disabled={loadingMore}
                                        className="px-6 py-2.5 rounded-lg border border-blue-200 bg-white text-slate-900 font-semibold hover:border-blue-500 hover:text-blue-500 transition-all shadow-sm disabled:opacity-50"
                                    >
                                        {loadingMore ? (
                                            <span className="flex items-center gap-2">
                                                <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                                                Memuat...
                                            </span>
                                        ) : (
                                            'Muat Lebih Banyak'
                                        )}
                                    </button>
                                ) : (
                                    <div ref={sentinelRef}></div>
                                )}
                            </div>
                        </>
                    ) : (
                        <div className="text-center py-12 bg-white border border-blue-100 rounded-xl">
                            <div className="size-16 mx-auto mb-4 rounded-full bg-blue-50 flex items-center justify-center">
                                <Package className="w-8 h-8 text-blue-500" />
                            </div>
                            <p className="text-slate-500 mb-4">
                                {kategori ? `Belum ada produk di kategori ${kategori}` : 'Belum ada produk'}
                            </p>
                            <Link
                                to="/jual"
                                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500 text-white text-sm font-medium rounded-lg hover:bg-blue-600 transition-colors"
                            >
                                <PlusCircle className="w-5 h-5" />
                                Jual Barangmu
                            </Link>
                        </div>
                    )}
                </section>
            </main>
        </div>
    );
}

export default HomePage;
