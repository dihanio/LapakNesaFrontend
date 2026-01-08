import React from 'react';

const ConfirmDialog = ({
    isOpen,
    onClose,
    onConfirm,
    title = 'Konfirmasi',
    message = 'Apakah Anda yakin?',
    confirmText = 'Ya',
    cancelText = 'Batal',
    type = 'warning', // 'warning' | 'danger' | 'info' | 'success'
    inline = false, // if true, render inside parent container instead of fixed overlay
}) => {
    if (!isOpen) return null;

    const typeStyles = {
        warning: {
            iconBg: 'bg-amber-100',
            iconColor: 'text-amber-500',
            icon: 'fi-rr-box',
            confirmBtn: 'bg-amber-500 hover:bg-amber-600',
        },
        danger: {
            iconBg: 'bg-red-100',
            iconColor: 'text-red-500',
            icon: 'fi-rr-trash',
            confirmBtn: 'bg-red-500 hover:bg-red-600',
        },
        info: {
            iconBg: 'bg-blue-100',
            iconColor: 'text-blue-500',
            icon: 'fi-rr-info',
            confirmBtn: 'bg-blue-500 hover:bg-blue-600',
        },
        success: {
            iconBg: 'bg-green-100',
            iconColor: 'text-green-500',
            icon: 'fi-rr-check',
            confirmBtn: 'bg-green-500 hover:bg-green-600',
        },
    };

    const style = typeStyles[type] || typeStyles.warning;

    // Inline variant - renders inside the chat bubble container
    if (inline) {
        return (
            <div className="absolute inset-0 z-[80] flex items-center justify-center p-3 bg-black/30 backdrop-blur-[1px] rounded-2xl">
                <div className="bg-white rounded-xl shadow-lg w-full max-w-[280px] overflow-hidden">
                    {/* Content */}
                    <div className="p-4 text-center">
                        <div className={`inline-flex items-center justify-center size-12 rounded-full ${style.iconBg} mb-2`}>
                            <i className={`fi ${style.icon} text-xl ${style.iconColor}`}></i>
                        </div>
                        <h3 className="text-sm font-bold text-slate-800">{title}</h3>
                        <p className="mt-1 text-xs text-slate-500 leading-relaxed">{message}</p>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 px-4 pb-4">
                        <button
                            onClick={onClose}
                            className="flex-1 py-2 text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                        >
                            {cancelText}
                        </button>
                        <button
                            onClick={() => {
                                onConfirm();
                                onClose();
                            }}
                            className={`flex-1 py-2 text-xs font-medium text-white rounded-lg transition-colors ${style.confirmBtn}`}
                        >
                            {confirmText}
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Full screen overlay variant (default)
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
                onClick={onClose}
            />

            {/* Dialog */}
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-xs overflow-hidden animate-scale-in">
                {/* Content */}
                <div className="p-5 text-center">
                    <div className={`inline-flex items-center justify-center size-14 rounded-full ${style.iconBg} mb-3`}>
                        <i className={`fi ${style.icon} text-2xl ${style.iconColor}`}></i>
                    </div>
                    <h3 className="text-base font-bold text-slate-800">{title}</h3>
                    <p className="mt-1.5 text-sm text-slate-500 leading-relaxed">{message}</p>
                </div>

                {/* Actions */}
                <div className="flex gap-2 p-4 pt-0">
                    <button
                        onClick={onClose}
                        className="flex-1 py-2.5 text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
                    >
                        {cancelText}
                    </button>
                    <button
                        onClick={() => {
                            onConfirm();
                            onClose();
                        }}
                        className={`flex-1 py-2.5 text-sm font-medium text-white rounded-xl transition-colors ${style.confirmBtn}`}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmDialog;
