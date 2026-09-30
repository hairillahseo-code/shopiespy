import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { DEFAULT_SETTINGS } from '@/app/api/admin/settings/route';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, planKey, gateway, transactionId } = body;

    if (!userId || !planKey) {
      return NextResponse.json(
        { success: false, error: 'Missing userId or planKey' },
        { status: 400 }
      );
    }

    // 1. Fetch current pricing configuration from DB or default
    let settings = DEFAULT_SETTINGS;
    try {
      const settingRecord = await prisma.systemSetting.findUnique({
        where: { key: 'payment_config' },
      });
      if (settingRecord?.value) {
        settings = { ...DEFAULT_SETTINGS, ...JSON.parse(settingRecord.value) };
      }
    } catch (e) {
      console.error('Error fetching settings for verify:', e);
    }

    const selectedPricing = (settings.pricing as any)?.[planKey] || (DEFAULT_SETTINGS.pricing as any)[planKey];
    if (!selectedPricing) {
      return NextResponse.json(
        { success: false, error: `Invalid plan: ${planKey}` },
        { status: 400 }
      );
    }

    const creditsToAdd = Number(selectedPricing.credits) || 50;

    // 2. Verify or create user profile in PostgreSQL
    const existingProfile = await prisma.profile.findUnique({
      where: { id: userId },
    });

    let updatedProfile;
    if (existingProfile) {
      updatedProfile = await prisma.profile.update({
        where: { id: userId },
        data: {
          credits: { increment: creditsToAdd },
          plan: planKey,
          updatedAt: new Date(),
        },
      });
    } else {
      // Create profile if missing
      updatedProfile = await prisma.profile.create({
        data: {
          id: userId,
          email: body.userEmail || `user_${userId.slice(0, 8)}@shopiespy.com`,
          credits: 3 + creditsToAdd,
          plan: planKey,
          role: 'user',
        },
      });
    }

    console.log(`[Checkout Success] User ${userId} received ${creditsToAdd} credits for plan ${planKey} via ${gateway || 'stripe'}. New balance: ${updatedProfile.credits}`);

    return NextResponse.json({
      success: true,
      plan: planKey,
      planName: selectedPricing.name,
      creditsAdded: creditsToAdd,
      totalCredits: updatedProfile.credits,
      transactionId: transactionId || `txn_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      gateway: gateway || 'stripe',
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Checkout verification error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Payment verification failed' },
      { status: 500 }
    );
  }
}
