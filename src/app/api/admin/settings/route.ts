import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const DEFAULT_SETTINGS = {
  activeGateway: 'stripe', // 'stripe' | 'paypal'
  stripe: {
    mode: 'sandbox', // 'sandbox' | 'live'
    publishableKey: 'pk_test_51Q8Kz7Gf8vK9XyzDummyKeyForFlippaTesting1234567890',
    secretKey: 'sk_test_51Q8Kz7Gf8vK9XyzDummyKeyForFlippaTesting1234567890',
    webhookSecret: '',
  },
  paypal: {
    mode: 'sandbox', // 'sandbox' | 'live'
    clientId: 'sb', // standard sandbox client id
    clientSecret: '',
  },
  pricing: {
    starter: {
      name: 'Starter Agent',
      price: 19,
      credits: 50,
      features: ['50 Store Analyses', '1-Click CSV Export', 'Theme & App Detection', 'Standard Support'],
    },
    pro: {
      name: 'Pro Spy Master',
      price: 49,
      credits: 200,
      features: ['200 Store Analyses', 'AI Copywriter Takedown', 'FB Ads Deep-Linker', 'Priority Queue'],
      popular: true,
    },
    agency: {
      name: 'Agency Elite Pack',
      price: 99,
      credits: 1000,
      features: ['1000 Store Analyses', 'High-Volume AI Rewrites', 'Full Spy Blueprint Access', 'Dedicated 24/7 VIP Support'],
    },
  },
};

export async function GET() {
  try {
    const setting = await prisma.systemSetting.findUnique({
      where: { key: 'payment_config' },
    });

    if (!setting) {
      return NextResponse.json({ success: true, settings: DEFAULT_SETTINGS });
    }

    const parsed = JSON.parse(setting.value);
    return NextResponse.json({
      success: true,
      settings: { ...DEFAULT_SETTINGS, ...parsed },
    });
  } catch (error: any) {
    console.error('Error fetching settings:', error);
    return NextResponse.json({ success: true, settings: DEFAULT_SETTINGS });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const updated = await prisma.systemSetting.upsert({
      where: { key: 'payment_config' },
      update: {
        value: JSON.stringify(body),
      },
      create: {
        key: 'payment_config',
        value: JSON.stringify(body),
      },
    });

    return NextResponse.json({ success: true, settings: JSON.parse(updated.value) });
  } catch (error: any) {
    console.error('Error updating settings:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
