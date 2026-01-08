import { Link } from 'react-router-dom';

const categories = [
    { name: 'Buku', icon: 'fi fi-rr-book-alt', color: 'bg-blue-500' },
    { name: 'Elektronik', icon: 'fi fi-rr-laptop', color: 'bg-purple-500' },
    { name: 'Kost', icon: 'fi fi-rr-home', color: 'bg-green-500' },
    { name: 'Fashion', icon: 'fi fi-rr-shirt-long-sleeve', color: 'bg-pink-500' },
    { name: 'Alat Kuliah', icon: 'fi fi-rr-pencil', color: 'bg-orange-500' },
];

function Hero() {
    return (
        <section className="bg-white">
            {/* Simple Hero Banner */}
            <div className="bg-gradient-to-r from-[#0d59f2] to-blue-600 py-8 sm:py-10">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
                    <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white mb-2">
                        Jual Beli Mahasiswa UNESA
                    </h1>
                    <p className="text-blue-100 text-sm sm:text-base">
                        COD aman di area kampus • Gratis pasang iklan
                    </p>
                </div>
            </div>

            {/* Category Icons Grid */}
            <div className="py-6 border-b border-slate-100">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-5 gap-3 sm:gap-6 max-w-lg mx-auto">
                        {categories.map((cat) => (
                            <Link
                                key={cat.name}
                                to={`/jelajah?kategori=${cat.name}`}
                                className="flex flex-col items-center gap-2 group"
                            >
                                <div className={`w-11 h-11 sm:w-14 sm:h-14 ${cat.color} rounded-full flex items-center justify-center shadow-md group-hover:scale-110 transition-transform`}>
                                    <i className={`${cat.icon} text-white text-lg sm:text-xl`}></i>
                                </div>
                                <span className="text-[10px] sm:text-xs font-medium text-slate-600 text-center leading-tight">
                                    {cat.name}
                                </span>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}

export default Hero;
