# ShopieSpy Development Roadmap

Proyek ini dibangun dengan objektif untuk menjadi utilitas **Shopify Intelligence & Spy Tool** premium, dengan target exit Flippa ($300 – $500).

## ✅ Fase 1: Fondasi & UI/UX (SELESAI)
- [x] Inisialisasi Next.js 15 (App Router), Tailwind V4, TypeScript.
- [x] Konfigurasi warna UI: *Dark Slate* (`#0F172A`) & *Emerald Green* (`#10B981`).
- [x] Pembuatan Landing Page berkonversi tinggi dengan estetika *Premium Spy Tool*.

## ✅ Fase 2: Store X-Ray & Core Scraping Engine (SELESAI)
- [x] Install library `cheerio` untuk parsing HTML.
- [x] Buat Route Handler `/api/analyze-store` untuk mengambil URL Shopify dan mengekstrak metadata.
- [x] Bangun logika deteksi Tema Shopify (mencari `window.Shopify.theme`).
- [x] Bangun logika deteksi Aplikasi (mencari *script tags* populer seperti Klaviyo, Loox, dll).
- [x] Buat UI Dashboard Analyzer dengan efek *skeleton loading* bergaya radar/hacker.

## ✅ Fase 3: Best-Seller CSV Extractor (SELESAI)
- [x] Integrasikan eksploitasi endpoint `/collections/all.json?sort_by=best-selling`.
- [x] Tampilkan produk terlaris dalam bentuk *Data Table* berdesain premium.
- [x] Gunakan ulang `papaparse` untuk fitur **"1-Click Export to Shopify CSV"**.

## ✅ Fase 4: Facebook Ads Spy & AI Takedown (SELESAI)
- [x] Buat algoritma untuk mendeteksi profil media sosial dari *footer* target.
- [x] Buat fitur **"Ad Library Deep-Linker"** yang otomatis membuka iklan kompetitor.
- [x] Sambungkan Gemini API untuk fitur **"AI Takedown"** (Menganalisis dan menulis ulang deskripsi produk kompetitor).

## ✅ Fase 5: Sistem Auth & Database (Supabase) (SELESAI)
- [x] Integrasi Supabase untuk fitur *Login/Register*.
- [x] Buat tabel *Database* untuk melacak jumlah *Spy Credits* per *user*.
- [x] Berikan 3 kredit gratis otomatis saat *user* baru mendaftar.
- [x] Lindungi API agar hanya bisa diakses oleh *user* yang memiliki kredit.

## ✅ Fase 6: Super Admin Dashboard & Prisma ORM (SELESAI)
- [x] Buat rute rahasia `/admin` khusus untuk pemilik web (`admin@shopiespy.com`).
- [x] Buat kartu metrik: Total Pendapatan, Jumlah User, dan Kredit Terpakai.
- [x] Buat tabel manajemen *user* untuk melihat daftar pelanggan.
- [x] Integrasi Prisma ORM (`prisma/schema.prisma`) tersinkronisasi ke PostgreSQL Supabase.
- [x] Skema database modular (`Profile`, `StoreAnalysis`, `SavedProduct`) untuk kemudahan pengembangan jangka panjang.

## ✅ Fase 7: Tactical Playbook & Monetization Center (SELESAI)
- [x] **Competitor Tactical Playbook**: Deep theme intelligence (estimasi biaya, arsitektur OS 2.0, cheat code tema gratis untuk pemula).
- [x] **Secret Apps Breakdown**: Analisis taktik mesin cuan kompetitor (Klaviyo, Loox, Smile.io, dll), estimasi biaya stack ($240–$480/bln), dan alternatif gratis untuk pemula.
- [x] **Super Admin Payment Manager**: Konfigurasi gateway global di `/admin` (Stripe, LemonSqueezy, PayPal Commerce).
- [x] **Dynamic Pricing & Paywall**: Penentuan harga paket (Starter, Pro, Agency) dan tautan checkout dinamis tersinkronisasi ke Prisma DB (`system_settings`).

## ✅ Fase 8: Stripe & PayPal Sandbox Ready & Flippa Handover (SELESAI)
- [x] **Stripe Sandbox & PayPal Sandbox Pre-configured**: Super Admin panel `/admin` disetting default ke Sandbox Mode lengkap dengan toggle **Sandbox (Testing)** vs **Live (Production)**.
- [x] **Real Working Checkout Flow**: Modal checkout interaktif dengan integrasi kartu uji Stripe (`4242 4242 4242 4242`) dan PayPal Sandbox.
- [x] **Instant Automated Credit Fulfillment**: Endpoint `/api/checkout/verify` langsung mengupdate saldo kredit dan plan user di database PostgreSQL Supabase via Prisma ORM.
- [x] **Checkout Success Celebration**: Halaman `/checkout/success` dengan konfirmasi pembayaran real-time dan navigasi instan ke store scanner.
- [x] **Zero Code Handover for Flippa Buyers**: Pembeli Flippa hanya perlu memasukkan API keys Live milik mereka di Admin Settings dan mengganti toggle ke Live untuk langsung menerima pembayaran asli dari pelanggan internasional.

