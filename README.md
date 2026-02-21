# 🌙 Qira.ai - Smart Tadarus Tracker (v2.0.0)

![Next.js](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-3982CE?style=for-the-badge&logo=Prisma&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)
![Groq](https://img.shields.io/badge/Groq_Llama_3-F55036?style=for-the-badge&logo=groq&logoColor=white)
![Redis](https://img.shields.io/badge/Upstash_Redis-DC382D?style=for-the-badge&logo=redis&logoColor=white)

Qira.ai is a highly intelligent, voice-activated Tadarus (Quran reading) tracker. Designed to help Muslims maintain their daily Quran reading targets during Ramadan and beyond, featuring seamless AI extraction, secure Google authentication, and real-time caching.

🌐 **Live Demo:** [https://qira-ai-tadarus-tracker.vercel.app](https://qira-ai-tadarus-tracker.vercel.app)

---

## ✨ Features (v2.0.0)
- 🎙️ **Voice-to-JSON AI Extraction:** Simply say "Saya baca Al-Baqarah ayat 1 sampai 5", and the app uses Groq Whisper & Llama-3.3-70B to instantly parse it.
- 🔐 **Secure Authentication:** Seamless Google Login powered by NextAuth.js.
- ⚡ **Rate Limiting (Energy System):** Built-in Upstash Redis limiter to grant users 10 submissions per day, preventing API abuse.
- 📖 **Instant Arabic Text Fetching:** Displays the original Arabic text & translation of your last read Ayah, cached in Redis for 0ms loading time.
- 🛡️ **Overlap & Gap Detection:** Mathematically prevents you from logging the same Ayah twice in a day, and warns you if you accidentally skipped any Ayahs.
- 🎯 **Dynamic Daily Targets:** Automatically calculates how many pages you need to read per prayer (Sholat) based on your realtime geolocation and daily Khatam target.

---

## 🏗️ Architecture
- **Frontend:** Next.js 14 (App Router), React, Tailwind CSS.
- **Backend:** Next.js Serverless API Routes.
- **Database:** PostgreSQL (hosted on Supabase), managed via Prisma ORM.
- **Caching & Rate Limiting:** Upstash Redis (Serverless In-Memory Database).
- **AI Models:** Groq `whisper-large-v3` (Audio) & `llama-3.3-70b-versatile` (JSON Extraction).

---

## 🚀 Getting Started

### 1. Clone the repository
```bash
git clone https://github.com/wafiyanwarul/qira-ai-tadarus-tracker.git
cd qira-ai-tadarus-tracker
```

### 2. Install dependencies
```bash
npm install
```

### 3. Setup Environment Variables
Create a `.env.local` file in the root directory and add the following keys. You will need to provision accounts on Supabase, Groq, Google Cloud Console, and Upstash.

# Database (Supabase / Prisma)
```bash
DATABASE_URL="postgresql://postgres.[YOUR_PROJECT]:[PASSWORD]@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.[YOUR_PROJECT]:[PASSWORD]@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres"
```

# AI Inference (Groq)
```bash
GROQ_API_KEY="gsk_..."
```

# Authentication (Google OAuth via GCP)
```
GOOGLE_CLIENT_ID="your_google_client_id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="your_google_client_secret"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your_super_secret_key"
```

# Caching & Rate Limiting (Upstash Redis)
```bash
UPSTASH_REDIS_REST_URL="https://your-upstash-url.upstash.io"
UPSTASH_REDIS_REST_TOKEN="your_upstash_token"
```

### 4. Setup Database Schema
Push the Prisma schema to your Supabase PostgreSQL instance:
```bash
npx prisma db push
npx prisma generate
```

### 5. Run the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

---

## 👨‍💻 Developed By
Crafted with 🤍 by **Wafiy Anwarul Hikam** (Illusphere Creative).