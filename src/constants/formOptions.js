/**
 * Faculty options for dropdown selects
 */
export const fakultasOptions = [
    { value: 'Fakultas Ilmu Pendidikan', label: 'Fakultas Ilmu Pendidikan (FIP)' },
    { value: 'Fakultas Bahasa dan Seni', label: 'Fakultas Bahasa dan Seni (FBS)' },
    { value: 'Fakultas Matematika dan Ilmu Pengetahuan Alam', label: 'Fakultas Matematika dan IPA (FMIPA)' },
    { value: 'Fakultas Ilmu Sosial dan Politik', label: 'Fakultas Ilmu Sosial dan Politik (FISIPOL)' },
    { value: 'Fakultas Teknik', label: 'Fakultas Teknik (FT)' },
    { value: 'Fakultas Ilmu Keolahragaan dan Kesehatan', label: 'Fakultas Ilmu Keolahragaan dan Kesehatan (FIKK)' },
    { value: 'Fakultas Ekonomika dan Bisnis', label: 'Fakultas Ekonomika dan Bisnis (FEB)' },
    { value: 'Fakultas Vokasi', label: 'Fakultas Vokasi (FV)' },
    { value: 'Fakultas Kedokteran', label: 'Fakultas Kedokteran (FK)' },
    { value: 'Fakultas Psikologi', label: 'Fakultas Psikologi (FPsi)' },
    { value: 'Fakultas Hukum', label: 'Fakultas Hukum (FH)' },
    { value: 'Fakultas Ketahanan Pangan', label: 'Fakultas Ketahanan Pangan (FKP)' },
    { value: 'PSDKU Magetan', label: 'PSDKU Kampus Magetan' },
];

/**
 * Location options for product forms
 */
export const lokasiList = [
    'Kampus 1 Ketintang',
    'Kampus 2 Lidah Wetan',
    'Kampus 3 Moestopo',
    'Kampus 5 Magetan',
];

/**
 * Product category options
 */
export const categories = [
    { name: 'Buku', value: 'Buku', icon: 'BookOpen' },
    { name: 'Elektronik', value: 'Elektronik', icon: 'MonitorSmartphone' },
    { name: 'Fashion', value: 'Fashion', icon: 'Shirt' },
    { name: 'Otomotif', value: 'Otomotif', icon: 'Car' },
    { name: 'Makanan', value: 'Makanan', icon: 'Utensils' },
    { name: 'Perabotan', value: 'Perabotan', icon: 'Armchair' },
    { name: 'Jasa', value: 'Jasa', icon: 'Hammer' },
    { name: 'Lainnya', value: 'Lainnya', icon: 'LayoutGrid' },
];

/**
 * Product transaction type options
 */
export const tipeTransaksi = [
    { value: 'jual', label: 'Jual', icon: 'Tag', desc: 'Jual langsung' },
    { value: 'sewa', label: 'Sewakan', icon: 'CalendarClock', desc: 'Sewa per periode' },
    { value: 'jasa', label: 'Jasa', icon: 'Hammer', desc: 'Tawarkan jasa' },
];

/**
 * Get condition list based on category
 * @param {string} kategori - Product category
 * @returns {string[]} Array of condition options
 */
export const getKondisiList = (kategori) => {
    if (kategori === 'Makanan') return ['Baru Dibuat', 'Pre-order'];
    if (kategori === 'Jasa') return ['Tersedia', 'Booking'];
    return ['Baru', 'Seperti Baru', 'Bekas - Mulus', 'Lecet Pemakaian'];
};
