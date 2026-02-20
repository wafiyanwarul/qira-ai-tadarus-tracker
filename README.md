# 🌙 Qira.ai - Smart Tadarus Tracker (v1.0.0)

![Next.js](https://img.shields.io/badge/Next.js-black?style=for-the-badge&logo=next.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-2D3748?style=for-the-badge&logo=prisma&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)
![Vercel](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)

**Qira.ai** is a smart, voice-activated Tadarus (Quran reading) tracker. Designed to help Muslims maintain their daily Quran reading targets, especially during Ramadan, with a seamless and organic user experience.

🌐 **Live Demo:** [qira-ai-tadarus-tracker.vercel.app](https://qira-ai-tadarus-tracker.vercel.app) *(Replace with your actual Vercel link)*

---

## 📖 About The Project

Instead of manually logging chapters (Juz) or verses (Ayah) through tedious forms, users can simply speak their progress naturally (e.g., *"Alhamdulillah, hari ini baca dari Surah Al-Baqarah ayat 200 sampai Ali Imran ayat 50"*). 

Qira.ai uses **AI Speech-to-Text (Groq Whisper)** and **LLM Data Extraction (Gemini 2.5 Flash)** to automatically extract the Surah and Ayah, calculate the exact pages read based on the Madinah Mushaf standard (604 pages), and dynamically adjust future reading targets to keep users on track for their Khatam goals.

## ✨ Key Features

- 🎙️ **Natural Voice Logging:** Log your tadarus progress using voice notes. No typing required.
- 🧠 **AI-Powered Extraction:** Understands unstructured natural speech and converts it into precise JSON data (Start Surah/Ayah to End Surah/Ayah).
- 📍 **Smart Prayer Routing (Geolocation):** Automatically detects user location to fetch real-time prayer timings via Aladhan API, breaking down the remaining daily target into bite-sized pages per upcoming prayer.
- 🛡️ **Quranic Gatekeeper Validation:** Cross-checks voice input against standard Quran metadata to prevent hallucinated verses.
- 🎨 **Sahara & Matcha Aesthetic UI:** A grounding, earthy, and humanist user interface designed specifically for a spiritual app, complete with glassmorphism effects.
- 🎉 **Emotional Rewards:** Features audio success chimes and canvas-confetti celebrations when daily targets are met.

## 🛠️ Tech Stack

- **Frontend:** Next.js 14 (App Router), React, Tailwind CSS, Lucide Icons, SweetAlert2
- **Backend/API:** Next.js Route Handlers
- **AI Models:** Groq SDK (Whisper-large-v3) & Google Gemini SDK (Gemini-2.5-flash)
- **Database:** PostgreSQL hosted on Supabase (Connection Pooling)
- **ORM:** Prisma Client with `@prisma/adapter-pg`
- **Deployment:** Vercel

## 🚀 Getting Started (Local Development)

To run this project locally, follow these steps:

1. **Clone the repository:**
   ```bash
   git clone [https://github.com/wafiyanwarul/qira-ai-tadarus-tracker.git](https://github.com/wafiyanwarul/qira-ai-tadarus-tracker.git)
   cd qira-ai-tadarus-tracker
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up Environment Variables:**
   Create a `.env.local` and `.env` file in the root directory and add your keys:
   ```env
   DATABASE_URL="postgresql://postgres.[YOUR_SUPABASE_ID]:[PASSWORD]@[aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres](https://aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres)"
   DIRECT_URL="postgresql://postgres.[YOUR_SUPABASE_ID]:[PASSWORD]@[aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres](https://aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres)"
   GROQ_API_KEY="your_groq_api_key"
   GEMINI_API_KEY="your_gemini_api_key"
   ```

4. **Run Prisma Migrations:**
   ```bash
   npx prisma db push
   npx prisma generate
   ```

5. **Start the development server:**
   ```bash
   npm run dev
   ```

## 🗺️ Future Roadmap (v2.0)
- [ ] **Authentication:** Google OAuth integration for personalized user accounts.
- [ ] **Official Quran API Integration:** Fetching real-time Arabic text and translations.
- [ ] **Rate Limiting:** Upstash Redis implementation to manage AI API calls per user.

---
*Crafted with 🤍 by **Wafiy Anwarul Hikam**.*