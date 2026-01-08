import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, AlertTriangle, Mail, Lock, Loader2, ArrowRight } from 'lucide-react';
import useAuthStore from '../store/authStore';
import api from '../services/api';

function AdminLoginPage() {
    const navigate = useNavigate();
    const { login } = useAuthStore();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            console.log('[ADMIN LOGIN] Sending request...', { email });
            const response = await api.post('/auth/login', {
                email,
                password,
            });

            console.log('[ADMIN LOGIN] Raw Response:', response);
            console.log('[ADMIN LOGIN] Data:', response.data);

            const { token, ...userData } = response.data.data;

            console.log('[ADMIN LOGIN] User Role:', userData.role);

            if (userData.role !== 'admin' && userData.role !== 'super_admin') {
                console.warn('[ADMIN LOGIN] Role denied:', userData.role);
                setError('Akses ditolak. Akun ini bukan Admin.');
                return;
            }

            // Correctly use the login action from store
            login(userData, token);

            // Set default header for subsequent requests
            api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

            console.log('[ADMIN LOGIN] Success! Redirecting...');
            navigate('/admin/dashboard');
        } catch (err) {
            console.error('[ADMIN LOGIN ERROR]', err);
            console.error('[ADMIN LOGIN ERROR RESP]', err.response);
            setError(err.response?.data?.message || err.message || 'Login gagal. Periksa email dan password.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-slate-800 rounded-2xl shadow-2xl border border-slate-700 overflow-hidden">
                <div className="p-8">
                    <div className="text-center mb-8">
                        <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg p-2">
                            <img src="/LN.png" alt="LapakNesa" className="w-full h-full object-contain" />
                        </div>
                        <h1 className="text-2xl font-bold text-white">Admin Portal</h1>
                        <p className="text-slate-400 mt-2 text-sm">Masuk untuk mengelola LapakNesa</p>
                    </div>

                    {error && (
                        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl mb-6 text-sm flex items-center gap-2">
                            <AlertTriangle className="w-5 h-5" />
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleLogin} className="space-y-5">
                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-1.5">Email Admin</label>
                            <div className="relative">
                                <input
                                    type="text"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full bg-slate-900 border border-slate-700 rounded-xl py-2.5 pl-10 pr-4 text-white placeholder:text-slate-600 focus:border-[#0d59f2] focus:ring-1 focus:ring-[#0d59f2] focus:outline-none transition-all"
                                    placeholder="admin@lapaknesa.id"
                                    required
                                />
                                <Mail className="absolute left-3 top-3 w-5 h-5 text-slate-500" />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-1.5">Password</label>
                            <div className="relative">
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full bg-slate-900 border border-slate-700 rounded-xl py-2.5 pl-10 pr-4 text-white placeholder:text-slate-600 focus:border-[#0d59f2] focus:ring-1 focus:ring-[#0d59f2] focus:outline-none transition-all"
                                    placeholder="••••••••"
                                    required
                                />
                                <Lock className="absolute left-3 top-3 w-5 h-5 text-slate-500" />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-[#0d59f2] hover:bg-blue-600 text-white font-bold py-3 px-4 rounded-xl shadow-lg shadow-blue-500/20 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Memproses...
                                </>
                            ) : (
                                <>
                                    Masuk Dashboard
                                    <ArrowRight className="w-5 h-5" />
                                </>
                            )}
                        </button>
                    </form>
                </div>
                <div className="bg-slate-900 p-4 text-center border-t border-slate-700">
                    <p className="text-xs text-slate-500">
                        &copy; {new Date().getFullYear()} LapakNesa Admin System
                    </p>
                </div>
            </div>
        </div>
    );
}

export default AdminLoginPage;
