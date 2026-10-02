import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { DEFAULT_SETTINGS } from '../../admin/settings/route';

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

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token'); // PayPal Order ID
    const planKey = searchParams.get('planKey');
    const userId = searchParams.get('userId');

    const protocol = process.env.NODE_ENV === 'development' ? 'http' : 'https';
    const host = request.headers.get('host') || 'localhost:3000';
    const homeUrl = `${protocol}://${host}`;

    if (!token || !planKey || !userId) {
      return NextResponse.redirect(`${homeUrl}/?error=invalid_paypal_return`);
    }

    // Get DB settings
    const dbSetting = await prisma.systemSetting.findUnique({ where: { key: 'payment_config' } });
    const settings = dbSetting ? { ...DEFAULT_SETTINGS, ...JSON.parse(dbSetting.value) } : DEFAULT_SETTINGS;
    
    const paypalConfig = settings.paypal;
    const isLive = paypalConfig.mode === 'live';
    const planObj = settings.pricing[planKey];

    if (!paypalConfig?.clientId || !paypalConfig?.clientSecret || !planObj) {
      return NextResponse.redirect(`${homeUrl}/?error=paypal_misconfigured`);
    }

    const { token: accessToken, baseURL } = await getPayPalAccessToken(paypalConfig.clientId, paypalConfig.clientSecret, isLive);

    // Capture the order
    const captureRes = await fetch(`${baseURL}/v2/checkout/orders/${token}/capture`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    const captureData = await captureRes.json();
    if (!captureRes.ok || captureData.status !== 'COMPLETED') {
      console.error('PayPal Capture Failed:', captureData);
      return NextResponse.redirect(`${homeUrl}/?error=paypal_payment_failed`);
    }

    // Payment successful, add credits
    const currentProfile = await prisma.profile.findUnique({ where: { id: userId } });
    if (currentProfile) {
      let newCredits = currentProfile.credits;
      let newPlan = currentProfile.plan;

      if (planObj.credits === -1) {
        newCredits = -1; 
      } else if (newCredits !== -1) {
        newCredits += planObj.credits;
      }
      
      // Upgrade plan if necessary
      if (planKey === 'pro' && newPlan === 'free') newPlan = 'pro';
      if (planKey === 'agency') newPlan = 'agency';

      await prisma.profile.update({
        where: { id: userId },
        data: { credits: newCredits, plan: newPlan },
      });
    }

    // Redirect back to home with success message
    return NextResponse.redirect(`${homeUrl}/checkout/success?gateway=paypal&plan=${planKey}&creditsAdded=${planObj.credits}&userId=${userId}`);

  } catch (error: any) {
    console.error('PayPal Capture Error:', error);
    const protocol = process.env.NODE_ENV === 'development' ? 'http' : 'https';
    const host = request.headers.get('host') || 'localhost:3000';
    return NextResponse.redirect(`${protocol}://${host}/checkout/success?error=paypal_server_error`);
  }
}
