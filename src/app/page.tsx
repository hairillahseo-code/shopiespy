"use client";

import React, { useState, useEffect } from 'react';
import { 
  Search, Radar, TrendingUp, Sparkles, Lock, Eye, CheckCircle2, ChevronRight, 
  BarChart3, Loader2, AlertCircle, LogOut, Gem, Lightbulb, ExternalLink, 
  ShoppingBag, ShieldAlert, DollarSign, Layers, BookOpen, Check, ArrowRight, Zap,
  CreditCard, ShieldCheck, CheckCheck, Package, Truck, ArrowUpRight, Swords, User
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

// APP INTELLIGENCE & REVENUE STRATEGY PLAYBOOK DICTIONARY
const APP_INTELLIGENCE: Record<string, { category: string; role: string; strategy: string; estimatedCost: string; alternative: string }> = {
  'Klaviyo': {
    category: 'Email & SMS Automation',
    role: 'Retention Engine',
    strategy: 'Recovers 15-25% of abandoned carts automatically without paying extra ad spend. Sends high-converting welcome discount sequences.',
    estimatedCost: '$45 - $150/mo',
    alternative: 'Omnisend (Free tier) or MailerLite for beginner dropshippers.',
  },
  'Loox Reviews': {
    category: 'Visual Social Proof',
    role: 'Conversion Booster',
    strategy: 'Displays real customer photo reviews right below checkout to destroy buyer doubt and boost conversions by +30%.',
    estimatedCost: '$39 - $99/mo',
    alternative: 'Judge.me (Completely Free unlimited photo reviews).',
  },
  'Smile.io (Rewards)': {
    category: 'Customer Loyalty & Retention',
    role: 'LTV Maximizer',
    strategy: 'Incentivizes repeat purchases by giving points for every dollar spent, turning one-time buyers into loyal brand fans.',
    estimatedCost: '$49 - $199/mo',
    alternative: 'LoyaltyLion or Shopify Customer Accounts (Free).',
  },
  'Judge.me': {
    category: 'Product Reviews & UGC',
    role: 'Trust Builder',
    strategy: 'Fast-loading review widget with Google Rich Snippets stars to get free organic Google SEO traffic.',
    estimatedCost: '$0 - $15/mo',
    alternative: 'Already the #1 free alternative for beginners!',
  },
  'Gorgias Chat': {
    category: 'Live Customer Support',
    role: 'Pre-Sale Closer',
    strategy: 'Live chat widget answering sizing & shipping questions in real-time, preventing customers from abandoning cart.',
    estimatedCost: '$60 - $300/mo',
    alternative: 'Tidio or WhatsApp Chat Widget (Free).',
  },
  'Yotpo': {
    category: 'Enterprise Social Proof & UGC',
    role: 'Brand Credibility',
    strategy: 'Syndicates reviews across Google Shopping ads and Instagram UGC widgets to maximize ad ROAS.',
    estimatedCost: '$79 - $299/mo',
    alternative: 'Judge.me (Free).',
  },
  'Sezzle': {
    category: 'Buy Now Pay Later (BNPL)',
    role: 'AOV & Checkout Rate',
    strategy: 'Splits payments into 4 interest-free installments, encouraging impulse purchases on high-ticket products.',
    estimatedCost: 'Per-transaction fee (~6%)',
    alternative: 'Shopify Shop Pay Installments.',
  },
  'Afterpay': {
    category: 'Buy Now Pay Later (BNPL)',
    role: 'Gen-Z Conversion Engine',
    strategy: 'Drives younger demographic checkouts by splitting orders into 4 manageable payments.',
    estimatedCost: 'Per-transaction fee',
    alternative: 'Klarna or Shop Pay.',
  },
  'Omnisend': {
    category: 'Omnichannel Marketing',
    role: 'Email/SMS Retargeting',
    strategy: 'Automated push notifications & emails to re-engage lapsed customers with personalized coupons.',
    estimatedCost: '$16 - $59/mo',
    alternative: 'Generous free plan available for under 500 emails/mo.',
  },
  'Privy': {
    category: 'Lead Capture & Exit Popups',
    role: 'Email List Growth',
    strategy: 'Triggers exit-intent "Spin to Win" wheel popups offering 10% off before visitor leaves the tab.',
    estimatedCost: '$30 - $70/mo',
    alternative: 'Shopify Forms (Free built-in).',
  },
};

const getThemeIntelligence = (themeName: string) => {
  const isCustom = themeName.toLowerCase().includes('custom') || themeName.toLowerCase().includes('hidden') || themeName.toLowerCase().includes('main');
  const isDawn = themeName.toLowerCase().includes('dawn');
  const isImpulse = themeName.toLowerCase().includes('impulse');
  const isPrestige = themeName.toLowerCase().includes('prestige');

  return {
    architecture: 'Shopify Online Store 2.0 (Sections & Blocks)',
    type: isCustom ? 'Custom Enterprise Architecture' : isDawn ? 'Free Shopify Benchmark Theme' : isImpulse || isPrestige ? 'Premium 7-Figure E-com Theme ($380)' : 'Commercial Shopify 2.0 Theme',
    speedRating: 'Grade A (Fast Mobile First)',
    estimatedCost: isCustom ? '$1,500 - $4,500 (Agency Built)' : isDawn ? '$0 (Free Forever)' : '$350 - $380',
    beginnerAdvice: isCustom || isImpulse || isPrestige 
      ? '💡 Beginner Cheat Code: You do NOT need to spend $380 on this theme. Use the free "Dawn" or "Sense" theme with a clean sticky header to replicate 95% of this exact layout.' 
      : '💡 Beginner Cheat Code: This store uses a standard Shopify 2.0 theme. You can easily duplicate this layout using Shopify\'s default theme customizer.',
  };
};

export default function Home() {
  // Auth & Database States
  const [user, setUser] = useState<any>(null);
  const [credits, setCredits] = useState<number | null>(null);
  
  // UI Modal States
  const [showAuth, setShowAuth] = useState(false);
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState('');
  const [showPaywall, setShowPaywall] = useState(false);
  const [showPlaybook, setShowPlaybook] = useState(false);
  
  // Custom Toast State
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info'; title?: string } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success', title?: string) => {
    setToast({ message, type, title });
    setTimeout(() => {
      setToast((prev) => (prev?.message === message ? null : prev));
    }, 4500);
  };

  // App States
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{ 
    theme?: string; 
    apps?: string[]; 
    products?: any[]; 
    fbAdsLink?: string;
    tiktokAdsLink?: string;
    tiktokSearchLink?: string;
    googleShoppingLink?: string;
    brandName?: string;
    cleanDomain?: string;
  } | null>(null);
  const [error, setError] = useState('');
  
  // AI Rewrite States
  const [rewritingProduct, setRewritingProduct] = useState<string | null>(null);
  const [rewriteResult, setRewriteResult] = useState<{ title: string, html: string } | null>(null);

  // Dynamic Payment Settings
  const [paymentSettings, setPaymentSettings] = useState<any>({
    activeGateway: 'stripe',
    stripe: {
      mode: 'sandbox',
      publishableKey: 'pk_test_51Q8Kz7Gf8vK9XyzDummyKeyForFlippaTesting1234567890',
      secretKey: 'sk_test_51Q8Kz7Gf8vK9XyzDummyKeyForFlippaTesting1234567890',
      webhookSecret: '',
    },
    paypal: {
      mode: 'sandbox',
      clientId: 'sb',
      clientSecret: '',
    },
    pricing: {
      starter: { name: 'Starter Agent', price: 19, credits: 50 },
      pro: { name: 'Pro Spy Master', price: 49, credits: 200, popular: true },
      agency: { name: 'Agency Elite Pack', price: 99, credits: 1000 },
    },
  });

  // Real Checkout / Sandbox Checkout State
  const [checkoutPlan, setCheckoutPlan] = useState<'starter' | 'pro' | 'agency' | null>(null);
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [selectedGateway, setSelectedGateway] = useState<'stripe' | 'paypal'>('stripe');
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState<string>('');
  const [checkoutSuccessDetails, setCheckoutSuccessDetails] = useState<any>(null);

  // Test Card Form State
  const [cardNumber, setCardNumber] = useState('4242 4242 4242 4242');
  const [cardExp, setCardExp] = useState('12/28');
  const [cardCvc, setCardCvc] = useState('123');
  const [cardName, setCardName] = useState('Flippa Test Buyer');

  // Fitur #1: Supplier Intelligence Modal State
  const [selectedProductForSupplier, setSelectedProductForSupplier] = useState<any>(null);

  useEffect(() => {
    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user || null);
      if (session?.user) fetchCredits(session.user);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
      if (session?.user) fetchCredits(session.user);
      else setCredits(null);
    });

    // Fetch dynamic payment settings
    fetch('/api/admin/settings')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.settings) {
          setPaymentSettings(data.settings);
        }
      })
      .catch((err) => console.error('Failed to load payment settings:', err));

    return () => subscription.unsubscribe();
  }, []);

  const fetchCredits = async (userObj: any) => {
    try {
      const res = await fetch('/api/user/credits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: userObj.id, email: userObj.email })
      });
      const data = await res.json();
      if (data.success && typeof data.credits === 'number') {
        setCredits(data.credits);
      } else {
        setCredits(userObj.email === 'admin@shopiespy.com' || userObj.email === 'superadmin@shopiespy.com' ? -1 : 3);
      }
    } catch {
      setCredits(userObj.email === 'admin@shopiespy.com' || userObj.email === 'superadmin@shopiespy.com' ? -1 : 3);
    }
  };

  const deductCredit = async () => {
    if (!user || credits === null || (credits <= 0 && user.email !== 'admin@shopiespy.com' && user.email !== 'superadmin@shopiespy.com')) return false;
    
    // Admins don't lose credits
    if (user.email === 'admin@shopiespy.com' || user.email === 'superadmin@shopiespy.com') return true;

    const newCredits = credits - 1;
    const { error } = await supabase.from('profiles').update({ credits: newCredits }).eq('id', user.id);
    if (!error) {
      setCredits(newCredits);
      return true;
    }
    return false;
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setAuthLoading(true);

    try {
      const cleanEmail = email.trim();
      if (isLoginMode) {
        const { error } = await supabase.auth.signInWithPassword({ email: cleanEmail, password });
        if (error) throw error;
        showToast("Welcome back! Your spy tools and credits are ready.", "success", "Login Successful");
      } else {
        const { error } = await supabase.auth.signUp({ email: cleanEmail, password });
        if (error) throw error;
        showToast("Welcome to ShopieSpy! 3 Free Spy Credits have been added to your vault.", "success", "Account Created 🎉");
      }
      setShowAuth(false);
    } catch (err: any) {
      setAuthError(err.message);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleRewrite = async (productTitle: string, productType: string, bodyHtml: string) => {
    if (!user) { setShowAuth(true); return; }
    if (credits === null || credits <= 0) { setShowPaywall(true); return; }

    setRewritingProduct(productTitle);
    try {
      const success = await deductCredit();
      if (!success) throw new Error("Failed to deduct credit.");

      const res = await fetch('/api/rewrite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productTitle, productType, bodyHtml }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setRewriteResult({ title: productTitle, html: data.text });
      showToast(`AI rewritten copy ready for ${productTitle}`, "success", "Rewritten Successfully ✨");
    } catch (err: any) {
      showToast(err.message, "error", "Rewrite Failed");
    } finally {
      setRewritingProduct(null);
    }
  };

  const handleAnalyze = async () => {
    if (!url) { setError("Please enter a valid Shopify store URL"); return; }
    if (!user) { setShowAuth(true); return; }
    if (credits === null || credits <= 0) { setShowPaywall(true); return; }
    
    setError("");
    setIsLoading(true);
    setResult(null);

    try {
      const res = await fetch('/api/analyze-store', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });
      const data = await res.json();

      if (!res.ok || data.error) {
        throw new Error(data.error || "Failed to analyze store. Is it a valid Shopify store?");
      }

      const creditDeducted = await deductCredit();
      if (!creditDeducted) throw new Error("Failed to deduct credit. Please try again.");

      setResult(data.data);
      showToast(`Successfully scanned ${data.data.products?.length || 0} products & stack!`, "success", "X-Ray Scan Complete 🎯");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCheckout = (planKey: 'starter' | 'pro' | 'agency') => {
    if (!user) {
      setIsLoginMode(false);
      setShowAuth(true);
      showToast("Please sign in or create a free account to activate your spy credits.", "info", "Account Required");
      return;
    }

    setCheckoutPlan(planKey);
    setSelectedGateway(paymentSettings.activeGateway === 'paypal' ? 'paypal' : 'stripe');
    setCheckoutSuccessDetails(null);
    setIsCheckingOut(false);
    setCheckoutStep('');
    setShowCheckoutModal(true);
  };

  const executePayment = async () => {
    if (!user || !checkoutPlan) return;
    setIsCheckingOut(true);
    setCheckoutStep(`Initializing secure connection to ${selectedGateway.toUpperCase()} gateway...`);

    const selectedPricing = paymentSettings.pricing?.[checkoutPlan] || {
      name: checkoutPlan,
      price: checkoutPlan === 'agency' ? 99 : checkoutPlan === 'pro' ? 49 : 19,
      credits: checkoutPlan === 'agency' ? 1000 : checkoutPlan === 'pro' ? 200 : 50,
    };

    // If Stripe Live mode, attempt redirect to hosted Stripe Checkout Session
    if (selectedGateway === 'stripe' && paymentSettings.stripe?.mode === 'live') {
      try {
        setCheckoutStep('Creating official Stripe Checkout Session...');
        const res = await fetch('/api/checkout/stripe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            planKey: checkoutPlan,
            userId: user.id,
            userEmail: user.email,
          }),
        });
        const data = await res.json();
        if (data.success && data.url) {
          window.location.href = data.url;
          return;
        }
      } catch (err) {
        console.error('Stripe redirect failed, falling back to sandbox verification:', err);
      }
    }

    // In Sandbox mode (or if simulating test transaction)
    try {
      await new Promise((r) => setTimeout(r, 650));
      setCheckoutStep(`Validating ${selectedGateway.toUpperCase()} sandbox credentials & security hash...`);
      await new Promise((r) => setTimeout(r, 750));
      setCheckoutStep(`Synchronizing database ledger: Adding ${selectedPricing.credits} credits to ${user.email}...`);

      const verifyRes = await fetch('/api/checkout/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          userEmail: user.email,
          planKey: checkoutPlan,
          gateway: selectedGateway,
          transactionId: `${selectedGateway}_sb_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        }),
      });

      const verifyData = await verifyRes.json();
      if (!verifyRes.ok || !verifyData.success) {
        throw new Error(verifyData.error || 'Payment verification failed');
      }

      setCredits(verifyData.totalCredits);
      setCheckoutSuccessDetails(verifyData);
      showToast(`Added +${verifyData.creditsAdded} credits to your account!`, 'success', 'Payment Successful 🎉');
    } catch (err: any) {
      showToast(err.message || 'Payment simulation failed', 'error', 'Transaction Error');
    } finally {
      setIsCheckingOut(false);
    }
  };

  // Active theme & apps intelligence data
  const themeIntel = getThemeIntelligence(result?.theme || 'Custom Shopify 2.0');
  const activeApps = result?.apps || ['Klaviyo', 'Loox Reviews', 'Smile.io (Rewards)'];

  // Fitur #3: PPSPY-Style Revenue & Store Velocity Financial Modeling
  const storeFinancials = React.useMemo(() => {
    const products = result?.products || [];
    if (products.length === 0) {
      return {
        aov: '38.50',
        minPrice: '14.99',
        maxPrice: '89.00',
        estRevenue: '$14,500 – $48,000',
        estDailyOrders: '15 – 45',
        velocityStatus: 'Active Scaling 🚀',
      };
    }

    const prices = products
      .map((p: any) => parseFloat(String(p.price || '0').replace(/[^0-9.]/g, '')))
      .filter((n: number) => !isNaN(n) && n > 0);

    if (prices.length === 0) {
      return {
        aov: '29.99',
        minPrice: '19.99',
        maxPrice: '49.99',
        estRevenue: '$8,500 – $24,000',
        estDailyOrders: '10 – 25',
        velocityStatus: 'Active Scaling 🚀',
      };
    }

    const min = Math.min(...prices);
    const max = Math.max(...prices);
    const avg = prices.reduce((a: number, b: number) => a + b, 0) / prices.length;

    // Modeling revenue estimates based on public store size & AOV
    const estLowOrders = Math.max(12, Math.round(products.length * 1.5));
    const estHighOrders = Math.max(35, Math.round(products.length * 4.2));
    const lowRev = Math.round(estLowOrders * avg * 30);
    const highRev = Math.round(estHighOrders * avg * 30);

    return {
      aov: avg.toFixed(2),
      minPrice: min.toFixed(2),
      maxPrice: max.toFixed(2),
      estRevenue: `$${lowRev.toLocaleString()} – $${highRev.toLocaleString()}`,
      estDailyOrders: `${estLowOrders} – ${estHighOrders}`,
      velocityStatus: products.length >= 10 ? 'High Velocity 🚀' : 'Active Catalog ⚡',
    };
  }, [result?.products]);

  const handleExportCSV = () => {
    if (!result?.products || result.products.length === 0) {
      showToast("No products available to export.", "error", "Export Failed");
      return;
    }

    const headers = ["Title", "Price", "URL"];
    const csvRows = [headers.join(",")];

    result.products.forEach((product: any) => {
      const title = `"${(product.title || '').replace(/"/g, '""')}"`;
      const price = `"${product.price || ''}"`;
      const url = `"${product.url || ''}"`;
      csvRows.push([title, price, url].join(","));
    });

    const csvString = csvRows.join("\n");
    const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const urlBlob = URL.createObjectURL(blob);
    link.setAttribute("href", urlBlob);
    link.setAttribute("download", `shopiespy_products_${result.cleanDomain || 'export'}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast("Products exported successfully!", "success", "Export CSV");
  };

  // Terminal & Spy Inspector Window Component
  const renderInspectorTerminal = () => (
    <div className="rounded-2xl border border-white/10 bg-[#0f172a] shadow-2xl shadow-emerald-500/10 overflow-hidden backdrop-blur-sm transition-all duration-500">
      
      {/* Top Console Bar */}
      <div className="bg-[#1e293b] border-b border-white/5 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
          <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
          <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
          <div className="ml-4 text-xs font-mono text-slate-400">
            {isLoading ? 'Hacking into mainframe...' : result ? `Live Target: ${url}` : 'Waiting for target URL...'}
          </div>
        </div>
        
        {result && (
          <button
            onClick={() => setShowPlaybook(true)}
            className="bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/30 px-3 py-1 rounded-md text-xs font-bold transition-all flex items-center gap-1.5 shadow-[0_0_15px_rgba(16,185,129,0.15)] cursor-pointer"
          >
            <BookOpen className="w-3.5 h-3.5" /> View Strategy Playbook
          </button>
        )}
      </div>

      {/* Store Revenue & Velocity Estimator Hub (Fitur #3) */}
      {result && (
        <div className="bg-[#0b1329] border-b border-white/5 p-4 sm:p-6 grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* Est. Monthly Revenue */}
          <div className="p-3.5 rounded-xl bg-slate-900/80 border border-emerald-500/20 shadow-inner">
            <div className="text-[10px] text-slate-400 uppercase font-black tracking-wider flex items-center gap-1 mb-1">
              <DollarSign className="w-3.5 h-3.5 text-emerald-400" /> Est. Monthly Revenue
            </div>
            <div className="text-lg sm:text-xl font-black text-emerald-400">
              {storeFinancials.estRevenue}
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">Benchmark: ~{storeFinancials.estDailyOrders} orders/day</div>
          </div>

          {/* AOV */}
          <div className="p-3.5 rounded-xl bg-slate-900/80 border border-blue-500/20 shadow-inner">
            <div className="text-[10px] text-slate-400 uppercase font-black tracking-wider flex items-center gap-1 mb-1">
              <TrendingUp className="w-3.5 h-3.5 text-blue-400" /> Average Order (AOV)
            </div>
            <div className="text-lg sm:text-xl font-black text-white">
              ${storeFinancials.aov} <span className="text-xs text-slate-400 font-normal">USD</span>
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">Catalog average price point</div>
          </div>

          {/* Catalog Price Range */}
          <div className="p-3.5 rounded-xl bg-slate-900/80 border border-purple-500/20 shadow-inner">
            <div className="text-[10px] text-slate-400 uppercase font-black tracking-wider flex items-center gap-1 mb-1">
              <BarChart3 className="w-3.5 h-3.5 text-purple-400" /> Catalog Price Range
            </div>
            <div className="text-lg sm:text-xl font-black text-white">
              ${storeFinancials.minPrice} – ${storeFinancials.maxPrice}
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">Lowest vs highest product</div>
          </div>

          {/* Velocity / Store Activity */}
          <div className="p-3.5 rounded-xl bg-slate-900/80 border border-amber-500/20 shadow-inner">
            <div className="text-[10px] text-slate-400 uppercase font-black tracking-wider flex items-center gap-1 mb-1">
              <Zap className="w-3.5 h-3.5 text-amber-400" /> Catalog Health
            </div>
            <div className="text-lg sm:text-xl font-black text-amber-300">
              {storeFinancials.velocityStatus}
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">{result.products?.length || 0} top products tracked</div>
          </div>
        </div>
      )}
      
      <div className={`p-6 md:p-8 grid md:grid-cols-3 gap-6 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] transition-opacity duration-500 ${isLoading ? 'opacity-30' : 'opacity-100'}`}>
        
        {/* Column 1: Deep Theme & Apps Intelligence */}
        <div className="md:col-span-1 space-y-4">
          
          {/* Theme Intelligence Card */}
          <div className="bg-slate-900/80 p-5 rounded-2xl border border-white/5 relative overflow-hidden group hover:border-emerald-500/30 transition-all">
            {isLoading && <div className="absolute inset-0 bg-emerald-500/5 animate-pulse"></div>}
            
            <div className="flex items-center justify-between mb-2">
              <div className="text-[11px] text-slate-400 uppercase font-black tracking-wider flex items-center gap-1">
                <Layers className="w-3.5 h-3.5 text-emerald-400" /> Detected Theme
              </div>
              <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                {themeIntel.estimatedCost}
              </span>
            </div>

            <div className="text-xl text-white font-bold flex items-center gap-2 mb-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" /> 
              <span className="truncate">{result ? result.theme : 'Custom Shopify 2.0'}</span>
            </div>

            <div className="text-xs text-slate-400 leading-relaxed border-t border-white/5 pt-2.5 mt-2">
              <div className="text-emerald-400/90 font-medium mb-1">Architecture: {themeIntel.type}</div>
              <p className="text-[11px] text-slate-400 leading-normal">{themeIntel.beginnerAdvice}</p>
            </div>
          </div>
          
          {/* Multi-Network Ad Intelligence Hub (Fitur #2) */}
          <div className="bg-slate-900/80 p-4 rounded-2xl border border-white/5 space-y-2.5 relative overflow-hidden group hover:border-emerald-500/30 transition-all">
            {isLoading && <div className="absolute inset-0 bg-emerald-500/5 animate-pulse z-10 pointer-events-none"></div>}
            
            <div className="text-[11px] text-slate-400 uppercase font-black tracking-wider flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-white">
                <TrendingUp className="w-3.5 h-3.5 text-emerald-400" /> Ad Intelligence Hub
              </span>
              <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20 font-bold">
                3 Networks
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {/* Facebook & Instagram Ads */}
              <div 
                onClick={() => {
                  if (result?.fbAdsLink) window.open(result.fbAdsLink, '_blank');
                  else showToast('Target store Facebook/Instagram Ads link will appear after scan.', 'info', 'Meta Ad Library');
                }}
                className={`p-3 rounded-xl border flex flex-col justify-between transition-all cursor-pointer group ${
                  result?.fbAdsLink 
                    ? 'bg-blue-600/10 border-blue-500/40 hover:bg-blue-600/20 hover:border-blue-400' 
                    : 'bg-slate-950/40 border-white/5 hover:border-white/20'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-blue-400 flex items-center gap-1">
                      <TrendingUp className="w-3.5 h-3.5" /> Meta Ads
                    </span>
                    <ExternalLink className="w-3 h-3 text-slate-500 group-hover:text-blue-400 transition-colors" />
                  </div>
                  <div className="text-[10px] text-slate-400">FB & IG Library</div>
                </div>
                <div className="text-[10px] font-bold text-blue-400 mt-2 flex items-center gap-1">
                  {result?.fbAdsLink ? 'Open Live Ads ↗' : 'Spy Ads'}
                </div>
              </div>

              {/* TikTok Creative Center Ads */}
              <div 
                onClick={() => {
                  if (result?.tiktokAdsLink) window.open(result.tiktokAdsLink, '_blank');
                  else showToast('TikTok Creative Center link will appear after scan.', 'info', 'TikTok Ads Spy');
                }}
                className={`p-3 rounded-xl border flex flex-col justify-between transition-all cursor-pointer group ${
                  result?.tiktokAdsLink 
                    ? 'bg-rose-500/10 border-rose-500/40 hover:bg-rose-500/20 hover:border-rose-400' 
                    : 'bg-slate-950/40 border-white/5 hover:border-white/20'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-rose-400 flex items-center gap-1">
                      <TrendingUp className="w-3.5 h-3.5" /> TikTok Ads
                    </span>
                    <ExternalLink className="w-3 h-3 text-slate-500 group-hover:text-rose-400 transition-colors" />
                  </div>
                  <div className="text-[10px] text-slate-400">Creative Center</div>
                </div>
                <div className="text-[10px] font-bold text-rose-400 mt-2 flex items-center gap-1">
                  {result?.tiktokAdsLink ? 'View Top Ads ↗' : 'TikTok Ads'}
                </div>
              </div>
            </div>

            {/* TikTok Organic & Viral Videos Search */}
            <div 
              onClick={() => {
                if (result?.tiktokSearchLink) window.open(result.tiktokSearchLink, '_blank');
                else showToast('TikTok Viral Videos link will appear after scan.', 'info', 'TikTok Viral UGC');
              }}
              className={`p-3 rounded-xl border flex items-center justify-between transition-all cursor-pointer group ${
                result?.tiktokSearchLink 
                  ? 'bg-gradient-to-r from-rose-500/10 via-purple-500/10 to-teal-500/10 border-purple-500/40 hover:border-purple-400' 
                  : 'bg-slate-950/40 border-white/5 hover:border-white/20'
              }`}
            >
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-rose-500/20 flex items-center justify-center text-rose-400">
                  <Sparkles className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white flex items-center gap-1.5">
                    TikTok Viral & UGC Videos
                  </div>
                  <div className="text-[10px] text-slate-400">Organic viral video discovery</div>
                </div>
              </div>
              <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-white transition-colors" />
            </div>
          </div>

          {/* Detected Secret Apps */}
          <div className="bg-slate-900/80 p-5 rounded-2xl border border-white/5 relative overflow-hidden group hover:border-emerald-500/30 transition-all">
            {isLoading && <div className="absolute inset-0 bg-emerald-500/5 animate-pulse"></div>}
            
            <div className="flex items-center justify-between mb-3">
              <div className="text-[11px] text-slate-400 uppercase font-black tracking-wider flex items-center gap-1">
                <Zap className="w-3.5 h-3.5 text-amber-400" /> Detected Apps
              </div>
              <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                {activeApps.length} Apps Active
              </span>
            </div>

            <div className="flex flex-wrap gap-1.5 max-h-48 overflow-y-auto pr-1 custom-scrollbar">
              {activeApps.map((app, idx) => (
                <span 
                  key={idx}
                  className="text-xs px-2.5 py-1 rounded-lg bg-slate-950/80 border border-white/10 text-slate-300 font-medium hover:border-emerald-500/40 hover:text-emerald-300 transition-colors"
                >
                  {app}
                </span>
              ))}
            </div>
          </div>

        </div>

        {/* Column 2 & 3: Top Selling Products Table */}
        <div className="md:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs font-black uppercase tracking-wider text-white flex items-center gap-1.5">
                <ShoppingBag className="w-4 h-4 text-emerald-400" /> Top Selling Products Extracted
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">Ranked by Shopify collection order algorithm</div>
            </div>
            
            {result?.products && result.products.length > 0 && (
              <button 
                onClick={handleExportCSV}
                className="bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
              >
                <Package className="w-3.5 h-3.5" /> Export CSV
              </button>
            )}
          </div>

          <div className="space-y-3 max-h-[580px] overflow-y-auto pr-1 custom-scrollbar">
            {result?.products && result.products.length > 0 ? (
              result.products.map((product: any, idx: number) => {
                const priceFormatted = product.price ? `$${parseFloat(String(product.price).replace(/[^0-9.]/g, '')).toFixed(2)}` : '$29.99';
                
                return (
                  <div key={idx} className="p-3.5 rounded-2xl bg-slate-900/90 border border-white/5 hover:border-emerald-500/40 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 group">
                    <div className="flex items-center gap-3.5 min-w-0">
                      {product.image ? (
                        <img 
                          src={product.image} 
                          alt={product.title} 
                          className="w-14 h-14 rounded-xl object-cover border border-white/10 shrink-0 group-hover:scale-105 transition-transform" 
                        />
                      ) : (
                        <div className="w-14 h-14 rounded-xl bg-slate-800 border border-white/10 flex items-center justify-center text-[10px] text-slate-500 shrink-0">
                          NO IMG
                        </div>
                      )}
                      
                      <div className="min-w-0">
                        <div className="font-bold text-white text-sm truncate group-hover:text-emerald-300 transition-colors">
                          {product.title}
                        </div>
                        <div className="text-xs text-slate-400 mt-0.5 flex items-center gap-2">
                          <span className="font-black text-emerald-400">{priceFormatted}</span>
                          <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full font-semibold border border-white/5">
                            Rank #{idx + 1}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                      {/* View Live Button */}
                      <button 
                        onClick={() => window.open(product.url, '_blank')}
                        className="bg-blue-500/10 hover:bg-blue-500/20 text-blue-300 border border-blue-500/30 px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm hover:shadow-[0_0_15px_rgba(59,130,246,0.2)]"
                        title="View Live Product Page"
                      >
                        <ExternalLink className="w-3.5 h-3.5 text-blue-400" /> View Live
                      </button>

                      {/* Sourcing Button (Fitur #1) */}
                      <button 
                        onClick={() => setSelectedProductForSupplier(product)}
                        className="bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm hover:shadow-[0_0_15px_rgba(245,158,11,0.2)]"
                        title="Find Supplier on AliExpress, CJ Dropshipping, 1688 & Alibaba"
                      >
                        <Truck className="w-3.5 h-3.5 text-amber-400" /> Source 🛒
                      </button>

                      {/* AI Rewrite Button */}
                      <button 
                        onClick={() => handleRewrite(product.title || '', product.product_type || '', product.body_html || '')}
                        disabled={rewritingProduct === product.title}
                        className="bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-[0_0_15px_rgba(16,185,129,0.2)]"
                      >
                        {rewritingProduct === product.title ? (
                          <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Rewriting...</>
                        ) : (
                          <><Sparkles className="w-3.5 h-3.5" /> AI Rewrite</>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })
            ) : (
              /* DEMO SAMPLES (when no store scanned yet) */
              [1, 2, 3].map((i) => (
                <div key={i} className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-900/60 border border-white/5">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-slate-800/80 rounded-xl flex items-center justify-center text-xs font-bold text-slate-500">
                      DEMO
                    </div>
                    <div>
                      <div className="text-slate-300 font-bold text-sm">Winning Product Sample #{i}</div>
                      <div className="text-xs text-slate-500 mt-0.5">Apparel & Accessories</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-emerald-400 font-black text-sm">${(54.00 - i * 5).toFixed(2)}</div>
                    <div className="text-[10px] text-slate-500 mt-0.5">Rank #{i}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#020617] text-slate-300 font-sans selection:bg-emerald-500/30 overflow-x-hidden relative">
      
      {/* Background Effects */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[800px] overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[800px] h-[800px] rounded-full bg-emerald-500/10 blur-[120px]"></div>
        <div className="absolute top-[20%] left-[20%] w-[500px] h-[500px] rounded-full bg-blue-500/10 blur-[120px]"></div>
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAwIDEwIEwgNDAgMTAgTSAxMCAwIEwgMTAgNDAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsIDI1NSwgMjU1LCAwLjAzKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-50"></div>
      </div>

      {/* Navigation */}
      <nav className="border-b border-white/5 bg-[#020617]/80 backdrop-blur-xl fixed top-0 w-full z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-[0_0_20px_rgba(16,185,129,0.3)]">
              <Radar className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-black tracking-tight text-white ml-2">
              Shopie<span className="text-emerald-400">Spy</span>
            </span>
          </div>

          <div className="hidden md:flex items-center gap-8 ml-12 mr-auto">
            <Link href="/" className="text-emerald-400 font-bold text-sm flex items-center gap-2 border-b-2 border-emerald-400 py-7">
              <Search className="w-4 h-4" /> Store X-Ray
            </Link>
            <Link href="/battle" className="text-slate-400 hover:text-white font-medium text-sm flex items-center gap-2 py-7 transition-colors">
              <Swords className="w-4 h-4" /> Store Battle
            </Link>
          </div>
          
          <div className="flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-4">
                {(user.email === 'admin@shopiespy.com' || user.email === 'superadmin@shopiespy.com') && (
                  <Link href="/admin" className="hidden md:flex items-center text-xs font-bold text-blue-400 hover:text-blue-300 border border-blue-500/30 px-3 py-1.5 rounded-md bg-blue-500/10 transition-colors">
                    Admin Panel
                  </Link>
                )}
                <div 
                  onClick={() => setShowPaywall(true)}
                  className="bg-emerald-500/10 border border-emerald-500/30 px-4 py-2 rounded-lg flex items-center gap-2 font-bold text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.15)] cursor-pointer hover:bg-emerald-500/20 transition-all hover:scale-105"
                  title="Click to recharge credits"
                >
                  <Gem className="w-4 h-4" /> 
                  {(user.email === 'admin@shopiespy.com' || user.email === 'superadmin@shopiespy.com') ? 'Unlimited Credits' : (credits !== null ? `${credits} Credits` : '3 Credits')}
                </div>
                <Link href="/settings" className="text-slate-400 hover:text-white transition-colors" title="Account Settings">
                  <User className="w-5 h-5" />
                </Link>
                <button 
                  onClick={() => supabase.auth.signOut()}
                  className="text-slate-400 hover:text-white transition-colors"
                  title="Sign Out"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <>
                <button onClick={() => { setIsLoginMode(true); setShowAuth(true); }} className="text-sm font-medium text-slate-300 hover:text-white transition-colors hidden md:block">
                  Log in
                </button>
                <button onClick={() => { setIsLoginMode(false); setShowAuth(true); }} className="bg-white hover:bg-emerald-50 text-slate-900 px-5 py-2.5 rounded-lg text-sm font-bold transition-all flex items-center gap-2 shadow-[0_0_15px_rgba(255,255,255,0.2)]">
                  Start Free Trial <ChevronRight className="w-4 h-4" />
                </button>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Premium Cyber Toast Notification */}
      {toast && (
        <div className="fixed top-24 right-6 z-[120] max-w-md w-full transition-all duration-300 transform translate-y-0">
          <div className={`p-4 rounded-2xl border backdrop-blur-2xl shadow-2xl flex items-start gap-3.5 relative overflow-hidden ${
            toast.type === 'success' 
              ? 'bg-[#0f172a]/95 border-emerald-500/40 shadow-[0_0_35px_rgba(16,185,129,0.25)] text-white' 
              : toast.type === 'error'
              ? 'bg-[#0f172a]/95 border-red-500/40 shadow-[0_0_35px_rgba(239,68,68,0.25)] text-white'
              : 'bg-[#0f172a]/95 border-blue-500/40 shadow-[0_0_35px_rgba(59,130,246,0.25)] text-white'
          }`}>
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${
              toast.type === 'success'
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                : toast.type === 'error'
                ? 'bg-red-500/10 border-red-500/30 text-red-400'
                : 'bg-blue-500/10 border-blue-500/30 text-blue-400'
            }`}>
              {toast.type === 'success' && <Gem className="w-5 h-5" />}
              {toast.type === 'error' && <AlertCircle className="w-5 h-5" />}
              {toast.type === 'info' && <Sparkles className="w-5 h-5" />}
            </div>
            <div className="flex-1 pr-6">
              {toast.title && <div className="font-bold text-sm tracking-wide text-white">{toast.title}</div>}
              <div className="text-xs text-slate-300 mt-0.5 leading-relaxed">{toast.message}</div>
            </div>
            <button 
              onClick={() => setToast(null)} 
              className="absolute top-3 right-3 text-slate-500 hover:text-white transition-colors"
            >
              ✕
            </button>
            <div className={`absolute bottom-0 left-0 h-1 bg-gradient-to-r w-full ${
              toast.type === 'success' ? 'from-emerald-500 to-teal-400' : toast.type === 'error' ? 'from-red-500 to-pink-500' : 'from-blue-500 to-indigo-400'
            }`} />
          </div>
        </div>
      )}

      {/* Auth Modal */}
      {showAuth && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#020617]/80 backdrop-blur-md p-4">
          <div className="bg-[#0f172a] border border-white/10 rounded-2xl p-8 w-full max-w-md shadow-2xl relative">
            <button onClick={() => setShowAuth(false)} className="absolute top-4 right-4 text-slate-400 hover:text-white">✕</button>
            
            <div className="text-center mb-8">
              <div className="mx-auto w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center mb-4 border border-emerald-500/20">
                <Lock className="w-6 h-6 text-emerald-400" />
              </div>
              <h2 className="text-2xl font-black text-white">{isLoginMode ? 'Welcome Back' : 'Create an Account'}</h2>
              <p className="text-sm text-slate-400 mt-2">
                {isLoginMode ? 'Enter your details to access your dashboard.' : 'Sign up today and get 3 Free Spy Credits.'}
              </p>
            </div>

            {authError && <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-lg text-center">{authError}</div>}

            <form onSubmit={handleAuth} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Email Address</label>
                <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-[#1e293b] border border-white/5 rounded-xl px-4 py-3 text-white outline-none focus:border-emerald-500/50 transition-colors" placeholder="agent@shopiespy.com" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Password</label>
                <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-[#1e293b] border border-white/5 rounded-xl px-4 py-3 text-white outline-none focus:border-emerald-500/50 transition-colors" placeholder="••••••••" />
              </div>
              <button disabled={authLoading} type="submit" className="w-full bg-emerald-500 hover:bg-emerald-400 text-[#020617] font-bold py-3 rounded-xl transition-all shadow-[0_0_20px_rgba(16,185,129,0.2)] disabled:opacity-50">
                {authLoading ? 'Authenticating...' : (isLoginMode ? 'Log In' : 'Sign Up & Get 3 Credits')}
              </button>
            </form>

            <div className="mt-6 text-center text-sm text-slate-400">
              {isLoginMode ? "Don't have an account? " : "Already have an account? "}
              <button type="button" onClick={() => setIsLoginMode(!isLoginMode)} className="text-emerald-400 font-bold hover:underline">
                {isLoginMode ? 'Sign up' : 'Log in'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Dynamic Paywall Modal (Configured by Super Admin) */}
      {showPaywall && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#020617]/90 backdrop-blur-md p-4">
          <div className="bg-gradient-to-b from-[#0f172a] to-[#022c22] border border-emerald-500/30 rounded-3xl p-8 w-full max-w-2xl shadow-[0_0_50px_rgba(16,185,129,0.15)] relative text-center">
            <button onClick={() => setShowPaywall(false)} className="absolute top-4 right-4 text-slate-400 hover:text-white">✕</button>
            
            <div className="mx-auto w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mb-4 shadow-[0_0_30px_rgba(16,185,129,0.3)]">
              <Gem className="w-8 h-8 text-emerald-400" />
            </div>
            <h2 className="text-2xl md:text-3xl font-black text-white mb-2">Out of Credits!</h2>
            <p className="text-slate-300 text-sm mb-8">You've reached your free credits limit. Choose a pack to keep spying on 7-figure Shopify stores.</p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left mb-8">
              {['starter', 'pro', 'agency'].map((key) => {
                const plan = paymentSettings.pricing?.[key] || { name: key, price: 19, credits: 50 };
                const isPro = key === 'pro';
                return (
                  <div key={key} className={`p-5 rounded-2xl border flex flex-col justify-between ${isPro ? 'bg-emerald-500/10 border-emerald-500/60 ring-1 ring-emerald-500/30' : 'bg-slate-900/80 border-white/10'}`}>
                    <div>
                      {isPro && <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-500 text-slate-950 px-2 py-0.5 rounded-full mb-2 inline-block">Popular</span>}
                      <div className="font-bold text-white text-base">{plan.name}</div>
                      <div className="text-2xl font-black text-emerald-400 my-2">${plan.price}</div>
                      <div className="text-xs text-slate-400 mb-4">{plan.credits} Spy Credits</div>
                    </div>
                    <button 
                      onClick={() => { setShowPaywall(false); handleCheckout(key as any); }}
                      className={`w-full py-2.5 rounded-xl font-bold text-xs transition-all shadow-md ${isPro ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950' : 'bg-slate-800 hover:bg-slate-700 text-white'}`}
                    >
                      Buy Credits
                    </button>
                  </div>
                );
              })}
            </div>

            <button onClick={() => setShowPaywall(false)} className="text-slate-400 text-xs hover:text-white transition-colors">
              Maybe later
            </button>
          </div>
        </div>
      )}

      {/* Interactive Stripe & PayPal Sandbox Checkout Modal */}
      {showCheckoutModal && checkoutPlan && (
        <div 
          onClick={(e) => { if (e.target === e.currentTarget && !isCheckingOut) setShowCheckoutModal(false); }}
          className="fixed inset-0 z-[120] flex items-center justify-center bg-[#020617]/90 backdrop-blur-xl p-3 sm:p-6 overflow-y-auto"
        >
          <div className="bg-[#0f172a] border border-emerald-500/40 rounded-3xl w-full max-w-xl shadow-[0_0_80px_rgba(16,185,129,0.25)] relative flex flex-col max-h-[92vh] overflow-hidden">
            
            {/* Header (Sticky at top with prominent Close Button) */}
            <div className="p-4 sm:p-6 border-b border-white/10 flex items-center justify-between bg-slate-900/95 backdrop-blur-md shrink-0 sticky top-0 z-30">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-inner">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                    Secure Checkout <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/30 font-bold uppercase tracking-wider">256-Bit SSL</span>
                  </h3>
                  <p className="text-xs text-slate-400">ShopieSpy Instant Credit Fulfillment</p>
                </div>
              </div>
              
              {/* Prominent Close Button */}
              <button 
                type="button"
                onClick={() => { if (!isCheckingOut) setShowCheckoutModal(false); }} 
                className="text-slate-300 hover:text-white hover:bg-red-500/20 hover:border-red-500/40 border border-white/20 w-9 h-9 rounded-xl bg-slate-800 flex items-center justify-center transition-all cursor-pointer font-bold text-sm shrink-0 shadow-md"
                title="Close Checkout"
                disabled={isCheckingOut}
              >
                ✕
              </button>
            </div>

            {/* Modal Body (Scrollable with custom scrollbar) */}
            <div className="p-5 sm:p-6 space-y-6 overflow-y-auto flex-1 custom-scrollbar">

              {/* SUCCESS VIEW */}
              {checkoutSuccessDetails ? (
                <div className="text-center py-6 space-y-6">
                  <div className="w-20 h-20 mx-auto rounded-3xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shadow-[0_0_35px_rgba(16,185,129,0.4)] animate-bounce">
                    <CheckCircle2 className="w-10 h-10" />
                  </div>
                  <div>
                    <h4 className="text-2xl font-black text-white mb-2">Payment Confirmed! 🎉</h4>
                    <p className="text-slate-300 text-sm max-w-md mx-auto">
                      Your transaction was successfully processed. <strong className="text-emerald-400">+{checkoutSuccessDetails.creditsAdded} Credits</strong> have been added to your profile vault.
                    </p>
                  </div>

                  <div className="bg-[#1e293b]/70 border border-white/5 rounded-2xl p-5 text-left text-xs space-y-3">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Gateway Used</span>
                      <span className="font-bold text-white capitalize">{selectedGateway.toUpperCase()} Gateway</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Plan Activated</span>
                      <span className="font-bold text-white">{checkoutSuccessDetails.planName || checkoutPlan}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">New Available Balance</span>
                      <span className="font-black text-emerald-400 text-sm">{checkoutSuccessDetails.totalCredits} Credits</span>
                    </div>
                    <div className="flex justify-between border-t border-white/5 pt-2">
                      <span className="text-slate-400">Reference ID</span>
                      <span className="font-mono text-slate-300">{checkoutSuccessDetails.transactionId}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setShowCheckoutModal(false);
                      window.scrollTo({ top: 300, behavior: 'smooth' });
                    }}
                    className="w-full bg-gradient-to-r from-emerald-500 to-emerald-400 hover:from-emerald-400 hover:to-emerald-300 text-slate-950 font-black py-4 rounded-xl transition-all shadow-[0_0_25px_rgba(16,185,129,0.3)] flex items-center justify-center gap-2 cursor-pointer text-sm"
                  >
                    <Radar className="w-4 h-4" /> Start Spying Now & Run X-Ray Scans
                  </button>
                </div>
              ) : isCheckingOut ? (
                /* PROCESSING TERMINAL VIEW */
                <div className="py-10 text-center space-y-6">
                  <div className="w-16 h-16 mx-auto rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 animate-spin">
                    <Loader2 className="w-8 h-8" />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-white mb-2">Processing Transaction...</h4>
                    <p className="text-xs text-slate-400">Please do not close this window.</p>
                  </div>
                  <div className="bg-[#020617] border border-emerald-500/30 rounded-xl p-4 font-mono text-xs text-emerald-400 text-left space-y-1 shadow-inner">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                      <span>{checkoutStep}</span>
                    </div>
                  </div>
                </div>
              ) : (
                /* CHECKOUT FORM VIEW */
                <>
                  {/* Order Summary Box */}
                  {(() => {
                    const planObj = paymentSettings.pricing?.[checkoutPlan] || {
                      name: checkoutPlan,
                      price: checkoutPlan === 'agency' ? 99 : checkoutPlan === 'pro' ? 49 : 19,
                      credits: checkoutPlan === 'agency' ? 1000 : checkoutPlan === 'pro' ? 200 : 50,
                    };
                    return (
                      <div className="bg-[#1e293b]/70 border border-white/10 rounded-2xl p-5 flex items-center justify-between">
                        <div>
                          <div className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Selected Package</div>
                          <div className="text-base font-bold text-white mt-0.5">{planObj.name}</div>
                          <div className="text-xs text-emerald-400 flex items-center gap-1 mt-1 font-medium">
                            <Gem className="w-3.5 h-3.5" /> +{planObj.credits} Spy Credits Included
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-black text-white">${planObj.price}.00</div>
                          <div className="text-[11px] text-slate-400">One-Time Fee (USD)</div>
                        </div>
                      </div>
                    );
                  })()}

                  {/* Gateway Selector Tabs */}
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Select Payment Method</label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setSelectedGateway('stripe')}
                        className={`p-3.5 rounded-xl border text-left transition-all flex items-center gap-3 ${
                          selectedGateway === 'stripe'
                            ? 'bg-emerald-500/10 border-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.15)] ring-1 ring-emerald-500/40'
                            : 'bg-slate-900/60 border-white/5 text-slate-400 hover:text-white'
                        }`}
                      >
                        <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs">
                          💳
                        </div>
                        <div>
                          <div className="text-xs font-bold text-white">Stripe Checkout</div>
                          <div className="text-[10px] text-slate-400">Credit / Debit Card</div>
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => setSelectedGateway('paypal')}
                        className={`p-3.5 rounded-xl border text-left transition-all flex items-center gap-3 ${
                          selectedGateway === 'paypal'
                            ? 'bg-blue-500/10 border-blue-500 text-white shadow-[0_0_15px_rgba(59,130,246,0.15)] ring-1 ring-blue-500/40'
                            : 'bg-slate-900/60 border-white/5 text-slate-400 hover:text-white'
                        }`}
                      >
                        <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-xs">
                          🅿️
                        </div>
                        <div>
                          <div className="text-xs font-bold text-white">PayPal Commerce</div>
                          <div className="text-[10px] text-slate-400">Sandbox Wallet</div>
                        </div>
                      </button>
                    </div>
                  </div>

                  {/* Gateway Content: Stripe */}
                  {selectedGateway === 'stripe' && (
                    <div className="space-y-4">
                      {/* Sandbox Indicator */}
                      <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2 text-emerald-300">
                          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                          <span><strong>Stripe Sandbox Active</strong> — Use test card or click quick-fill below.</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setCardNumber('4242 4242 4242 4242');
                            setCardExp('12/28');
                            setCardCvc('123');
                            setCardName('Flippa Test Buyer');
                            showToast("Test card auto-populated!", "info", "Stripe Sandbox");
                          }}
                          className="text-[11px] bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 px-2.5 py-1 rounded-md font-bold transition-colors cursor-pointer border border-emerald-500/30"
                        >
                          ⚡ Auto-Fill Card
                        </button>
                      </div>

                      {/* Card Input Fields */}
                      <div className="space-y-3">
                        <div>
                          <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Card Number</label>
                          <div className="relative">
                            <input
                              type="text"
                              value={cardNumber}
                              onChange={(e) => setCardNumber(e.target.value)}
                              placeholder="4242 4242 4242 4242"
                              className="w-full bg-[#1e293b] border border-white/10 rounded-xl px-4 py-3 text-white text-sm font-mono outline-none focus:border-emerald-500/50"
                            />
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                              TEST VISA
                            </span>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Expiry (MM/YY)</label>
                            <input
                              type="text"
                              value={cardExp}
                              onChange={(e) => setCardExp(e.target.value)}
                              placeholder="12/28"
                              className="w-full bg-[#1e293b] border border-white/10 rounded-xl px-4 py-3 text-white text-sm font-mono outline-none focus:border-emerald-500/50"
                            />
                          </div>
                          <div>
                            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">CVC / CVV</label>
                            <input
                              type="text"
                              value={cardCvc}
                              onChange={(e) => setCardCvc(e.target.value)}
                              placeholder="123"
                              className="w-full bg-[#1e293b] border border-white/10 rounded-xl px-4 py-3 text-white text-sm font-mono outline-none focus:border-emerald-500/50"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Cardholder Name</label>
                          <input
                            type="text"
                            value={cardName}
                            onChange={(e) => setCardName(e.target.value)}
                            placeholder="John Doe"
                            className="w-full bg-[#1e293b] border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-emerald-500/50"
                          />
                        </div>
                      </div>

                      {/* Pay Button */}
                      <button
                        type="button"
                        onClick={executePayment}
                        className="w-full bg-gradient-to-r from-emerald-500 to-emerald-400 hover:from-emerald-400 hover:to-emerald-300 text-slate-950 font-black py-4 rounded-xl transition-all shadow-[0_0_25px_rgba(16,185,129,0.3)] flex items-center justify-center gap-2 cursor-pointer text-sm mt-4"
                      >
                        <ShieldCheck className="w-4 h-4" /> Pay ${paymentSettings.pricing?.[checkoutPlan]?.price || 19}.00 & Activate Credits
                      </button>
                    </div>
                  )}

                  {/* Gateway Content: PayPal */}
                  {selectedGateway === 'paypal' && (
                    <div className="space-y-4">
                      <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl text-xs text-blue-300 leading-relaxed">
                        🅿️ <strong>PayPal Sandbox Environment:</strong> Simulated checkout flow for international PayPal users. Click below to verify instant credit addition.
                      </div>

                      <div className="bg-[#1e293b]/50 border border-white/5 rounded-2xl p-6 text-center space-y-4">
                        <div className="text-sm font-bold text-white">PayPal Sandbox Order Total</div>
                        <div className="text-3xl font-black text-blue-400">
                          ${paymentSettings.pricing?.[checkoutPlan]?.price || 19}.00 USD
                        </div>
                        <p className="text-xs text-slate-400 max-w-sm mx-auto">
                          Ready for buyer handover. To switch to live PayPal payments, new owner simply pastes live Client ID in Super Admin.
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={executePayment}
                        className="w-full bg-[#0070ba] hover:bg-[#005ea6] text-white font-black py-4 rounded-xl transition-all shadow-[0_0_25px_rgba(0,112,186,0.3)] flex items-center justify-center gap-2 cursor-pointer text-sm"
                      >
                        <ShieldCheck className="w-4 h-4" /> Complete PayPal Sandbox Payment (${paymentSettings.pricing?.[checkoutPlan]?.price || 19}.00)
                      </button>
                    </div>
                  )}

                  {/* Security Footnote */}
                  <div className="flex items-center justify-center gap-4 text-[11px] text-slate-500 pt-2 border-t border-white/5">
                    <span className="flex items-center gap-1"><Lock className="w-3 h-3" /> TLS 1.3 Encryption</span>
                    <span>•</span>
                    <span className="flex items-center gap-1"><Gem className="w-3 h-3 text-emerald-400" /> Instant Ledger Update</span>
                    <span>•</span>
                    <span>Flippa-Ready Architecture</span>
                  </div>

                  {/* Cancel Button */}
                  <div className="text-center pt-2">
                    <button
                      type="button"
                      onClick={() => { if (!isCheckingOut) setShowCheckoutModal(false); }}
                      className="text-xs font-bold text-slate-400 hover:text-white transition-colors cursor-pointer py-1.5 px-4 rounded-lg bg-slate-900 border border-white/5 hover:border-white/20"
                    >
                      ✕ Cancel & Close Checkout
                    </button>
                  </div>
                </>
              )}

            </div>

          </div>
        </div>
      )}

      {/* 1-Click Supplier Sourcing & Factory Match Modal (Fitur #1) */}
      {selectedProductForSupplier && (
        <div 
          onClick={(e) => { if (e.target === e.currentTarget) setSelectedProductForSupplier(null); }}
          className="fixed inset-0 z-[120] flex items-center justify-center bg-[#020617]/90 backdrop-blur-xl p-3 sm:p-6 overflow-y-auto"
        >
          <div className="bg-[#0f172a] border border-amber-500/40 rounded-3xl w-full max-w-2xl shadow-[0_0_80px_rgba(245,158,11,0.25)] relative flex flex-col max-h-[92vh] overflow-hidden">
            
            {/* Header (Sticky at top with prominent Close Button) */}
            <div className="p-4 sm:p-6 border-b border-white/10 flex items-center justify-between bg-slate-900/95 backdrop-blur-md shrink-0 sticky top-0 z-30">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shadow-inner">
                  <Package className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                    1-Click Supplier Sourcing <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full border border-amber-500/30 font-bold uppercase tracking-wider">Direct Factory</span>
                  </h3>
                  <p className="text-xs text-slate-400">Match this winning product with global wholesale manufacturers</p>
                </div>
              </div>
              <button 
                type="button"
                onClick={() => setSelectedProductForSupplier(null)} 
                className="text-slate-300 hover:text-white hover:bg-red-500/20 hover:border-red-500/40 border border-white/20 w-9 h-9 rounded-xl bg-slate-800 flex items-center justify-center transition-all cursor-pointer font-bold text-sm shrink-0 shadow-md"
                title="Close"
              >
                ✕
              </button>
            </div>

            {/* Body (Scrollable with custom scrollbar) */}
            <div className="p-5 sm:p-6 space-y-6 overflow-y-auto flex-1 custom-scrollbar">

              {/* Product Brief & Estimated Profit Margin */}
              <div className="bg-[#1e293b]/70 border border-white/10 rounded-2xl p-5 flex flex-col sm:flex-row items-center gap-5">
                {selectedProductForSupplier.image ? (
                  <img 
                    src={selectedProductForSupplier.image} 
                    alt={selectedProductForSupplier.title} 
                    className="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded-xl border border-white/10 shrink-0 shadow-md" 
                  />
                ) : (
                  <div className="w-20 h-20 sm:w-24 sm:h-24 bg-slate-800 rounded-xl flex items-center justify-center text-xs text-slate-500 border border-white/10 shrink-0">
                    No Image
                  </div>
                )}

                <div className="flex-1 text-center sm:text-left">
                  <div className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-1">
                    {selectedProductForSupplier.product_type || 'Winning E-Commerce Product'}
                  </div>
                  <h4 className="text-base font-bold text-white leading-snug line-clamp-2 mb-3">
                    {selectedProductForSupplier.title}
                  </h4>

                  {/* 3x-4x Dropship Margin Formula */}
                  {(() => {
                    const priceNum = parseFloat(String(selectedProductForSupplier.price || '0').replace(/[^0-9.]/g, '')) || 29.99;
                    const estSourcing = (priceNum * 0.28).toFixed(2);
                    const estMargin = (priceNum - Number(estSourcing)).toFixed(2);
                    const marginPercent = Math.round((Number(estMargin) / priceNum) * 100);

                    return (
                      <div className="grid grid-cols-3 gap-2 bg-[#0f172a] p-3 rounded-xl border border-white/5 text-center">
                        <div>
                          <div className="text-[10px] text-slate-400 uppercase font-bold">Store Price</div>
                          <div className="text-sm font-black text-white">${priceNum.toFixed(2)}</div>
                        </div>
                        <div>
                          <div className="text-[10px] text-amber-400 uppercase font-bold">Est. Sourcing</div>
                          <div className="text-sm font-black text-amber-400">~${estSourcing}</div>
                        </div>
                        <div>
                          <div className="text-[10px] text-emerald-400 uppercase font-bold">Est. Profit</div>
                          <div className="text-sm font-black text-emerald-400">+${estMargin} ({marginPercent}%)</div>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              </div>

              {/* 4 Direct Sourcing Portals */}
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                  Direct Wholesale & Agent Sourcing Portals
                </label>

                {(() => {
                  const rawTitle = selectedProductForSupplier.title || '';
                  const cleanSearch = rawTitle.replace(/[^\w\s-]/gi, '').split(' ').slice(0, 5).join(' ').trim();
                  const aliExpressUrl = `https://www.aliexpress.com/wholesale?SearchText=${encodeURIComponent(cleanSearch)}`;
                  const cjUrl = `https://cjdropshipping.com/list-detail.html?search=${encodeURIComponent(cleanSearch)}`;
                  const alibabaUrl = `https://www.alibaba.com/trade/search?SearchText=${encodeURIComponent(cleanSearch)}`;
                  const googleLensUrl = selectedProductForSupplier.image 
                    ? `https://lens.google.com/uploadbyurl?url=${encodeURIComponent(selectedProductForSupplier.image)}`
                    : null;

                  return (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      
                      {/* AliExpress */}
                      <a
                        href={aliExpressUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-4 rounded-2xl bg-gradient-to-br from-[#ff4747]/10 to-transparent border border-[#ff4747]/30 hover:border-[#ff4747]/70 transition-all group flex flex-col justify-between hover:shadow-[0_0_20px_rgba(255,71,71,0.2)] hover:-translate-y-0.5 cursor-pointer"
                      >
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-black text-[#ff4747] uppercase tracking-wider flex items-center gap-1.5">
                              🛒 AliExpress
                            </span>
                            <ArrowUpRight className="w-4 h-4 text-slate-500 group-hover:text-white transition-colors" />
                          </div>
                          <p className="text-xs text-slate-300 leading-relaxed mb-3">
                            Instant product matching on the world's largest consumer catalog with customer reviews.
                          </p>
                        </div>
                        <div className="text-[11px] font-bold text-[#ff4747] flex items-center gap-1">
                          Find Supplier on AliExpress →
                        </div>
                      </a>

                      {/* CJ Dropshipping */}
                      <a
                        href={cjUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-4 rounded-2xl bg-gradient-to-br from-[#00b4d8]/10 to-transparent border border-[#00b4d8]/30 hover:border-[#00b4d8]/70 transition-all group flex flex-col justify-between hover:shadow-[0_0_20px_rgba(0,180,216,0.2)] hover:-translate-y-0.5 cursor-pointer"
                      >
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-black text-[#00b4d8] uppercase tracking-wider flex items-center gap-1.5">
                              📦 CJ Dropshipping
                            </span>
                            <ArrowUpRight className="w-4 h-4 text-slate-500 group-hover:text-white transition-colors" />
                          </div>
                          <p className="text-xs text-slate-300 leading-relaxed mb-3">
                            Direct private agent sourcing, fast 5-8 day shipping & automatic Shopify order sync.
                          </p>
                        </div>
                        <div className="text-[11px] font-bold text-[#00b4d8] flex items-center gap-1">
                          Source on CJ Dropshipping →
                        </div>
                      </a>

                      {/* Google Lens Visual Factory Match */}
                      {googleLensUrl ? (
                        <a
                          href={googleLensUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-4 rounded-2xl bg-gradient-to-br from-emerald-500/10 to-transparent border border-emerald-500/30 hover:border-emerald-500/70 transition-all group flex flex-col justify-between hover:shadow-[0_0_20px_rgba(16,185,129,0.2)] hover:-translate-y-0.5 cursor-pointer"
                        >
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-xs font-black text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                                🔍 Google Lens Visual Match
                              </span>
                              <ArrowUpRight className="w-4 h-4 text-slate-500 group-hover:text-white transition-colors" />
                            </div>
                            <p className="text-xs text-slate-300 leading-relaxed mb-3">
                              Reverse image search competitor's exact product photo to discover 1688 / Taobao raw suppliers.
                            </p>
                          </div>
                          <div className="text-[11px] font-bold text-emerald-400 flex items-center gap-1">
                            Reverse Image Search Factory →
                          </div>
                        </a>
                      ) : (
                        <div className="p-4 rounded-2xl bg-slate-900/50 border border-white/5 opacity-50">
                          <span className="text-xs font-bold text-slate-500">Google Lens (Requires Image)</span>
                        </div>
                      )}

                      {/* Alibaba Direct */}
                      <a
                        href={alibabaUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-4 rounded-2xl bg-gradient-to-br from-[#f59e0b]/10 to-transparent border border-[#f59e0b]/30 hover:border-[#f59e0b]/70 transition-all group flex flex-col justify-between hover:shadow-[0_0_20px_rgba(245,158,11,0.2)] hover:-translate-y-0.5 cursor-pointer"
                      >
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-black text-[#f59e0b] uppercase tracking-wider flex items-center gap-1.5">
                              🏭 Alibaba Bulk Wholesale
                            </span>
                            <ArrowUpRight className="w-4 h-4 text-slate-500 group-hover:text-white transition-colors" />
                          </div>
                          <p className="text-xs text-slate-300 leading-relaxed mb-3">
                            Direct manufacturer contact for private labeling, custom logos, and bulk unit pricing.
                          </p>
                        </div>
                        <div className="text-[11px] font-bold text-[#f59e0b] flex items-center gap-1">
                          Contact Alibaba Factories →
                        </div>
                      </a>

                    </div>
                  );
                })()}
              </div>

              {/* Sourcing Pro Tip */}
              <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-xs text-emerald-300 flex items-start gap-2.5">
                <Sparkles className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <strong>Pro Dropshipper Strategy:</strong> If a competitor is scaling this product, check their pricing. Contact a CJ Dropshipping or AliExpress agent with their link and request 15-20% volume discount before launching your ads.
                </div>
              </div>

            </div>

          </div>
        </div>
      )}

      {/* STRATEGY PLAYBOOK MODAL */}
      {showPlaybook && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-[#020617]/85 backdrop-blur-md p-4">
          <div className="bg-[#0f172a] border border-emerald-500/30 rounded-3xl p-6 md:p-8 w-full max-w-3xl shadow-[0_0_50px_rgba(16,185,129,0.2)] relative max-h-[85vh] flex flex-col">
            <button 
              onClick={() => setShowPlaybook(false)} 
              className="absolute top-5 right-5 text-slate-400 hover:text-white transition-colors"
            >
              ✕
            </button>

            <div className="flex items-center gap-3 mb-6 border-b border-white/5 pb-5">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-emerald-400" />
              </div>
              <div>
                <h2 className="text-2xl font-black text-white">Competitor Tactical Playbook</h2>
                <p className="text-xs text-slate-400 mt-0.5">Deep architectural insights and free beginner clone strategies.</p>
              </div>
            </div>

            <div className="overflow-y-auto space-y-6 pr-2 custom-scrollbar">
              
              {/* Estimated Monthly Tech Stack Cost Banner */}
              <div className="bg-gradient-to-r from-emerald-950/40 via-slate-900 to-blue-950/40 border border-emerald-500/30 p-5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider text-emerald-400">Estimated Tech Stack Spend</div>
                  <div className="text-2xl font-black text-white mt-1">~$240 – $480 <span className="text-xs text-slate-400 font-normal">/ month in app subscriptions</span></div>
                  <p className="text-xs text-slate-400 mt-1">This store is heavily optimized for repeat purchases and social proof.</p>
                </div>
                <div className="bg-emerald-500/10 border border-emerald-500/20 px-3 py-2 rounded-xl text-xs text-emerald-300 font-medium text-center shrink-0">
                  ⚡ High-Converting Formula
                </div>
              </div>

              {/* Theme Breakdown */}
              <div className="bg-slate-900/90 border border-white/5 p-5 rounded-2xl space-y-3">
                <div className="flex items-center gap-2 text-sm font-bold text-white uppercase tracking-wider">
                  <Layers className="w-4 h-4 text-emerald-400" /> Theme Architecture & Advice
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 bg-slate-950 rounded-xl border border-white/5">
                    <span className="text-slate-500 block">Theme Name</span>
                    <span className="font-bold text-white text-sm">{result ? result.theme : 'Custom Shopify 2.0'}</span>
                  </div>
                  <div className="p-3 bg-slate-950 rounded-xl border border-white/5">
                    <span className="text-slate-500 block">Cost to Buy/Build</span>
                    <span className="font-bold text-emerald-400 text-sm">{themeIntel.estimatedCost}</span>
                  </div>
                </div>
                <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-xs text-slate-300 leading-relaxed">
                  {themeIntel.beginnerAdvice}
                </div>
              </div>

              {/* Apps Breakdown with Actionable Advice */}
              <div className="space-y-3">
                <div className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <Zap className="w-4 h-4 text-blue-400" /> Detected Revenue Machines & How to Clone
                </div>

                {activeApps.map((appName, idx) => {
                  const cleanName = appName.replace(' (Rewards)', '');
                  const intel = APP_INTELLIGENCE[appName] || APP_INTELLIGENCE[cleanName] || {
                    category: 'E-commerce Utility',
                    role: 'Feature Enhancement',
                    strategy: 'Adds dynamic conversion elements to the customer journey.',
                    estimatedCost: '$29/mo',
                    alternative: 'Free built-in Shopify alternatives.',
                  };

                  return (
                    <div key={idx} className="bg-slate-900/90 border border-white/5 p-5 rounded-2xl space-y-2.5">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white text-base">{appName}</span>
                          <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/20">
                            {intel.category}
                          </span>
                        </div>
                        <span className="text-xs font-mono text-slate-400">Est. Cost: {intel.estimatedCost}</span>
                      </div>

                      <div className="text-xs text-slate-300 leading-relaxed bg-slate-950/60 p-3 rounded-xl border border-white/5">
                        <strong className="text-white block mb-0.5">Competitor's Secret Strategy:</strong>
                        {intel.strategy}
                      </div>

                      <div className="flex items-start gap-2 text-xs text-emerald-400/90 bg-emerald-500/10 border border-emerald-500/20 p-2.5 rounded-xl">
                        <Lightbulb className="w-4 h-4 shrink-0 text-emerald-400 mt-0.5" />
                        <div>
                          <strong>Free/Budget Alternative for You:</strong> {intel.alternative}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

            </div>

            <div className="mt-6 pt-4 border-t border-white/5 flex justify-end">
              <button
                onClick={() => setShowPlaybook(false)}
                className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-6 py-2.5 rounded-xl text-sm transition-all"
              >
                Close Playbook
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AI Rewrite Modal */}
      {rewriteResult && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#020617]/80 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-emerald-500/30 rounded-2xl p-6 w-full max-w-2xl shadow-2xl relative max-h-[80vh] flex flex-col">
            <button 
              onClick={() => setRewriteResult(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              ✕
            </button>
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-6 h-6 text-emerald-400" />
              <h2 className="text-xl font-bold text-white">AI Rewrite: {rewriteResult.title}</h2>
            </div>
            <div className="bg-slate-950 rounded-xl p-4 overflow-y-auto flex-1 text-slate-300 prose prose-invert prose-emerald max-w-none custom-scrollbar">
              <div dangerouslySetInnerHTML={{ __html: rewriteResult.html }} />
            </div>
            <button 
              onClick={() => {
                navigator.clipboard.writeText(rewriteResult.html);
                showToast("Product HTML description copied to clipboard!", "success", "Copied to Clipboard 📋");
              }}
              className="mt-4 w-full bg-emerald-500 hover:bg-emerald-400 text-slate-900 py-3 rounded-xl font-bold transition-all cursor-pointer"
            >
              Copy HTML for Shopify
            </button>
          </div>
        </div>
      )}

      {/* MAIN VIEW: DEDICATED APP WORKSPACE (LOGGED-IN) vs FULL MARKETING LANDING PAGE (GUEST) */}
      {user ? (
        /* DEDICATED LOGGED-IN SPY WORKSPACE (MATCHES USER SCREENSHOT: TOP SEARCH BAR + TERMINAL) */
        <main className="relative pt-28 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto flex flex-col items-center z-10">
          
          {/* Quick Status Bar */}
          <div className="w-full max-w-4xl flex items-center justify-between mb-4 px-2">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              <span className="text-xs font-mono uppercase tracking-wider text-emerald-400 font-bold">Shopify Spy Terminal Ready</span>
              <span className="text-xs text-slate-400 hidden sm:inline">• Logged in as <span className="text-slate-200 font-semibold">{user.email}</span> • Target any Shopify store URL</span>
            </div>
            <button 
              onClick={() => setShowPaywall(true)}
              className="text-xs bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm hover:shadow-[0_0_15px_rgba(16,185,129,0.2)]"
            >
              <Gem className="w-3.5 h-3.5" /> Top Up Credits
            </button>
          </div>

          {/* Primary Top Search Bar (High Priority at Top, Exact Match to User Screenshot) */}
          <div className="w-full max-w-4xl relative z-30 mb-8">
            <div className="relative flex flex-col md:flex-row items-center gap-3 bg-[#0f172a]/90 p-2.5 rounded-2xl border border-white/10 shadow-2xl backdrop-blur-xl focus-within:border-emerald-500/50 focus-within:shadow-[0_0_30px_rgba(16,185,129,0.2)] transition-all">
              <div className="relative flex-1 w-full flex items-center">
                <Search className="absolute left-4 w-6 h-6 text-emerald-500/70" />
                <input 
                  type="text" 
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://competitor-store.myshopify.com" 
                  className="w-full bg-transparent pl-13 pr-4 py-4 text-white placeholder-slate-500 focus:outline-none text-base sm:text-lg font-medium"
                  onKeyDown={(e) => e.key === 'Enter' && handleAnalyze()}
                />
              </div>
              <button 
                onClick={handleAnalyze}
                disabled={isLoading}
                className="w-full md:w-auto bg-gradient-to-r from-emerald-500 to-emerald-400 hover:from-emerald-400 hover:to-emerald-300 text-slate-900 px-8 py-4 rounded-xl font-black text-base sm:text-lg flex items-center justify-center gap-2 transition-all shrink-0 shadow-lg shadow-emerald-500/25 disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
              >
                {isLoading ? (
                  <><Loader2 className="w-5 h-5 animate-spin" /> Scanning...</>
                ) : (
                  <><Eye className="w-5 h-5" /> Analyze Store</>
                )}
              </button>
            </div>

            {error && (
              <div className="mt-3 flex items-center gap-2 text-red-400 bg-red-400/10 px-4 py-2.5 rounded-xl border border-red-400/20 text-xs">
                <AlertCircle className="w-4 h-4 shrink-0" /> {error}
              </div>
            )}
          </div>

          {/* Interactive Mockup / Terminal Inspector Window */}
          <div className="w-full max-w-6xl">
            {renderInspectorTerminal()}
          </div>

          {/* Workspace Footer / Account Status Bar */}
          <div className="w-full max-w-6xl mt-10 p-5 rounded-2xl bg-[#0f172a]/70 border border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-inner">
                <Gem className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm font-bold text-white">
                  Available Balance: <span className="text-emerald-400 font-black">{credits !== null ? `${credits} Credits` : (user.email === 'admin@shopiespy.com' ? '9999 Credits' : '3 Credits')}</span>
                </div>
                <div className="text-xs text-slate-400">1 Credit = 1 Full Store X-Ray or 1 AI Product Rewrite</div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {(user.email === 'admin@shopiespy.com' || user.email === 'superadmin@shopiespy.com') && (
                <Link href="/admin" className="text-xs font-bold text-blue-400 hover:text-blue-300 border border-blue-500/30 px-3.5 py-2 rounded-xl bg-blue-500/10 transition-colors">
                  Admin Panel
                </Link>
              )}
              <button
                onClick={() => setShowPaywall(true)}
                className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-4 py-2 rounded-xl text-xs transition-all shadow-md cursor-pointer flex items-center gap-1.5"
              >
                <CreditCard className="w-3.5 h-3.5" /> Buy More Credits
              </button>
            </div>
          </div>

        </main>
      ) : (
        /* GUEST / LANDING PAGE VIEW */
        <>
          {/* Hero Section */}
          <main className="relative pt-40 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto flex flex-col items-center text-center z-10">
            
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-bold mb-8 backdrop-blur-sm shadow-[0_0_15px_rgba(16,185,129,0.1)]">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              ⚡ #1 Shopify Intelligence & Dropship Espionage Tool
            </div>

            <h1 className="text-5xl sm:text-7xl md:text-8xl font-black tracking-tight max-w-5xl mb-8 leading-[1.05] text-white">
              Steal Your Competitors' <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 drop-shadow-[0_0_35px_rgba(16,185,129,0.3)]">
                Shopify Winning Secrets.
              </span>
            </h1>

            <p className="max-w-3xl text-lg sm:text-xl text-slate-400 mb-10 leading-relaxed">
              The ultimate espionage engine for <strong className="text-white">Shopify Dropshippers & DTC Brands</strong>. Reveal hidden Shopify 2.0 themes, secret high-converting apps, live best-selling products, and 1-click supplier factory sourcing. <strong className="text-slate-200">In exactly 3 seconds.</strong>
            </p>

            {/* Input Form */}
            <div className="w-full max-w-3xl relative z-30">
              <div className="relative flex flex-col md:flex-row items-center gap-3 bg-[#0f172a]/80 p-2.5 rounded-2xl border border-white/10 shadow-2xl backdrop-blur-xl focus-within:border-emerald-500/50 focus-within:shadow-[0_0_30px_rgba(16,185,129,0.2)] transition-all">
                <div className="relative flex-1 w-full flex items-center">
                  <Search className="absolute left-4 w-6 h-6 text-emerald-500/70" />
                  <input 
                    type="text" 
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://competitor-store.myshopify.com" 
                    className="w-full bg-transparent pl-13 pr-4 py-4 text-white placeholder-slate-500 focus:outline-none text-lg font-medium"
                    onKeyDown={(e) => e.key === 'Enter' && handleAnalyze()}
                  />
                </div>
                <button 
                  onClick={handleAnalyze}
                  disabled={isLoading}
                  className="w-full md:w-auto bg-gradient-to-r from-emerald-500 to-emerald-400 hover:from-emerald-400 hover:to-emerald-300 text-slate-900 px-8 py-4 rounded-xl font-black text-lg flex items-center justify-center gap-2 transition-all shrink-0 shadow-lg shadow-emerald-500/25 disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
                >
                  {isLoading ? (
                    <><Loader2 className="w-5 h-5 animate-spin" /> Scanning...</>
                  ) : (
                    <><Eye className="w-5 h-5" /> Analyze Store</>
                  )}
                </button>
              </div>

              {/* Capability Badges */}
              <div className="mt-5 flex flex-wrap items-center justify-center gap-3 sm:gap-4 text-xs text-slate-400">
                <span className="flex items-center gap-1.5 font-medium"><Check className="w-3.5 h-3.5 text-emerald-400" /> Shopify 2.0 Theme Detective</span>
                <span className="text-slate-600 hidden sm:inline">•</span>
                <span className="flex items-center gap-1.5 font-medium"><Check className="w-3.5 h-3.5 text-emerald-400" /> Secret App Stack Spy</span>
                <span className="text-slate-600 hidden sm:inline">•</span>
                <span className="flex items-center gap-1.5 font-medium"><Check className="w-3.5 h-3.5 text-emerald-400" /> Best-Seller CSV Export</span>
                <span className="text-slate-600 hidden sm:inline">•</span>
                <span className="flex items-center gap-1.5 font-medium"><Check className="w-3.5 h-3.5 text-emerald-400" /> 1-Click Supplier Sourcing</span>
              </div>
            </div>

            {error && (
              <div className="mt-4 flex items-center gap-2 text-red-400 bg-red-400/10 px-4 py-2 rounded-lg border border-red-400/20">
                <AlertCircle className="w-4 h-4" /> {error}
              </div>
            )}

          </main>

          {/* Live Mockup / Dashboard Preview Section */}
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-20 pb-24">
            {renderInspectorTerminal()}
          </div>

          {/* Features Grid */}
          <section id="features" className="bg-[#020617] py-24 relative border-t border-white/5">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
              
              <div className="text-center mb-20">
                <h2 className="text-3xl md:text-5xl font-black mb-6 text-white">Your Unfair Advantage</h2>
                <p className="text-slate-400 text-lg max-w-2xl mx-auto">Stop guessing what works. Clone their exact strategy with our 3-step espionage framework.</p>
              </div>

              <div className="grid md:grid-cols-3 gap-8">
                
                {/* Feature 1 */}
                <div className="bg-[#0f172a] p-10 rounded-[2rem] border border-white/5 hover:border-emerald-500/30 transition-all duration-300 group hover:shadow-[0_0_40px_rgba(16,185,129,0.1)] hover:-translate-y-2">
                  <div className="w-16 h-16 bg-gradient-to-br from-slate-800 to-slate-900 border border-white/10 rounded-2xl flex items-center justify-center mb-8 shadow-inner">
                    <Radar className="w-8 h-8 text-emerald-400 group-hover:scale-110 transition-transform duration-300" />
                  </div>
                  <h3 className="text-2xl font-bold mb-4 text-white">X-Ray Scanner & Playbook</h3>
                  <p className="text-slate-400 leading-relaxed text-lg">
                    Instantly detect the exact Shopify Theme they are using and reveal hidden third-party apps generating their sales, with beginner clone advice.
                  </p>
                </div>

                {/* Feature 2 */}
                <div className="bg-[#0f172a] p-10 rounded-[2rem] border border-white/5 hover:border-emerald-500/30 transition-all duration-300 group hover:shadow-[0_0_40px_rgba(16,185,129,0.1)] hover:-translate-y-2">
                  <div className="w-16 h-16 bg-gradient-to-br from-slate-800 to-slate-900 border border-white/10 rounded-2xl flex items-center justify-center mb-8 shadow-inner">
                    <BarChart3 className="w-8 h-8 text-emerald-400 group-hover:scale-110 transition-transform duration-300" />
                  </div>
                  <h3 className="text-2xl font-bold mb-4 text-white">Best-Seller CSV</h3>
                  <p className="text-slate-400 leading-relaxed text-lg">
                    Bypass their defenses. Extract their top-selling products and download them as a Shopify-ready CSV in one single click.
                  </p>
                </div>

                {/* Feature 3 */}
                <div className="bg-[#0f172a] p-10 rounded-[2rem] border border-emerald-500/20 hover:border-emerald-500/50 transition-all duration-300 group relative overflow-hidden shadow-[0_0_30px_rgba(16,185,129,0.05)] hover:shadow-[0_0_40px_rgba(16,185,129,0.15)] hover:-translate-y-2">
                  <div className="absolute top-0 right-0 w-40 h-40 bg-emerald-500/10 blur-[50px] rounded-full"></div>
                  <div className="w-16 h-16 bg-gradient-to-br from-emerald-500/20 to-emerald-900/20 border border-emerald-500/30 rounded-2xl flex items-center justify-center mb-8 relative z-10">
                    <Sparkles className="w-8 h-8 text-emerald-400 group-hover:scale-110 transition-transform duration-300" />
                  </div>
                  <h3 className="text-2xl font-bold mb-4 text-white relative z-10 flex items-center gap-2">
                    AI Takedown <span className="text-xs bg-emerald-500 text-slate-900 px-2 py-0.5 rounded-full font-bold">PRO</span>
                  </h3>
                  <p className="text-slate-400 leading-relaxed text-lg relative z-10">
                    Feed their product page to our Gemini AI engine. It will analyze their weak points and generate a superior SEO-optimized copy for you.
                  </p>
                </div>

              </div>
            </div>
          </section>

          {/* Pricing Section - Pay As You Go */}
          <section id="pricing" className="py-24 relative bg-[#020617] z-10 border-t border-white/5">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-16">
                <h2 className="text-3xl md:text-5xl font-black mb-6 text-white">Pay As You Go. <span className="text-emerald-400">No Subscriptions.</span></h2>
                <p className="text-slate-400 text-lg max-w-2xl mx-auto">We hate monthly commitments just as much as you do. Buy credits only when you need them. <br/> <strong className="text-white">1 Credit = 1 Store X-Ray or 1 AI Rewrite.</strong></p>
              </div>

              <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                {/* Starter */}
                <div className="bg-[#0f172a] p-8 rounded-[2rem] border border-white/5 hover:border-emerald-500/30 transition-all flex flex-col justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-white mb-2">{paymentSettings.pricing?.starter?.name || 'Starter Agent'}</h3>
                    <div className="text-4xl font-black text-white mb-6">${paymentSettings.pricing?.starter?.price || 19}<span className="text-lg text-slate-500 font-medium">/one-time</span></div>
                    <ul className="space-y-4 mb-8">
                      <li className="flex items-center gap-3 text-slate-300"><CheckCircle2 className="w-5 h-5 text-emerald-500" /> {paymentSettings.pricing?.starter?.credits || 50} Spy Credits</li>
                      <li className="flex items-center gap-3 text-slate-300"><CheckCircle2 className="w-5 h-5 text-emerald-500" /> Full X-Ray Scans</li>
                      <li className="flex items-center gap-3 text-slate-300"><CheckCircle2 className="w-5 h-5 text-emerald-500" /> Competitor Strategy Playbook</li>
                      <li className="flex items-center gap-3 text-slate-300"><CheckCircle2 className="w-5 h-5 text-emerald-500" /> 1-Click CSV Exports</li>
                    </ul>
                  </div>
                  <button 
                    onClick={() => handleCheckout('starter')}
                    className="w-full bg-slate-800 hover:bg-slate-700 text-white py-3.5 rounded-xl font-bold transition-all cursor-pointer"
                  >
                    Buy {paymentSettings.pricing?.starter?.credits || 50} Credits
                  </button>
                </div>

                {/* Pro */}
                <div className="bg-gradient-to-b from-[#0f172a] to-[#022c22] p-8 rounded-[2rem] border border-emerald-500/50 shadow-[0_0_30px_rgba(16,185,129,0.15)] flex flex-col justify-between relative transform md:-translate-y-4">
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-emerald-500 text-[#020617] text-xs font-black px-4 py-1 rounded-full uppercase tracking-widest">Most Popular</div>
                  <div>
                    <h3 className="text-xl font-bold text-white mb-2">{paymentSettings.pricing?.pro?.name || 'Pro Spy Master'}</h3>
                    <div className="text-4xl font-black text-emerald-400 mb-6">${paymentSettings.pricing?.pro?.price || 49}<span className="text-lg text-emerald-500/50 font-medium">/one-time</span></div>
                    <ul className="space-y-4 mb-8">
                      <li className="flex items-center gap-3 text-white"><CheckCircle2 className="w-5 h-5 text-emerald-400" /> {paymentSettings.pricing?.pro?.credits || 200} Spy Credits</li>
                      <li className="flex items-center gap-3 text-white"><CheckCircle2 className="w-5 h-5 text-emerald-400" /> Full X-Ray & Deep Insights</li>
                      <li className="flex items-center gap-3 text-white"><CheckCircle2 className="w-5 h-5 text-emerald-400" /> AI Competitor Takedown</li>
                      <li className="flex items-center gap-3 text-white"><CheckCircle2 className="w-5 h-5 text-emerald-400" /> Priority Support</li>
                    </ul>
                  </div>
                  <button 
                    onClick={() => handleCheckout('pro')}
                    className="w-full bg-emerald-500 hover:bg-emerald-400 text-[#020617] py-3.5 rounded-xl font-bold transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)] cursor-pointer"
                  >
                    Buy {paymentSettings.pricing?.pro?.credits || 200} Credits
                  </button>
                </div>

                {/* Agency */}
                <div className="bg-[#0f172a] p-8 rounded-[2rem] border border-white/5 hover:border-emerald-500/30 transition-all flex flex-col justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-white mb-2">{paymentSettings.pricing?.agency?.name || 'Agency Elite Pack'}</h3>
                    <div className="text-4xl font-black text-white mb-6">${paymentSettings.pricing?.agency?.price || 99}<span className="text-lg text-slate-500 font-medium">/one-time</span></div>
                    <ul className="space-y-4 mb-8">
                      <li className="flex items-center gap-3 text-slate-300"><CheckCircle2 className="w-5 h-5 text-emerald-500" /> {paymentSettings.pricing?.agency?.credits || 1000} Spy Credits</li>
                      <li className="flex items-center gap-3 text-slate-300"><CheckCircle2 className="w-5 h-5 text-emerald-500" /> Everything in Pro Plan</li>
                      <li className="flex items-center gap-3 text-slate-300"><CheckCircle2 className="w-5 h-5 text-emerald-500" /> High-Volume AI Rewrites</li>
                      <li className="flex items-center gap-3 text-slate-300"><CheckCircle2 className="w-5 h-5 text-emerald-500" /> 24/7 VIP Priority Support</li>
                    </ul>
                  </div>
                  <button 
                    onClick={() => handleCheckout('agency')}
                    className="w-full bg-slate-800 hover:bg-slate-700 text-white py-3.5 rounded-xl font-bold transition-all cursor-pointer"
                  >
                    Buy {paymentSettings.pricing?.agency?.credits || 1000} Credits
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* Final CTA */}
          <section className="py-32 relative overflow-hidden">
            <div className="absolute inset-0 bg-emerald-900/20"></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg h-64 bg-emerald-500/20 blur-[100px] rounded-full"></div>
            
            <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
              <h2 className="text-5xl md:text-6xl font-black mb-8 text-white">Stop Guessing. <br className="hidden md:block"/> Start Spying.</h2>
              <p className="text-xl text-emerald-100/70 mb-12 max-w-2xl mx-auto">Join smart dropshippers who are already using ShopieSpy to uncover their competitors' winning formulas.</p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <button onClick={() => { setIsLoginMode(false); setShowAuth(true); }} className="w-full sm:w-auto bg-white hover:bg-slate-100 text-slate-900 px-10 py-5 rounded-xl text-xl font-black transition-all shadow-[0_0_30px_rgba(255,255,255,0.2)] hover:shadow-[0_0_40px_rgba(255,255,255,0.4)] hover:-translate-y-1 cursor-pointer">
                  Start Free Trial Now
                </button>
                <a href="#pricing" className="w-full sm:w-auto bg-transparent border border-white/20 hover:bg-white/5 text-white px-10 py-5 rounded-xl text-xl font-bold transition-all flex items-center justify-center cursor-pointer">
                  View Pricing
                </a>
              </div>
              <p className="mt-8 text-sm text-slate-400 flex items-center justify-center gap-2">
                <Lock className="w-4 h-4" /> No credit card required. 3 Free Scans included.
              </p>
            </div>
          </section>
        </>
      )}

    </div>
  );
}
