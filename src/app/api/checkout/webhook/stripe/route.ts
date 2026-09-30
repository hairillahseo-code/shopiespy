import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { prisma } from '@/lib/prisma';
import { DEFAULT_SETTINGS } from '@/app/api/admin/settings/route';

export async function POST(request: Request) {
  try {
    const rawBody = await request.text();
    const sig = request.headers.get('stripe-signature');

    let settings = DEFAULT_SETTINGS;
    try {
      const settingRecord = await prisma.systemSetting.findUnique({
        where: { key: 'payment_config' },
      });
      if (settingRecord?.value) {
        settings = { ...DEFAULT_SETTINGS, ...JSON.parse(settingRecord.value) };
      }
    } catch (e) {
      console.error('Settings fetch error:', e);
    }

    const stripeConfig = settings.stripe || DEFAULT_SETTINGS.stripe;
    const webhookSecret = stripeConfig.webhookSecret?.trim();
    const secretKey = stripeConfig.secretKey?.trim();

    let event: Stripe.Event;

    if (webhookSecret && sig && secretKey) {
      const stripe = new Stripe(secretKey, {
        apiVersion: '2026-03-25.acacia' as any,
      });
      try {
        event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
      } catch (err: any) {
        console.error(`Webhook signature verification failed: ${err.message}`);
        return NextResponse.json({ error: 'Webhook Error' }, { status: 400 });
      }
    } else {
      // In sandbox mode or when secret is unconfigured, parse payload directly
      try {
        event = JSON.parse(rawBody);
      } catch (e) {
        return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
      }
    }

    // Handle the checkout.session.completed event
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.client_reference_id || session.metadata?.userId;
      const planKey = session.metadata?.planKey || 'starter';
      const credits = Number(session.metadata?.credits) || 50;

      if (userId) {
        await prisma.profile.update({
          where: { id: userId },
          data: {
            credits: { increment: credits },
            plan: planKey,
            updatedAt: new Date(),
          },
        });
        console.log(`[Stripe Webhook] Successfully credited ${credits} credits to user ${userId}`);
      }
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error('Stripe webhook processing error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
