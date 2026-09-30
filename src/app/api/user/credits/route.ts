import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, email } = body;

    if (!userId) {
      return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
    }

    // Attempt to find the user profile
    let profile = await prisma.profile.findUnique({
      where: { id: userId },
    });

    // If it doesn't exist, create it via Prisma (bypassing RLS)
    if (!profile) {
      const isAdmin = email === 'admin@shopiespy.com' || email === 'superadmin@shopiespy.com';
      profile = await prisma.profile.create({
        data: {
          id: userId,
          email: email || `user_${userId.slice(0, 8)}@shopiespy.com`,
          credits: isAdmin ? -1 : 3,
          role: isAdmin ? 'admin' : 'user',
          plan: isAdmin ? 'agency' : 'free',
        },
      });
    }

    return NextResponse.json({ success: true, credits: profile.credits });
  } catch (error: any) {
    console.error('Error fetching user credits:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
