import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    // Karena menggunakan Prisma di backend, query ini akan membypass (melewati) RLS Supabase secara otomatis
    const users = await prisma.profile.findMany({
      orderBy: { credits: 'desc' }
    });
    
    return NextResponse.json({ success: true, users });
  } catch (error: any) {
    console.error('Error fetching users:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const { userId, action } = await request.json();
    
    if (action === 'ban') {
      const updatedUser = await prisma.profile.update({
        where: { id: userId },
        data: { role: 'banned', credits: 0 }
      });
      return NextResponse.json({ success: true, user: updatedUser });
    }
    
    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    console.error('Error updating user:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
