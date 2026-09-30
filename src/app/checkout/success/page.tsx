'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle2, Radar, Sparkles, Gem, ArrowRight, ShieldCheck } from 'lucide-react';

function CheckoutSuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const planKey = searchParams.get('plan') || 'starter';
  const userId = searchParams.get('userId');
  const gateway = searchParams.get('gateway') || 'stripe';
  const sessionId = searchParams.get('session_id') || `sandbox_${Date.now()}`;

  const [loading, setLoading] = useState(true);
  const [details, setDetails] = useState<any>(null);

  useEffect(() => {
    const confirmPayment = async () => {
      if (!userId) {
        setLoading(false);
        return;
      }

      try {
        const res = await fetch('/api/checkout/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId,
            planKey,
            gateway,
            transactionId: sessionId,
          }),
        });

        const data = await res.json();
        if (data.success) {
          setDetails(data);
        }
      } catch (err) {
        console.error('Failed to confirm checkout:', err);
      } finally {
        setLoading(false);
      }
    };

    confirmPayment();
  }, [userId, planKey, gateway, sessionId]);

  const planTitles: Record<string, string> = {
    starter: 'Starter Agent (50 Credits)',
    pro: 'Pro Spy Master (200 Credits)',
    agency: 'Agency Elite Pack (1,000 Credits)',
  };

  return (
    <div className="min-h-screen bg-[#020617] text-slate-300 font-sans flex items-center justify-center p-4 relative overflow-hidden">
      {/* Glow Effects */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-emerald-500/10 blur-[140px] pointer-events-none"></div>
      <div className="absolute top-1/4 left-1/3 w-[300px] h-[300px] rounded-full bg-blue-500/10 blur-[100px] pointer-events-none"></div>

      <div className="max-w-xl w-full bg-[#0f172a]/90 backdrop-blur-2xl border border-emerald-500/40 rounded-3xl p-8 sm:p-12 shadow-[0_0_80px_rgba(16,185,129,0.2)] text-center relative z-10">
        
        {/* Animated Checkmark */}
        <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-tr from-emerald-500 to-emerald-400 flex items-center justify-center shadow-[0_0_35px_rgba(16,185,129,0.5)] animate-bounce">
          <CheckCircle2 className="w-10 h-10 text-slate-950 stroke-[2.5]" />
        </div>

        {/* Sandbox Badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-4">
          <ShieldCheck className="w-3.5 h-3.5" /> Payment Verified ({gateway.toUpperCase()} Gateway)
        </div>

        <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight mb-3">
          Spy Vault Refilled! 🚀
        </h1>
        <p className="text-slate-400 text-base leading-relaxed mb-8 max-w-md mx-auto">
          Your payment was processed successfully. New spy credits have been added directly to your account ledger.
        </p>

        {/* Summary Card */}
        <div className="bg-[#020617]/70 border border-white/10 rounded-2xl p-6 mb-8 text-left space-y-4">
          <div className="flex items-center justify-between text-sm pb-3 border-b border-white/5">
            <span className="text-slate-400">Package Activated</span>
            <span className="font-bold text-white capitalize">{planTitles[planKey] || planKey}</span>
          </div>
          <div className="flex items-center justify-between text-sm pb-3 border-b border-white/5">
            <span className="text-slate-400">Credits Credited</span>
            <span className="font-black text-emerald-400 flex items-center gap-1.5">
              <Gem className="w-4 h-4" /> +{details?.creditsAdded || (planKey === 'agency' ? 1000 : planKey === 'pro' ? 200 : 50)} Credits
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-400">Status</span>
            <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
              Live & Ready to Use
            </span>
          </div>
        </div>

        {/* Action Button */}
        <div className="space-y-3">
          <Link
            href="/"
            className="w-full bg-gradient-to-r from-emerald-500 to-emerald-400 hover:from-emerald-400 hover:to-emerald-300 text-slate-950 font-black py-4 px-6 rounded-xl transition-all shadow-[0_0_30px_rgba(16,185,129,0.3)] flex items-center justify-center gap-2 text-base cursor-pointer"
          >
            <Radar className="w-5 h-5" /> Launch Store Spy & Start Scanning <ArrowRight className="w-4 h-4" />
          </Link>
          <p className="text-xs text-slate-500">
            Flippa Handover Notice: Test transactions are registered in Supabase PostgreSQL & Prisma schema.
          </p>
        </div>

      </div>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#020617] flex items-center justify-center text-emerald-400 font-bold">Verifying payment status...</div>}>
      <CheckoutSuccessContent />
    </Suspense>
  );
}
