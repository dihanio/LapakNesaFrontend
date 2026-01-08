import { X } from 'lucide-react';

/**
 * Reusable modal for confirmation / action dialogs
 * Props:
 * - isOpen: boolean
 * - onClose: () => void
 * - onConfirm: () => void
 * - title: string
 * - description: string
 * - confirmText?: string (default: 'Konfirmasi')
 * - cancelText?: string (default: 'Batal')
 * - confirmColor?: 'primary' | 'danger' | 'success' (default: 'primary')
 * - icon?: React.ReactNode
 * - loading?: boolean
 */
const ActionModal = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    description,
    confirmText = 'Konfirmasi',
    cancelText = 'Batal',
    confirmColor = 'primary',
    icon,
    loading = false,
}) => {
    if (!isOpen) return null;

    const colorClasses = {
        primary: 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500',
        danger: 'bg-red-600 hover:bg-red-700 focus:ring-red-500',
        success: 'bg-green-600 hover:bg-green-700 focus:ring-green-500',
    };

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
                onClick={!loading ? onClose : undefined}
            />

            {/* Modal Container */}
            <div className="flex min-h-full items-center justify-center p-4">
                <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 transform transition-all">
                    {/* Close Button */}
                    <button
                        onClick={onClose}
                        disabled={loading}
                        className="absolute top-4 right-4 p-1 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors disabled:opacity-50"
                    >
                        <X className="w-5 h-5" />
                    </button>

                    {/* Icon */}
                    {icon && (
                        <div className="flex justify-center mb-4">
                            {icon}
                        </div>
                    )}

                    {/* Content */}
                    <div className="text-center">
                        <h3 className="text-xl font-bold text-slate-900 mb-2">
                            {title}
                        </h3>
                        <p className="text-slate-600 mb-6">
                            {description}
                        </p>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3">
                        <button
                            onClick={onClose}
                            disabled={loading}
                            className="flex-1 px-4 py-3 text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors disabled:opacity-50"
                        >
                            {cancelText}
                        </button>
                        <button
                            onClick={onConfirm}
                            disabled={loading}
                            className={`flex-1 px-4 py-3 text-sm font-semibold text-white rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-70 ${colorClasses[confirmColor]}`}
                        >
                            {loading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                    </svg>
                                    Memproses...
                                </span>
                            ) : confirmText}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ActionModal;