## ✅ Fase 9: PPSPY-Inspired Intelligence Suite (SELESAI)
- [x] **Fitur #1: 1-Click Supplier Sourcing & Factory Match**:
  - Tombol `Source 🛒` di setiap produk terlaris.
  - Smart Sourcing Modal dengan kalkulator margin laba dropship (3x–4x markup).
  - 4 Portal Sourcing langsung: AliExpress, CJ Dropshipping (gudang US/EU), Google Lens Reverse Image Match (pabrik 1688/Taobao), dan Alibaba Bulk Wholesale.
- [x] **Fitur #2: Multi-Network Ad Intelligence Hub (TikTok + Meta)**:
  - Ad Intelligence Hub dengan dukungan 3 network iklan.
  - Deep-link otomatis ke **TikTok Creative Center Top Ads** berdasarkan brand target.
  - Deep-link pencarian video viral & UGC hooks di TikTok.
  - Deep-link Meta (Facebook & Instagram) Ad Library.
- [x] **Fitur #3: Store Revenue & Velocity Estimator**:
  - Banner metrik keuangan real-time: **Est. Monthly Revenue** (`$14,500 – $48,000 / mo`).
  - **AOV (Average Order Value)** rata-rata katalog produk.
  - **Price Range** (produk termurah vs termahal).
  - **Catalog Health & Velocity Status** (`Active Scaling 🚀` / `High Velocity`).

---

## 🔮 Fase Mendatang: Scaling Valuasi Flippa ($800 – $1,500+)

### 🚀 Fase 10: Official ShopieSpy Chrome Extension (Manifest V3)
*Valuation Booster Terbesar — Memikat pembeli internasional karena retensi user tinggi.*
- [ ] Buat package ekstensi di direktori `extension/` menggunakan Google Chrome Manifest V3.
- [ ] Tombol 1-klik di pojok browser yang mendeteksi apakah tab yang aktif merupakan toko Shopify.
- [ ] Popup ekstensi menampilkan: Tema aktif, estimasi omset toko, secret apps, dan top best-seller tanpa perlu meninggalkan halaman toko kompetitor.
- [ ] Integrasi otentikasi login / API key ShopieSpy agar pemakaian kredit tersinkronisasi ke web app.
- [ ] Panduan instalasi dan publikasi ke Chrome Web Store bagi pemilik baru.

### 🔥 Fase 11: "Trending Winning Products Radar" (Curated Dropshipping Feed)
*Menyediakan solusi instan bagi dropshipper pemula yang belum memiliki toko target.*
- [ ] Buat tab baru di navigasi web: **`🔥 Winning Products Radar`**.
- [ ] Menampilkan feed 15–25 produk dropship viral terkurasi dengan metrik:
  - Skor Tren Viral (Trending Score).
  - Estimasi Margin Keuntungan (Cost vs Retail Price).
  - 1-Click Supplier Links (AliExpress / CJ Dropshipping).
  - Link Video Iklan Kompetitor (TikTok / Meta Ads).
- [ ] Filter berdasarkan kategori (Beauty, Gadget, Home & Kitchen, Pet Supplies).

### ⚔️ Fase 12: Store vs Store Competitor Battle (Side-by-Side Comparison)
*Fitur perbandingan kompetisi langsung untuk analisis mendalam.*
- [ ] Halaman pembanding multi-toko (Input URL Toko A vs Toko B).
- [ ] Komparasi metrik:
  - AOV Toko A vs Toko B.
  - Kecepatan rilis produk baru (Catalog Velocity).
  - Biaya bulanan tech stack (Apps Spend Comparison).
  - Tema yang digunakan & keunggulan konversi masing-masing.

### 📋 Fase 13: Flippa Exit Asset Kit & Buyer Handover Documentation
*Mempersiapkan seluruh materi penjualan agar listing di Flippa cepat laku dalam 7–14 hari.*
- [x] Buat dokumen komprehensif `FLIPPA_LISTING_PLAYBOOK.md`:
  - **Copywriting Listing Flippa Berbahasa Inggris Profesional**: Memaparkan nilai SaaS, Next.js 15, Supabase, Stripe/PayPal Sandbox, dan keunggulan kompetitif dibanding PPSPY/Koala Inspector.
  - **Petunjuk Serah Terima Pembeli (Buyer Handover Guide)**: Panduan langkah demi langkah cara mengganti API Key Stripe/PayPal ke mode Live, mentransfer akun Supabase, dan menghubungkan domain kustom.
  - **Strategi Monetisasi & Pertumbuhan**: Saran cara menjalankan SEO, TikTok Organic, dan Reddit marketing untuk pemilik baru.

