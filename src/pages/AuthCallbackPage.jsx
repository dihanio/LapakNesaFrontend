import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import authService from '../services/authService';

function AuthCallbackPage() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { login } = useAuthStore();
    const [error, setError] = useState('');
    const [status, setStatus] = useState('Memproses login...');

    useEffect(() => {
        const handleCallback = async () => {
            const token = searchParams.get('token');
            const errorParam = searchParams.get('error');

            if (errorParam) {
                const errorMessages = {
                    'oauth_failed': 'Login dengan Google gagal. Silakan coba lagi.',
                    'invalid_domain': 'Hanya email mahasiswa UNESA (@mhs.unesa.ac.id) yang diperbolehkan.',
                    'server_error': 'Terjadi kesalahan server. Silakan coba lagi.',
                };
                setError(errorMessages[errorParam] || 'Terjadi kesalahan. Silakan coba lagi.');
                return;
            }

            if (token) {
                try {
                    setStatus('Menyimpan token...');
                    localStorage.setItem('token', token);

                    setStatus('Mengambil data user...');
                    const response = await authService.getMe();
                    const user = response.data;

                    setStatus('Login berhasil! Redirecting...');
                    login(user, token);

                    await new Promise(resolve => setTimeout(resolve, 500));

                    navigate('/', { replace: true });
                } catch (err) {
                    const errorMsg = err.response?.data?.message || err.message || 'Unknown error';
                    setError('Gagal mengambil data user: ' + errorMsg);
                    localStorage.removeItem('token');
                }
            } else {
                setError('Token tidak ditemukan di URL.');
            }
        };

        handleCallback();
    }, [searchParams, login, navigate]);

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
                <div className="text-center max-w-md">
                    <div className="w-16 h-16 mx-auto bg-red-100 rounded-full flex items-center justify-center mb-4">
                        <i className="fi fi-rr-exclamation text-red-600 text-2xl"></i>
                    </div>
                    <h1 className="text-xl font-bold text-slate-900 mb-2">Login Gagal</h1>
                    <p className="text-slate-600 mb-6">{error}</p>
                    <button
                        onClick={() => navigate('/')}
                        className="inline-flex items-center gap-2 bg-[#0d59f2] text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-blue-700"
                    >
                        <i className="fi fi-rr-arrow-left"></i>
                        Kembali ke Beranda
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
            <div className="text-center">
                <div className="w-16 h-16 mx-auto bg-[#0d59f2]/10 rounded-full flex items-center justify-center mb-4 animate-pulse">
                    <i className="fi fi-rr-spinner animate-spin text-[#0d59f2] text-2xl"></i>
                </div>
                <p className="text-slate-600 font-medium">{status}</p>
            </div>
        </div>
    );
}

export default AuthCallbackPage;
