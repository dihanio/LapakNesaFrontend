import { useState, useEffect } from 'react';
import { Cookie, X } from 'lucide-react';
import { Link } from 'react-router-dom';

const CookieConsent = () => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const consent = localStorage.getItem('cookieConsent');
        if (!consent) {
            // Show after a small delay for better UX
            const timer = setTimeout(() => setIsVisible(true), 1000);
            return () => clearTimeout(timer);
        }
    }, []);

    const handleAccept = () => {
        localStorage.setItem('cookieConsent', 'true');
        setIsVisible(false);
    };

    const handleDecline = () => {
        setIsVisible(false);
    };

    if (!isVisible) return null;

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 p-4 md:p-6 animate-slide-up">
            <div className="max-w-4xl mx-auto bg-white/90 backdrop-blur-md border border-slate-200 shadow-2xl rounded-2xl p-4 md:p-6 flex flex-col md:flex-row items-center gap-4 md:gap-6">

                {/* Icon */}
                <div className="hidden md:flex flex-shrink-0 w-12 h-12 bg-blue-50 rounded-full items-center justify-center">
                    <Cookie className="w-6 h-6 text-blue-600" />
                </div>

                {/* Content */}
                <div className="flex-1 text-center md:text-left">
                    <h3 className="font-semibold text-slate-800 mb-1 flex items-center justify-center md:justify-start gap-2">
                        <Cookie className="w-5 h-5 text-blue-600 md:hidden" />
                        Kami menggunakan Cookies
                    </h3>
                    <p className="text-sm text-slate-600 leading-relaxed">
                        Website ini menggunakan cookies untuk memastikan pengalaman terbaik bagi Anda.
                        Dengan melanjutkan, Anda menyetujui penggunaan cookies sesuai dengan{' '}
                        <Link to="/privasi" className="text-blue-600 hover:underline font-medium">
                            Kebijakan Privasi
                        </Link>{' '}
                        kami.
                    </p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3 w-full md:w-auto">
                    <button
                        onClick={handleDecline}
                        className="flex-1 md:flex-none px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors border border-transparent hover:border-slate-200"
                    >
                        Nanti Saja
                    </button>
                    <button
                        onClick={handleAccept}
                        className="flex-1 md:flex-none px-6 py-2.5 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-lg shadow-blue-200 transition-all transform hover:-translate-y-0.5"
                    >
                        Saya Setuju
                    </button>
                    <button
                        onClick={handleDecline}
                        className="md:hidden absolute top-2 right-2 p-1 text-slate-400"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CookieConsent;
