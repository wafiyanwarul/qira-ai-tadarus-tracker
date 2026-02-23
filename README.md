# 🌙 Qira.ai - Smart Tadarus Tracker (v2.5.0 Enterprise)

![Next.js](https://img.shields.io/badge/Next.js-16_Turbopack-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-3982CE?style=for-the-badge&logo=Prisma&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)
![Groq](https://img.shields.io/badge/Groq_Llama_3-F55036?style=for-the-badge&logo=groq&logoColor=white)
![Redis](https://img.shields.io/badge/Upstash_Redis-DC382D?style=for-the-badge&logo=redis&logoColor=white)

Qira.ai is a highly intelligent, voice-activated Tadarus (Quran reading) tracker. Upgraded to an Enterprise-grade architecture, it helps Muslims maintain their daily reading targets up to 10x Khatam during Ramadan. Featuring seamless AI extraction, server-side geocoding, L7 Edge security, and real-time caching.

🌐 **Live Demo:** [https://qira-ai-tadarus-tracker.vercel.app](https://qira-ai-tadarus-tracker.vercel.app)

---

## ✨ Key Features (v2.5.0)
- 🎙️ **Voice-to-JSON AI Extraction:** Simply say "Saya baca Al-Falaq ayat 1 sampai An-Nas ayat 6", and the app uses Groq Whisper & Llama-3.3-70B to instantly parse it.
- ♾️ **Infinite Multi-Khatam Engine:** Supports ambitious targets up to 10x Khatam per month with seamless loop isolation (prevents history overlap).
- 🕌 **Complete Khatam Celebration:** Beautiful UI featuring the full Arabic *Doa Khatam* from Imam an-Nawawi's *at-Tibyan*, complete with translations and Hadith references.
- 🎯 **Dynamic Daily Targets:** Automatically calculates how many pages you need to read per prayer (Sholat) based on your real-time geolocation and remaining Ramadan days.
- 🛡️ **Anti-Cheat Validation:** Mathematically prevents logging the same Ayah twice, blocks backward reading, and warns you if you accidentally skip any Ayahs.

## 🔒 Enterprise Security & Architecture
- **L7 Edge Rate Limiting:** Built-in Upstash Redis limiter via Next.js `proxy.ts` to block DDoS and bot spam (Max 30 requests/10s).
- **AI Energy Limiter:** Restricts users to 10 voice submissions per day to protect Groq API quotas.
- **Server-Side Geocoding (BFF):** Geolocation data (latitude/longitude) is processed strictly on the backend (`/api/location`) to hide third-party API responses from the client's Network Tab.
- **Precision Demographics:** Securely logs user's city and exact coordinates into the Supabase database for admin analytics.

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
# Database (Supabase / Prisma)
DATABASE_URL="postgresql://postgres.[YOUR_PROJECT]:[PASSWORD]@[aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true](https://aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true)"
DIRECT_URL="postgresql://postgres.[YOUR_PROJECT]:[PASSWORD]@[aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres](https://aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres)"

# AI Inference (Groq)
GROQ_API_KEY="gsk_..."

# Authentication (Google OAuth via GCP)
GOOGLE_CLIENT_ID="your_google_client_id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="your_google_client_secret"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your_super_secret_key"

# Caching & Rate Limiting (Upstash Redis)
UPSTASH_REDIS_REST_URL="[https://your-upstash-url.upstash.io](https://your-upstash-url.upstash.io)"
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