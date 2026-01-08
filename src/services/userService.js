import api from './api';

export const userService = {
    // Get user profile
    getProfile: async (userId) => {
        const response = await api.get(`/users/${userId}`);
        return response.data;
    },

    // Follow a user/seller
    followUser: async (userId) => {
        const response = await api.post(`/users/${userId}/follow`);
        return response.data;
    },

    // Unfollow a user/seller
    unfollowUser: async (userId) => {
        const response = await api.delete(`/users/${userId}/follow`);
        return response.data;
    },

    // Check if currently following a user
    checkFollowing: async (userId) => {
        const response = await api.get(`/users/me/following/check/${userId}`);
        return response.data;
    },

    // Get user's followers list
    getFollowers: async (userId) => {
        const response = await api.get(`/users/${userId}/followers`);
        return response.data;
    },

    // Get user's following list
    getFollowing: async (userId) => {
        const response = await api.get(`/users/${userId}/following`);
        return response.data;
    },

    // Get feed of products from followed sellers
    getFeed: async (page = 1, limit = 12) => {
        const response = await api.get('/users/feed/products', {
            params: { page, limit }
        });
        return response.data;
    },
};

export default userService;
