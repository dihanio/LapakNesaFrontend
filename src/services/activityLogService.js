import api from './api';

const activityLogService = {
    // Get all activity logs with pagination and filters
    getActivityLogs: async (params = {}) => {
        const { page = 1, limit = 20, category, action, userId, search } = params;
        const queryParams = new URLSearchParams();
        
        queryParams.append('page', page);
        queryParams.append('limit', limit);
        if (category) queryParams.append('category', category);
        if (action) queryParams.append('action', action);
        if (userId) queryParams.append('userId', userId);
        if (search) queryParams.append('search', search);
        
        const response = await api.get(`/activity-logs?${queryParams.toString()}`);
        return response.data;
    },

    // Get recent activity logs for dashboard widget
    getRecentLogs: async (limit = 10) => {
        const response = await api.get(`/activity-logs/recent?limit=${limit}`);
        return response.data;
    },

    // Get activity statistics
    getActivityStats: async () => {
        const response = await api.get('/activity-logs/stats');
        return response.data;
    },

    // Get logs for a specific target (product, user, etc.)
    getTargetLogs: async (targetType, targetId) => {
        const response = await api.get(`/activity-logs/target/${targetType}/${targetId}`);
        return response.data;
    },
};

// Helper functions for formatting
export const formatActivityAction = (action) => {
    const actionLabels = {
        // Product actions
        product_created: 'Menambahkan produk',
        product_updated: 'Mengupdate produk',
        product_deleted: 'Menghapus produk',
        product_sold: 'Produk terjual',
        product_approved: 'Menyetujui produk',
        product_rejected: 'Menolak produk',
        // User actions
        user_registered: 'Pendaftaran akun',
        user_deleted: 'Menghapus pengguna',
        user_banned: 'Memblokir pengguna',
        user_unbanned: 'Membuka blokir pengguna',
        user_role_changed: 'Mengubah role pengguna',
        // Admin actions
        admin_login: 'Login admin',
        // Report actions
        report_created: 'Membuat laporan',
        report_resolved: 'Menyelesaikan laporan',
        report_closed: 'Menutup laporan',
        // Banner actions
        banner_created: 'Menambahkan banner',
        banner_updated: 'Mengupdate banner',
        banner_deleted: 'Menghapus banner',
        // Verification actions
        verification_submitted: 'Mengajukan verifikasi',
        verification_approved: 'Menyetujui verifikasi',
        verification_rejected: 'Menolak verifikasi',
    };
    return actionLabels[action] || action;
};

export const formatActivityCategory = (category) => {
    const categoryLabels = {
        product: 'Produk',
        user: 'Pengguna',
        admin: 'Admin',
        report: 'Laporan',
        banner: 'Banner',
        verification: 'Verifikasi',
        system: 'Sistem',
    };
    return categoryLabels[category] || category;
};

export const getCategoryColor = (category) => {
    const colors = {
        product: 'bg-blue-500/20 text-blue-400',
        user: 'bg-green-500/20 text-green-400',
        admin: 'bg-purple-500/20 text-purple-400',
        report: 'bg-red-500/20 text-red-400',
        banner: 'bg-yellow-500/20 text-yellow-400',
        verification: 'bg-cyan-500/20 text-cyan-400',
        system: 'bg-gray-500/20 text-gray-400',
    };
    return colors[category] || 'bg-gray-500/20 text-gray-400';
};

export const getActionIcon = (action) => {
    // Returns icon name for each action type
    const icons = {
        product_created: '📦',
        product_updated: '✏️',
        product_deleted: '🗑️',
        product_sold: '💰',
        product_approved: '✅',
        product_rejected: '❌',
        user_registered: '👤',
        user_deleted: '🚫',
        user_banned: '🔒',
        user_unbanned: '🔓',
        user_role_changed: '🔄',
        admin_login: '🔐',
        report_created: '📝',
        report_resolved: '✔️',
        report_closed: '📁',
        banner_created: '🖼️',
        banner_updated: '🖌️',
        banner_deleted: '🗑️',
        verification_submitted: '📤',
        verification_approved: '✅',
        verification_rejected: '❌',
    };
    return icons[action] || '📋';
};

export default activityLogService;
