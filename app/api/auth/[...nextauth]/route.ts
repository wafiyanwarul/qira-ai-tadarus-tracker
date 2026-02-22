// app/api/auth/[...nextauth]/route.ts
import NextAuth, { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import { env } from "@/src/config/env";

export const authOptions: NextAuthOptions = {
    adapter: PrismaAdapter(prisma),
    providers: [
        GoogleProvider({
            clientId: env.GOOGLE_CLIENT_ID,
            clientSecret: env.GOOGLE_CLIENT_SECRET,
        }),
    ],
    secret: env.NEXTAUTH_SECRET,
    session: { strategy: "database" },

    pages: {
        signIn: '/', // Kalau belum login, arahkan ke beranda
        error: '/',  // Kalau ada error sesi (laptop sleep dll), paksa balik ke beranda
    },

    callbacks: {
        async session({ session, user }) {
            if (session.user) {
                session.user.id = user.id; // Tipe data ini udah aman berkat file next-auth.d.ts kamu!
            }
            return session;
        },
    },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };