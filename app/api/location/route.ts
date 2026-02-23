import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { lat, lng } = await req.json();
        if (!lat || !lng) {
            return NextResponse.json({ error: 'Koordinat kosong' }, { status: 400 });
        }

        // 1. BACKEND YANG NGE-FETCH KE BIGDATACLOUD (Tersembunyi dari Network Tab User!)
        const locRes = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=id`);
        const locData = await locRes.json();

        // 2. Ambil hanya data kotanya
        const exactCity = locData.city || locData.locality || locData.principalSubdivision;
        const finalLocationString = `${exactCity}, ${locData.countryName}`;

        // 3. Simpan ke Database
        await prisma.user.update({
            where: { id: session.user.id },
            data: {
                lastLocation: finalLocationString,
                lat: lat.toString(),
                lng: lng.toString()
            }
        });

        // 4. Kembalikan HANYA teks bersihnya ke Frontend
        return NextResponse.json({ success: true, location: finalLocationString });
    } catch (error) {
        console.error('API Location Error:', error);
        return NextResponse.json({ error: 'Gagal memproses lokasi' }, { status: 500 });
    }
}