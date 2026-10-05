import { createClient } from '@supabase/supabase-js';
import { prisma } from '../src/lib/prisma';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function fixDemoAdmin() {
  const email = 'demo@shopiespy.com';
  const password = 'DemoAdmin2026!';

  console.log('Cleaning up existing demo user...');
  await prisma.$executeRawUnsafe(`DELETE FROM auth.users WHERE email = '${email}';`);
  await prisma.$executeRawUnsafe(`DELETE FROM public.profiles WHERE email = '${email}';`);

  console.log('Signing up via Supabase GoTrue API to avoid schema errors...');
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { name: 'Demo Admin' }
    }
  });

  if (error) {
    console.error('Supabase signUp error:', error.message);
    return;
  }

  const userId = data.user?.id;
  if (!userId) {
    console.error('No user ID returned from signUp');
    return;
  }

  console.log('Confirming email via Prisma and updating profile...');
  // Force confirm the email so they can login immediately
  await prisma.$executeRawUnsafe(`
    UPDATE auth.users 
    SET email_confirmed_at = NOW(), 
        raw_app_meta_data = '{"provider":"email","providers":["email"]}'::jsonb,
        role = 'authenticated'
    WHERE id = '${userId}'::uuid;
  `);

  // Update their profile to be an admin
  const profile = await prisma.profile.upsert({
    where: { id: userId },
    update: {
      role: 'admin',
      credits: 9999,
      plan: 'agency'
    },
    create: {
      id: userId,
      email: email,
      role: 'admin',
      credits: 9999,
      plan: 'agency'
    }
  });

  console.log('✅ Demo admin fixed successfully!');
  console.log('Profile:', profile);
}

fixDemoAdmin()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
