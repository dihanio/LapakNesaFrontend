import { Link } from 'react-router-dom';
import { BookOpen, MonitorSmartphone, Armchair, Shirt, Ruler, ArrowRight } from 'lucide-react';

const categories = [
    { name: 'Buku & Modul', icon: 'BookOpen', color: 'blue', value: 'Buku' },
    { name: 'Elektronik', icon: 'MonitorSmartphone', color: 'purple', value: 'Elektronik' },
    { name: 'Kost & Alat', icon: 'Armchair', color: 'orange', value: 'Kost' },
    { name: 'Fashion', icon: 'Shirt', color: 'pink', value: 'Fashion' },
    { name: 'Alat Kuliah', icon: 'Ruler', color: 'yellow', value: 'Alat Kuliah' },
];

const ICON_MAP = {
    BookOpen, MonitorSmartphone, Armchair, Shirt, Ruler
};

const colorClasses = {
    blue: 'bg-blue-50 text-primary group-hover:bg-primary',
    purple: 'bg-purple-50 text-purple-600 group-hover:bg-purple-600',
    orange: 'bg-orange-50 text-orange-600 group-hover:bg-orange-600',
    pink: 'bg-pink-50 text-pink-600 group-hover:bg-pink-600',
    yellow: 'bg-yellow-50 text-yellow-600 group-hover:bg-yellow-500',
};

function CategoryCard({ category }) {
    const Icon = ICON_MAP[category.icon];
    return (
        <Link
            to={`/?kategori=${category.value}`}
            className="group flex flex-col items-center gap-4 rounded-xl bg-white p-6 shadow-sm border border-slate-200 hover:border-primary hover:shadow-md transition-all"
        >
            <div className={`flex h-14 w-14 items-center justify-center rounded-full ${colorClasses[category.color]} group-hover:text-white transition-colors`}>
                <Icon className="w-8 h-8" />
            </div>
            <h3 className="font-bold text-slate-900 text-center">{category.name}</h3>
        </Link>
    );
}

function CategorySection() {
    return (
        <section className="py-16 bg-background-light" id="kategori">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
                    <div>
                        <h2 className="section-title">Kategori Populer</h2>
                        <p className="mt-2 text-slate-600">Temukan barang sesuai kebutuhan kuliahmu.</p>
                    </div>
                    <Link to="/" className="text-primary font-bold text-sm hover:underline flex items-center gap-1">
                        Lihat Semua <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                    {categories.map((category) => (
                        <CategoryCard key={category.value} category={category} />
                    ))}
                </div>
            </div>
        </section>
    );
}

export { CategoryCard, CategorySection, categories };
export default CategorySection;
