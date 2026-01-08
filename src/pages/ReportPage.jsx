import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import useLoginModalStore from '../store/loginModalStore';

function ReportPage() {
    const navigate = useNavigate();
    const { isAuthenticated } = useAuthStore();
    const { openLoginModal } = useLoginModalStore();

    // Redirect authenticated users to dashboard reports tab
    useEffect(() => {
        if (isAuthenticated) {
            navigate('/dashboard?tab=reports', { replace: true });
        }
    }, [isAuthenticated, navigate]);

    // Show login required for non-authenticated users
    return (
        <div className="min-h-screen bg-white flex items-center justify-center p-4">
            <div className="max-w-sm w-full text-center">
                <h1 className="text-xl font-bold text-gray-900 mb-2">Login Diperlukan</h1>
                <p className="text-gray-600 text-sm mb-6">Silakan login terlebih dahulu untuk membuat laporan.</p>
                <button onClick={openLoginModal} className="inline-block px-6 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">
                    Masuk ke Akun
                </button>
            </div>
        </div>
    );
}

export default ReportPage;
