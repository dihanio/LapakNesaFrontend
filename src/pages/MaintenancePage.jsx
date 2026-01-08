import { Monitor, Cloud, Server, ArrowRight, CheckCircle, Construction, RefreshCw, Mail } from 'lucide-react';

const MaintenancePage = () => {
    return (
        <div className="min-h-screen bg-white text-gray-900 font-sans selection:bg-primary/20">
            {/* Header / Title Section */}
            <div className="container mx-auto px-6 py-16 md:py-24">
                <div className="max-w-4xl mx-auto">
                    <h1 className="text-4xl md:text-6xl font-thin tracking-tight mb-2 text-gray-900">
                        Pemeliharaan Sistem
                    </h1>
                    <p className="text-xl md:text-2xl text-gray-500 font-light">
                        Kami sedang melakukan pembaruan platform.
                    </p>
                </div>
            </div>

            {/* Status Visualizer - Cloudflare Style */}
            <div className="bg-gray-50 border-y border-gray-200 py-16">
                <div className="container mx-auto px-6">
                    <div className="max-w-4xl mx-auto">
                        <div className="flex flex-col md:flex-row items-center justify-between gap-8 md:gap-4 text-center">

                            {/* Node 1: User */}
                            <div className="flex flex-col items-center gap-4 flex-1">
                                <div className="relative">
                                    <Monitor className="w-16 h-16 md:w-20 md:h-20 text-gray-400" strokeWidth={1.5} />
                                    <div className="absolute -bottom-2 -right-2 bg-white rounded-full p-1 shadow-sm">
                                        <CheckCircle className="w-8 h-8 text-green-500 fill-current" />
                                    </div>
                                </div>
                                <div>
                                    <h3 className="text-lg font-medium text-gray-700">Anda</h3>
                                    <p className="text-green-600 mt-1 font-medium">Berjalan</p>
                                </div>
                            </div>

                            {/* Arrow 1 */}
                            <div className="hidden md:block flex-1 text-gray-300">
                                <ArrowRight className="w-12 h-12 mx-auto animate-pulse" />
                            </div>

                            {/* Node 2: Network */}
                            <div className="flex flex-col items-center gap-4 flex-1">
                                <div className="relative">
                                    <Cloud className="w-16 h-16 md:w-20 md:h-20 text-gray-400" strokeWidth={1.5} />
                                    <div className="absolute -bottom-2 -right-2 bg-white rounded-full p-1 shadow-sm">
                                        <CheckCircle className="w-8 h-8 text-green-500 fill-current" />
                                    </div>
                                </div>
                                <div>
                                    <h3 className="text-lg font-medium text-gray-700">Jaringan</h3>
                                    <p className="text-green-600 mt-1 font-medium">Berjalan</p>
                                </div>
                            </div>

                            {/* Arrow 2 */}
                            <div className="hidden md:block flex-1 text-gray-300">
                                <ArrowRight className="w-12 h-12 mx-auto animate-pulse" />
                            </div>

                            {/* Node 3: System (Maintenance) */}
                            <div className="flex flex-col items-center gap-4 flex-1">
                                <div className="relative">
                                    <Server className="w-16 h-16 md:w-20 md:h-20 text-gray-400" strokeWidth={1.5} />
                                    <div className="absolute -bottom-2 -right-2 bg-white rounded-full p-1 shadow-sm">
                                        <Construction className="w-8 h-8 text-orange-500 fill-current" />
                                    </div>
                                </div>
                                <div>
                                    <h3 className="text-lg font-medium text-gray-700">LapakNesa</h3>
                                    <p className="text-orange-500 mt-1 font-medium">Pemeliharaan</p>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>
            </div>

            {/* Explainer Columns */}
            <div className="container mx-auto px-6 py-16">
                <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12">
                    <div>
                        <h2 className="text-2xl font-light mb-4 text-gray-900">Apa yang terjadi?</h2>
                        <p className="text-gray-600 leading-relaxed">
                            Untuk memastikan performa optimal dan menghadirkan fitur-fitur baru, LapakNesa sedang menjalani pemeliharaan sistem terjadwal. Tim teknis kami sedang bekerja keras untuk menyelesaikan pembaruan ini secepat mungkin.
                        </p>
                    </div>
                    <div>
                        <h2 className="text-2xl font-light mb-4 text-gray-900">Apa yang bisa saya lakukan?</h2>
                        <p className="text-gray-600 leading-relaxed mb-6">
                            Silakan coba memuat ulang (refresh) halaman dalam beberapa menit. Sebagian besar proses pemeliharaan kami berlangsung kurang dari 30 menit.
                        </p>
                        <div className="flex flex-wrap gap-4">
                            <button
                                onClick={() => window.location.reload()}
                                className="flex items-center gap-2 px-6 py-2.5 bg-primary hover:bg-primary/90 text-white rounded-lg transition-colors font-medium text-sm shadow-sm"
                            >
                                <RefreshCw className="w-4 h-4" />
                                Refresh Halaman
                            </button>
                            <a
                                href="mailto:support@lapaknesa.id"
                                className="flex items-center gap-2 px-6 py-2.5 bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 rounded-lg transition-colors font-medium text-sm shadow-sm"
                            >
                                <Mail className="w-4 h-4" />
                                Hubungi Support
                            </a>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="container mx-auto px-6 py-8 border-t border-gray-100 text-center md:text-left">
                <p className="text-sm text-gray-400">
                    &copy; {new Date().getFullYear()} LapakNesa Platform. Error ID: <span className="font-mono text-gray-500">MAINTENANCE_MODE</span>
                </p>
            </div>
        </div>
    );
};

export default MaintenancePage;
