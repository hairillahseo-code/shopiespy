import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { prisma } from '@/lib/prisma';
import { DEFAULT_SETTINGS } from '@/app/api/admin/settings/route';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { planKey, userId, userEmail } = body;

    if (!userId || !planKey) {
      return NextResponse.json(
        { success: false, error: 'Missing userId or planKey' },
        { status: 400 }
      );
    }

    // 1. Get payment settings
    let settings = DEFAULT_SETTINGS;
    try {
      const settingRecord = await prisma.systemSetting.findUnique({
        where: { key: 'payment_config' },
      });
      if (settingRecord?.value) {
        settings = { ...DEFAULT_SETTINGS, ...JSON.parse(settingRecord.value) };
      }
    } catch (e) {
      console.error('Error fetching settings for Stripe checkout:', e);
    }

    const selectedPricing = (settings.pricing as any)?.[planKey] || (DEFAULT_SETTINGS.pricing as any)[planKey];
    if (!selectedPricing) {
      return NextResponse.json(
        { success: false, error: `Invalid plan: ${planKey}` },
        { status: 400 }
      );
    }

    const stripeConfig = settings.stripe || DEFAULT_SETTINGS.stripe;
    const secretKey = stripeConfig.secretKey?.trim();
    const mode = stripeConfig.mode || 'sandbox';

    // If no secret key is configured or it's clearly a placeholder dummy key
    if (!secretKey || secretKey.includes('DummyKey') || secretKey.length < 20) {
      return NextResponse.json({
        success: false,
        fallbackToSandboxModal: true,
        mode,
        reason: 'Using simulated Stripe Sandbox test keys. Directing to Sandbox Simulator.',
        plan: selectedPricing,
      });
    }

    // Attempt real Stripe Checkout Session creation
    try {
      const stripe = new Stripe(secretKey, {
        apiVersion: '2026-03-25.acacia' as any,
      });

      const origin = request.headers.get('origin') || 'http://localhost:3001';

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: 'usd',
              product_data: {
                name: `ShopieSpy ${selectedPricing.name}`,
                description: `${selectedPricing.credits} Spy Credits for ShopieSpy Shopify Intelligence Tool`,
              },
              unit_amount: Math.round(Number(selectedPricing.price) * 100),
            },
            quantity: 1,
          },
        ],
        mode: 'payment',
        customer_email: userEmail || undefined,
        client_reference_id: userId,
        metadata: {
          userId,
          planKey,
          credits: String(selectedPricing.credits),
        },
        success_url: `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}&plan=${planKey}&userId=${userId}&gateway=stripe`,
        cancel_url: `${origin}/#pricing`,
      });

      return NextResponse.json({
        success: true,
        url: session.url,
        sessionId: session.id,
        mode,
      });
    } catch (stripeErr: any) {
      console.warn('Stripe API error (falling back to sandbox simulator):', stripeErr.message);
      return NextResponse.json({
        success: false,
        fallbackToSandboxModal: true,
        mode,
        reason: stripeErr.message,
        plan: selectedPricing,
      });
    }
  } catch (error: any) {
    console.error('Stripe route error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal error' },
      { status: 500 }
    );
  }
}
