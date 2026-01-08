# 🛍️ LapakNesa Frontend

Aplikasi web **LapakNesa** - Platform jual beli khusus mahasiswa UNESA.

![LapakNesa](https://img.shields.io/badge/UNESA-LapakNesa-blue?style=for-the-badge)

## ✨ Fitur

- 🔐 **Login dengan Google** (khusus email UNESA)
- 🛒 **Jual & Beli Barang** (Baru, Bekas, Sewa, Jasa)
- 💬 **Chat Real-time** dengan penjual
- ❤️ **Wishlist** produk favorit
- 🔔 **Notifikasi** pesanan baru
- 📊 **Dashboard Penjual** dengan statistik
- 🛡️ **Admin Panel** untuk moderasi

## 🚀 Tech Stack

- **Framework**: React 18 + Vite
- **Styling**: TailwindCSS
- **State**: Zustand
- **Icons**: Lucide React
- **HTTP**: Axios
- **Real-time**: Socket.IO Client

## 📦 Instalasi

```bash
# Clone repository
git clone https://github.com/dihanio/LapakNesaFrontend.git
cd LapakNesaFrontend

# Install dependencies
bun install
# atau
npm install

# Setup environment
cp .env.example .env
# Edit VITE_API_URL dengan URL backend
```

## ⚙️ Environment Variables

```env
VITE_API_URL=http://localhost:5000/api
```

Untuk production, ganti dengan URL backend yang sudah di-deploy (contoh: `https://lapaknesa-api.onrender.com/api`)

## 🏃 Menjalankan

```bash
# Development
bun dev

# Build production
bun run build

# Preview production build
bun run preview
```

Aplikasi akan berjalan di `http://localhost:5173`

## 📁 Struktur Folder

```
src/
├── components/     # Reusable UI components
├── pages/          # Route pages
├── services/       # API service functions
├── store/          # Zustand state stores
├── utils/          # Helper functions
└── constants/      # Static data & options
```

## 🎨 Halaman Utama

| Halaman | Path | Deskripsi |
|---------|------|-----------|
| Beranda | `/` | Landing page + produk rekomendasi |
| Jelajah | `/browse` | Explore semua produk |
| Detail Produk | `/product/:id` | Info lengkap produk |
| Dashboard | `/dashboard` | Panel penjual/pembeli |
| Chat | `/chat` | Percakapan dengan penjual |
| Admin | `/admin` | Panel admin (khusus admin) |

## 🚢 Deployment (Vercel)

1. Import repository di [Vercel](https://vercel.com)
2. Root Directory: `./` (atau sesuaikan)
3. Framework Preset: Vite
4. Environment Variables:
   - `VITE_API_URL` = URL backend Render

## 🔗 Related Repository

- **Backend**: [LapakNesaBackend](https://github.com/dihanio/LapakNesaBackend)

## 📄 License

MIT License - Dibuat dengan ❤️ oleh Tim LapakNesa UNESA
