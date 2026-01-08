import { useState, useEffect } from 'react';
import { ChevronUp } from 'lucide-react';

function ScrollToTopButton() {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const toggleVisibility = () => {
            if (window.scrollY > 300) {
                setIsVisible(true);
            } else {
                setIsVisible(false);
            }
        };

        window.addEventListener('scroll', toggleVisibility);
        return () => window.removeEventListener('scroll', toggleVisibility);
    }, []);

    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    };

    if (!isVisible) return null;

    return (
        <button
            onClick={scrollToTop}
            aria-label="Kembali ke atas halaman"
            className="fixed bottom-24 right-6 z-40 w-12 h-12 bg-white border border-slate-200 rounded-full shadow-lg hover:shadow-xl hover:bg-blue-50 hover:border-blue-300 transition-all duration-300 flex items-center justify-center group animate-fade-in-up"
        >
            <ChevronUp className="w-6 h-6 text-slate-600 group-hover:text-blue-600 transition-colors" />
            <span className="sr-only">Kembali ke atas</span>
        </button>
    );
}

export default ScrollToTopButton;
