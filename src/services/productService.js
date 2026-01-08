import api from './api';

export const productService = {
    getProducts: async (params = {}) => {
        const response = await api.get('/products', { params });
        return response.data;
    },

    getProduct: async (id) => {
        const response = await api.get(`/products/${id}`);
        return response.data;
    },

    getRecommendedProducts: async (limit = 20) => {
        const response = await api.get('/products/recommended', { params: { limit } });
        return response.data;
    },

    createProduct: async (formData) => {
        const response = await api.post('/products', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    },

    updateProduct: async (id, formData) => {
        const response = await api.put(`/products/${id}`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    },

    deleteProduct: async (id) => {
        const response = await api.delete(`/products/${id}`);
        return response.data;
    },

    getMyProducts: async () => {
        const response = await api.get('/products/user/my');
        return response.data;
    },

    trackProductView: async (id) => {
        try {
            const response = await api.post(`/products/${id}/view`);
            return response.data;
        } catch {
            // Silently fail - view tracking is not critical
            return null;
        }
    },

    getRecentlyViewed: async (limit = 10) => {
        const response = await api.get('/products/recently-viewed', { params: { limit } });
        return response.data;
    },
};

export default productService;

