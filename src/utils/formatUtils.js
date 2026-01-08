/**
 * Format price with IDR currency
 * @param {number} price - The price to format
 * @returns {string} Formatted price string
 */
export const formatPrice = (price) => {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
    }).format(price);
};

/**
 * Format currency for admin pages (alias for formatPrice)
 * @param {number} amount - The amount to format
 * @returns {string} Formatted currency string
 */
export const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount);
};

/**
 * Simple price formatter without currency symbol
 * @param {number|string} value - The value to format
 * @returns {string} Formatted number string
 */
export const formatNumber = (value) => {
    return value ? new Intl.NumberFormat('id-ID').format(value) : '';
};

/**
 * Format relative time (time ago)
 * @param {string|Date} date - The date to format
 * @returns {string} Relative time string
 */
export const timeAgo = (date) => {
    if (!date) return '';
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    if (seconds < 60) return 'Baru saja';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} menit lalu`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} jam lalu`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days} hari lalu`;
    if (days < 30) return `${Math.floor(days / 7)} minggu lalu`;
    return new Date(date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
};

/**
 * Short time ago format for cards
 * @param {string|Date} date - The date to format
 * @returns {string} Short relative time string
 */
export const timeAgoShort = (date) => {
    if (!date) return '';
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    if (seconds < 60) return 'Baru saja';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}j`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}h`;
    if (days < 30) return `${Math.floor(days / 7)}mg`;
    return new Date(date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
};
