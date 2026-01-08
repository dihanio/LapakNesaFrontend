import api from './api';

/**
 * Wishlist Service - Handle user wishlist/favorites
 */

// Toggle product in wishlist (add/remove)
export const toggleWishlist = async (productId) => {
    const response = await api.post('/wishlist/toggle', { productId });
    return response.data;
};

// Get my wishlist
export const getMyWishlist = async () => {
    const response = await api.get('/wishlist');
    return response.data;
};

// Check if product is in wishlist
export const checkWishlist = async (productId) => {
    const response = await api.get(`/wishlist/check/${productId}`);
    return response.data;
};

// Remove from wishlist
export const removeFromWishlist = async (productId) => {
    const response = await api.delete(`/wishlist/${productId}`);
    return response.data;
};

export default {
    toggleWishlist,
    getMyWishlist,
    checkWishlist,
    removeFromWishlist,
};
