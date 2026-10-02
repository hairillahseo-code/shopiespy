import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { DEFAULT_SETTINGS } from '@/app/api/admin/settings/route';

async function getPayPalAccessToken(clientId: string, clientSecret: string, isLive: boolean) {
  const baseURL = isLive ? 'https://api-m.paypal.com' : 'https://api-m.sandbox.paypal.com';
  const auth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

  const response = await fetch(`${baseURL}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error_description || 'Failed to get PayPal access token');
  }
  return { token: data.access_token, baseURL };
}

export async function POST(request: Request) {
  try {
    const { planKey, userId, userEmail } = await request.json();

    if (!userId || !planKey) {
      return NextResponse.json({ success: false, error: 'Missing parameters' }, { status: 400 });
    }

    // Get DB settings
    const dbSetting = await prisma.systemSetting.findUnique({ where: { key: 'payment_config' } });
    const settings = dbSetting ? { ...DEFAULT_SETTINGS, ...JSON.parse(dbSetting.value) } : DEFAULT_SETTINGS;
    
    const paypalConfig = settings.paypal;
    if (!paypalConfig || !paypalConfig.clientId || !paypalConfig.clientSecret) {
      return NextResponse.json({ success: false, error: 'PayPal is not configured. Please add Client ID and Secret in Admin Panel.' }, { status: 400 });
    }

    const isLive = paypalConfig.mode === 'live';
    const planObj = settings.pricing[planKey];
    if (!planObj) {
      return NextResponse.json({ success: false, error: 'Invalid plan' }, { status: 400 });
    }

    const { token, baseURL } = await getPayPalAccessToken(paypalConfig.clientId, paypalConfig.clientSecret, isLive);

    const protocol = process.env.NODE_ENV === 'development' ? 'http' : 'https';
    const host = request.headers.get('host') || 'localhost:3000';
    const returnUrl = `${protocol}://${host}/api/checkout/paypal/capture?planKey=${planKey}&userId=${userId}`;
    const cancelUrl = `${protocol}://${host}/?payment_cancelled=true`;

    const orderPayload = {
      intent: 'CAPTURE',
      purchase_units: [
        {
          reference_id: `${planKey}_${userId}`,
          amount: {
            currency_code: 'USD',
            value: planObj.price.toString(),
          },
          description: `${planObj.name} - ShopieSpy Credits`,
        },
      ],
      application_context: {
        return_url: returnUrl,
        cancel_url: cancelUrl,
        brand_name: 'ShopieSpy',
        user_action: 'PAY_NOW',
      },
    };

    const orderRes = await fetch(`${baseURL}/v2/checkout/orders`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(orderPayload),
    });

    const orderData = await orderRes.json();
    if (!orderRes.ok) {
      throw new Error(orderData.message || 'Failed to create PayPal order');
    }

    const approveLink = orderData.links.find((link: any) => link.rel === 'approve');
    if (!approveLink) {
      throw new Error('PayPal did not return an approve link');
    }

    return NextResponse.json({ success: true, url: approveLink.href });

  } catch (error: any) {
    console.error('PayPal Order Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
