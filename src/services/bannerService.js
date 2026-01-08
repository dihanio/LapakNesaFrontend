import api from './api';

const bannerService = {
    getBanners: async () => {
        const response = await api.get('/banners');
        return response.data;
    },

    getAllBanners: async () => {
        const response = await api.get('/admin/banners');
        return response.data;
    },

    getBannerById: async (id) => {
        const response = await api.get(`/admin/banners/${id}`);
        return response.data;
    },

    createBanner: async (bannerData) => {
        const response = await api.post('/admin/banners', bannerData);
        return response.data;
    },

    updateBanner: async (id, bannerData) => {
        const response = await api.put(`/admin/banners/${id}`, bannerData);
        return response.data;
    },

    deleteBanner: async (id) => {
        const response = await api.delete(`/admin/banners/${id}`);
        return response.data;
    },

    reorderBanners: async (bannerIds) => {
        const response = await api.put('/admin/banners-reorder', { bannerIds });
        return response.data;
    },
};

export default bannerService;
