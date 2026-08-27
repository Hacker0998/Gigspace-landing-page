# GigSpace Studio Web Platform

A production-ready, high-performance web platform and creative operations dashboard for **GigSpace Studio** — specializing in visual identity, 3D motion, kinetic typography, physical artwork, and interactive web experiences.

---

## ⚡ Tech Stack & Architecture

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, Motion (framer-motion)
- **Icons**: Lucide React
- **Backend & APIs**: Node.js, Express, REST APIs
- **Database & Storage**: Supabase (PostgreSQL with Row Level Security, Realtime, and Storage) / Firestore
- **Payments**: Flutterwave (Mobile Money UGX/KES/TZS, Visa, Mastercard)
- **CMS**: Real-time Section & Media CMS built into the Admin Dashboard

---

## 🚀 Quick Start & Local Setup

### 1. Clone & Install Dependencies

```bash
git clone https://github.com/your-username/gigspace.git
cd gigspace
npm install
```

### 2. Configure Environment Variables

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Set your credentials:
```env
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Admin Dashboard Passwords
CEO_PASS=colline
DESIGN_PASS=design123
FINANCE_PASS=finance2026
MARKETING_PASS=market2026
VIDEO_PASS=video2026
WEB_PASS=web2026

# Payments (Flutterwave)
FLW_PUBLIC_KEY=your-flutterwave-public-key
FLW_SECRET_KEY=your-flutterwave-secret-key
```

### 3. Database Setup (Supabase)

1. Go to your [Supabase Dashboard](https://supabase.com/dashboard).
2. Open the **SQL Editor**.
3. Run the schema migrations (tables for `leads`, `portfolio`, `tasks`, `transactions`, `site_settings`, `applications`, and storage buckets).

### 4. Run Development Server

```bash
npm run dev
```

The application will start on `http://localhost:3000`.

---

## 📦 Production Build & Deployment

### Build for Production:
```bash
npm run build
```

### Start Production Server:
```bash
npm start
```

### Deployment Platforms:
- **Vercel / Netlify**: Connect your GitHub repository, configure environment variables, and deploy.
- **Cloud Run / Docker**: Containerized deployment with full-stack Node/Express + Vite SPA.

---

## 🛡️ License

Private & Proprietary — © 2026 GigSpace Studio. All rights reserved.
