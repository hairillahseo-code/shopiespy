import { prisma } from '../src/lib/prisma'
import crypto from 'crypto'

async function createDemoAdmin() {
  const email = 'demo@shopiespy.com'
  const password = 'DemoAdmin2026!'
  const userId = crypto.randomUUID()
  const identityId = crypto.randomUUID()

  console.log(`Setting up demo admin: ${email}...`)

  // 1. Delete previous entries if any
  await prisma.$executeRawUnsafe(`DELETE FROM auth.users WHERE email = '${email}';`)
  await prisma.$executeRawUnsafe(`DELETE FROM public.profiles WHERE email = '${email}';`)

  // 2. Insert into auth.users
  await prisma.$executeRawUnsafe(`
    INSERT INTO auth.users (
      instance_id,
      id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      raw_app_meta_data,
      raw_user_meta_data,
      created_at,
      updated_at,
      confirmation_token,
      email_change_token_current,
      email_change_token_new,
      recovery_token
    ) VALUES (
      '00000000-0000-0000-0000-000000000000',
      '${userId}'::uuid,
      'authenticated',
      'authenticated',
      '${email}',
      crypt('${password}', gen_salt('bf')),
      NOW(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      '{"name":"Demo Admin"}'::jsonb,
      NOW(),
      NOW(),
      '',
      '',
      '',
      ''
    );
  `)

  // 3. Insert into auth.identities
  await prisma.$executeRawUnsafe(`
    INSERT INTO auth.identities (
      id,
      user_id,
      identity_data,
      provider,
      provider_id,
      last_sign_in_at,
      created_at,
      updated_at
    ) VALUES (
      '${identityId}'::uuid,
      '${userId}'::uuid,
      json_build_object('sub', '${userId}', 'email', '${email}')::jsonb,
      'email',
      '${userId}',
      NOW(),
      NOW(),
      NOW()
    );
  `)

  // 4. Insert into public.profiles via Prisma
  const profile = await prisma.profile.create({
    data: {
      id: userId,
      email,
      role: 'admin',
      credits: 9999,
      plan: 'agency',
    },
  })

  console.log('✅ Demo Admin user created with full Auth identity & Prisma Profile!')
  console.log('Email:', email)
  console.log('Password:', password)
  console.log('Profile:', profile)
}

createDemoAdmin()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
