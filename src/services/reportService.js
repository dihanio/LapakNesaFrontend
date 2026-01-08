import api from './api';

const reportService = {
    // Create a new report
    createReport: async (data) => {
        const response = await api.post('/reports', data);
        return response.data;
    },

    // Get my reports
    getMyReports: async (params = {}) => {
        const response = await api.get('/reports/my', { params });
        return response.data;
    },

    // Get report detail
    getReportDetail: async (id) => {
        const response = await api.get(`/reports/${id}`);
        return response.data;
    },

    // ======= ADMIN =======

    // Get all reports (admin)
    getAllReports: async (params = {}) => {
        const response = await api.get('/admin/reports', { params });
        return response.data;
    },

    // Get report stats (admin)
    getReportStats: async () => {
        const response = await api.get('/admin/reports/stats');
        return response.data;
    },

    // Update report (admin)
    updateReport: async (id, data) => {
        const response = await api.put(`/admin/reports/${id}`, data);
        return response.data;
    },

    // Resolve report (admin)
    resolveReport: async (id, resolution) => {
        const response = await api.post(`/admin/reports/${id}/resolve`, { resolution });
        return response.data;
    },
};

export default reportService;
