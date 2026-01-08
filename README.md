# 🛍️ LapakNesa - Marketplace Mahasiswa UNESA

<div align="center">

![LapakNesa](https://img.shields.io/badge/LapakNesa-Marketplace%20UNESA-blue?style=for-the-badge)
![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react)
![Express](https://img.shields.io/badge/Express-4-000000?style=flat-square&logo=express)
![MongoDB](https://img.shields.io/badge/MongoDB-Cloud-47A248?style=flat-square&logo=mongodb)
![Socket.IO](https://img.shields.io/badge/Socket.IO-Real--time-010101?style=flat-square&logo=socketdotio)

**Platform marketplace khusus mahasiswa Universitas Negeri Surabaya (UNESA)**  
*Jual Beli Langsung via Chat - COD di Kampus*

</div>

---

## 📋 Daftar Isi

- [Tentang LapakNesa](#-tentang-lapaknesa)
- [Fitur Utama](#-fitur-utama)
- [Tech Stack](#%EF%B8%8F-tech-stack)
- [Struktur Project](#-struktur-project)
- [Cara Menjalankan](#-cara-menjalankan)
- [Environment Variables](#-environment-variables)
- [API Endpoints](#-api-endpoints)

---

## 🎯 Tentang LapakNesa

LapakNesa adalah platform marketplace peer-to-peer yang dirancang khusus untuk mahasiswa UNESA. Platform ini memfasilitasi transaksi jual beli langsung antar mahasiswa dengan sistem COD (Cash on Delivery) di area kampus.

### 🏫 Kampus yang Didukung
- **Kampus 1 Ketintang** - Jl. Ketintang, Surabaya
- **Kampus 2 Lidah Wetan** - Jl. Lidah Wetan, Surabaya  
- **Kampus 3 Moestopo** - Jl. Prof. Dr. Moestopo No.4, Surabaya (Fakultas Ketahanan Pangan)
- **Kampus 5 Magetan** - Magetan, Jawa Timur

### 🏛️ Fakultas yang Terdaftar
1. Fakultas Ilmu Pendidikan (FIP)
2. Fakultas Bahasa dan Seni (FBS)
3. Fakultas Matematika dan IPA (FMIPA)
4. Fakultas Ilmu Sosial dan Politik (FISIPOL)
5. Fakultas Teknik (FT)
6. Fakultas Ilmu Keolahragaan dan Kesehatan (FIKK)
7. Fakultas Ekonomika dan Bisnis (FEB)
8. Fakultas Vokasi
9. Fakultas Kedokteran (FK)
10. Fakultas Psikologi
11. Fakultas Hukum (FH)
12. Fakultas Ketahanan Pangan (FKP)
13. PSDKU Kampus Magetan

---

## ✨ Fitur Utama

### 🔐 1. Autentikasi & Keamanan
- **Google OAuth 2.0** - Login menggunakan akun email mahasiswa (`@mhs.unesa.ac.id`)
- **Role-Based Access Control**:
  - **Pembeli** - Role default, dapat menjelajah dan chat
  - **Penjual** - Dapat memasang iklan dan mengelola produk
  - **Admin** - Akses penuh ke panel administrasi
- **JWT Authentication** - Keamanan sesi dengan JSON Web Token
- **End-to-End Encryption** - Pesan chat terenkripsi untuk privasi

### 🏪 2. Marketplace Multi-Kategori
| Kategori | Detail Khusus |
|----------|---------------|
| 📚 **Buku** | Penulis, penerbit, tahun terbit, ISBN |
| 📱 **Elektronik** | Merk, garansi, spesifikasi |
| 👗 **Fashion** | Ukuran, warna, merk, bahan |
| 🍔 **Makanan** | Expired date, halal, porsi, pre-order |
| 🏍️ **Otomotif** | Kendaraan, sparepart, aksesoris dengan detail lengkap |
| 🛠️ **Jasa** | Tipe layanan, ketersediaan, durasi, pengalaman |
| 🪑 **Perabotan** | Dimensi, material, berat |
| 🎯 **Alat Kuliah, Olahraga, Hobi, Lainnya** | Kategori umum |

### 💼 3. Tipe Transaksi
- **Jual** - Transaksi jual beli langsung
- **Sewa** - Sistem rental dengan harga per hari/minggu/bulan + deposit
- **Jasa** - Penawaran layanan dengan pricing fleksibel

### 💬 4. Chat Real-time
- **Floating Chat Widget** - Akses chat dari mana saja via bubble di pojok kanan bawah
- **Socket.IO Integration** - Pesan real-time tanpa refresh
- **Fitur Lengkap**:
  - 📷 Kirim foto
  - 😀 Emoji picker dengan 8 kategori
  - 📎 Reply message
  - 🔍 Search dalam chat
  - 📹 Capture foto dari kamera
  - ✏️ Delete message
  - 🔗 Auto-link detection
- **Typing Indicator** - Indikator sedang mengetik
- **Online Status** - Status online/offline user

### 📊 5. Dashboard Penjual
- **Overview Statistics** - Iklan aktif, terjual, total penjualan
- **Manajemen Produk**:
  - ➕ Pasang iklan baru dengan form lengkap
  - ✏️ Edit produk yang sudah diposting
  - 🗑️ Hapus produk
  - ✅ Tandai sebagai terjual/aktifkan kembali
- **Wishlist** - Daftar produk yang disimpan
- **Pengaturan Profil** - Edit NIM, fakultas, WhatsApp

### 👤 6. Profil & Upgrade Role
- **Profil Lengkap** - Nama, email, NIM, fakultas, WhatsApp
- **Upgrade ke Penjual** - Lengkapi profil untuk mulai berjualan
- **Follow System** - Ikuti penjual favorit
- **Verifikasi KTM** - Upload KTM untuk badge terverifikasi

### 🔧 7. Admin Dashboard
- **User Management** - Lihat, ban/unban user
- **Verifikasi KTM** - Approve/reject request verifikasi penjual
- **Product Approval** - Review dan approve/reject produk baru sebelum tampil publik
- **Statistik Platform** - Total user, produk, pending approvals
- **Product Moderation** - Kelola produk yang diposting

### ❤️ 8. Fitur Tambahan
- **Wishlist** - Simpan produk favorit
- **Recently Viewed** - Riwayat produk yang dilihat (tersimpan di database untuk user login)
- **Product Recommendations** - Produk serupa berdasarkan kategori
- **Share Product** - Web Share API atau copy link
- **Responsive Design** - Optimal di desktop dan mobile

---

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|------------|---------|
| **React 19** | UI Framework |
| **Vite** | Build tool & dev server |
| **Zustand** | State management |
| **React Router DOM** | Client-side routing |
| **Axios** | HTTP client |
| **Socket.IO Client** | Real-time communication |
| **TailwindCSS** | Styling |
| **Material Symbols** | Icons |

### Backend
| Technology | Purpose |
|------------|---------|
| **Bun** | JavaScript runtime |
| **Express.js** | REST API framework |
| **MongoDB + Mongoose** | Database & ODM |
| **Socket.IO** | Real-time WebSocket |
| **Passport.js** | Google OAuth authentication |
| **JWT** | Token-based auth |
| **Cloudinary** | Image upload & storage |
| **Multer** | File upload middleware |

---

## 📁 Struktur Project

```
lapaknesa/
├── frontend/                 # React + Vite frontend
│   ├── src/
│   │   ├── components/       # Reusable UI components
│   │   │   ├── ChatBubble.jsx       # Floating chat widget
│   │   │   ├── Navbar.jsx           # Navigation bar
│   │   │   ├── ProductCard.jsx      # Product card component
│   │   │   ├── SellProductForm.jsx  # Product listing form
│   │   │   └── ...
│   │   ├── pages/            # Page components
│   │   │   ├── HomePage.jsx         # Landing page
│   │   │   ├── BrowsePage.jsx       # Product listing
│   │   │   ├── ProductDetailPage.jsx # Product detail
│   │   │   ├── DashboardPage.jsx    # User dashboard
│   │   │   ├── Admin*.jsx           # Admin pages
│   │   │   └── ...
│   │   ├── services/         # API & socket services
│   │   ├── store/            # Zustand stores
│   │   └── App.jsx           # Main app component
│   └── package.json
│
├── backend/                  # Express.js backend
│   ├── src/
│   │   ├── controllers/      # Request handlers
│   │   ├── models/           # Mongoose schemas
│   │   │   ├── User.js
│   │   │   ├── Product.js
│   │   │   ├── Conversation.js
│   │   │   ├── Message.js
│   │   │   └── Wishlist.js
│   │   ├── routes/           # API routes
│   │   ├── middleware/       # Auth & upload middleware
│   │   ├── config/           # Database & passport config
│   │   └── app.js            # Express app entry
│   └── package.json
│
└── README.md
```

---

## 🚀 Cara Menjalankan

### Prasyarat
- **Bun** atau **Node.js** (v18+)
- **MongoDB** (Local atau MongoDB Atlas)
- **Cloudinary Account** (untuk upload gambar)
- **Google Cloud Console** (untuk OAuth)

### 1. Clone Repository
```bash
git clone https://github.com/username/lapaknesa.git
cd lapaknesa
```

### 2. Setup Backend
```bash
cd backend
cp .env.example .env   # Buat file .env
bun install
bun run dev
```

### 3. Setup Frontend
```bash
cd frontend
bun install
bun run dev
```

### 4. Buka Browser
- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:5000`

---

## 🔑 Environment Variables

### Backend `.env`
```env
# Server
PORT=5000
NODE_ENV=development

# Database
MONGO_URI=mongodb://localhost:27017/lapaknesa

# JWT
JWT_SECRET=your-super-secret-jwt-key

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback

# Cloudinary
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Frontend URL
CLIENT_URL=http://localhost:5173
```

### Frontend `.env`
```env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

---

## 📡 API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/auth/google` | Initiate Google OAuth |
| GET | `/api/auth/google/callback` | OAuth callback |
| GET | `/api/auth/me` | Get current user |
| PUT | `/api/auth/complete-profile` | Complete user profile |

### Products
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/products` | Get all products (with filters) |
| GET | `/api/products/:id` | Get product by ID |
| POST | `/api/products` | Create new product (auth) |
| PUT | `/api/products/:id` | Update product (auth) |
| DELETE | `/api/products/:id` | Delete product (auth) |
| GET | `/api/products/user/my` | Get current user's products |

### Chat
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/chat/conversations` | Get user's conversations |
| POST | `/api/chat/conversations` | Create conversation |
| GET | `/api/chat/conversations/:id/messages` | Get messages |
| POST | `/api/chat/messages/send` | Send message |

### Wishlist
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/wishlist` | Get user's wishlist |
| POST | `/api/wishlist/toggle/:productId` | Toggle wishlist |

### Admin
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/users` | Get all users |
| GET | `/api/admin/stats` | Get platform stats |
| PUT | `/api/admin/users/:id/ban` | Ban/unban user |
| GET | `/api/admin/verifications` | Get pending seller verifications |
| POST | `/api/admin/verifications/:id/approve` | Approve seller |
| POST | `/api/admin/verifications/:id/reject` | Reject seller |
| GET | `/api/admin/products` | Get all products |
| GET | `/api/admin/products/pending` | Get pending product approvals |
| PUT | `/api/admin/products/:id/approve` | Approve product |
| PUT | `/api/admin/products/:id/reject` | Reject product |
| DELETE | `/api/admin/products/:id` | Delete product |

---

## 📄 License

MIT License - Lihat file [LICENSE](LICENSE) untuk detail.

---

<div align="center">

**LapakNesa** - *Dari Mahasiswa, Oleh Mahasiswa, Untuk Mahasiswa UNESA* 🎓

Made with ❤️ in Surabaya

</div>
