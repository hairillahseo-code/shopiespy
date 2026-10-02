import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, email } = body;

    if (!userId || !email) {
      return NextResponse.json({ error: 'Missing userId or email' }, { status: 400 });
    }

    if (email === 'superadmin@shopiespy.com' || email === 'admin@shopiespy.com') {
      return NextResponse.json({ error: 'Cannot delete admin accounts.' }, { status: 403 });
    }

    // Attempt to delete from Supabase Auth if SERVICE_ROLE_KEY is available
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (serviceRoleKey) {
      const supabaseAdmin = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        serviceRoleKey
      );
      const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(userId);
      if (authError) {
        console.error('Error deleting from Supabase Auth:', authError);
        // Continue to delete from Prisma anyway
      }
    }

    // Delete from Prisma (will cascade delete related data)
    await prisma.profile.delete({
      where: { id: userId },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting user account:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
