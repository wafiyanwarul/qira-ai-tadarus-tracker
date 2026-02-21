import { cleanEnv, str } from 'envalid';

export const env = cleanEnv(process.env, {
  NODE_ENV: str({
    choices: ['development', 'test', 'production'],
    default: 'development',
  }),
  DATABASE_URL: str({ desc: 'PostgreSQL connection string for Prisma' }),
  GROQ_API_KEY: str({ desc: 'Groq API key for transcription' }),
  GEMINI_API_KEY: str({ desc: 'Google Gemini API key for extraction' }),
  // --- NEW FOR NEXTAUTH ---
  GOOGLE_CLIENT_ID: str({ desc: 'Google OAuth Client ID' }),
  GOOGLE_CLIENT_SECRET: str({ desc: 'Google OAuth Client Secret' }),
  NEXTAUTH_URL: str({ desc: 'NextAuth Base URL' }),
  NEXTAUTH_SECRET: str({ desc: 'NextAuth Session Secret' }),
  // --- NEW FOR UPSTASH REDIS ---
  UPSTASH_REDIS_REST_URL: str({ desc: 'Upstash Redis REST URL' }),
  UPSTASH_REDIS_REST_TOKEN: str({ desc: 'Upstash Redis REST Token' }),
});

export const envStatus = {
  NODE_ENV: env.NODE_ENV,
  DATABASE_URL: env.DATABASE_URL ? 'set' : 'missing',
  GROQ_API_KEY: env.GROQ_API_KEY ? 'set' : 'missing',
  GEMINI_API_KEY: env.GEMINI_API_KEY ? 'set' : 'missing',
  GOOGLE_AUTH: env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET ? 'set' : 'missing',
} as const;

if (!env.isProduction) {
  console.log('[env] Loaded server env:', envStatus);
}
