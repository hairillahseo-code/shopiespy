"use client";

import React, { useState, useEffect } from 'react';
import { 
  Swords, Search, Radar, Gem, LogOut, ChevronRight, CheckCircle2, AlertCircle, ShieldCheck, Loader2, BarChart3, Target, Crown
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

export default function BattlePage() {
  const [user, setUser] = useState<any>(null);
  const [credits, setCredits] = useState<number | null>(null);
  const [urlA, setUrlA] = useState('');
  const [urlB, setUrlB] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [resultA, setResultA] = useState<any>(null);
  const [resultB, setResultB] = useState<any>(null);

  useEffect(() => {
    checkUser();
    supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser(session.user);
        fetchCredits(session.user.id);
      } else {
        setUser(null);
        setCredits(null);
      }
    });
  }, []);

  const checkUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      setUser(session.user);
      fetchCredits(session.user.id);
    }
  };

  const fetchCredits = async (userId: string) => {
    const { data } = await supabase.from('profiles').select('credits').eq('id', userId).single();
    if (data) setCredits(data.credits);
  };

  const deductCredit = async () => {
    if (!user) return false;
    // Allow if user is admin email OR has unlimited credits (-1)
    if (user.email === 'admin@shopiespy.com' || user.email === 'superadmin@shopiespy.com' || credits === -1) return true;
    
    if (credits === null || credits <= 0) return false;
    
    const { error } = await supabase.from('profiles').update({ credits: credits - 1 }).eq('id', user.id);
    if (!error) {
      setCredits(credits - 1);
      return true;
    }
    return false;
  };

  const handleBattle = async () => {
    if (!urlA || !urlB) {
      setError("Please enter two Shopify URLs to begin the battle.");
      return;
    }
    if (!user) {
      setError("Please login on the main page first.");
      return;
    }
    if (credits === null || (credits <= 0 && credits !== -1)) {
      setError("Not enough credits. Please recharge on the main page.");
      return;
    }

    setError('');
    setIsLoading(true);
    setResultA(null);
    setResultB(null);

    try {
      const [resA, resB] = await Promise.all([
        fetch('/api/analyze-store', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ url: urlA }) }),
        fetch('/api/analyze-store', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ url: urlB }) })
      ]);
      
      const dataA = await resA.json();
      const dataB = await resB.json();

      if (!resA.ok || dataA.error || !resB.ok || dataB.error) {
        throw new Error("One or both URLs failed to analyze. Ensure both are valid Shopify stores.");
      }

      // Deduct exactly 1 credit for scanning 2 stores (Promo feature)
      const creditDeducted = await deductCredit();
      if (!creditDeducted) throw new Error("Failed to deduct credit.");

      setResultA(dataA.data);
      setResultB(dataB.data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Helper to calculate AOV from top 30 products
  const getAveragePrice = (products: any[]) => {
    if (!products || products.length === 0) return 0;
    const total = products.reduce((acc, p) => acc + (parseFloat(p.price) || 0), 0);
    return (total / products.length).toFixed(2);
  };

  const getCheapestPrice = (products: any[]) => {
    if (!products || products.length === 0) return 0;
    return Math.min(...products.map(p => parseFloat(p.price) || 0)).toFixed(2);
  };

  const getMostExpensivePrice = (products: any[]) => {
    if (!products || products.length === 0) return 0;
    return Math.max(...products.map(p => parseFloat(p.price) || 0)).toFixed(2);
  };

  return (
    <div className="min-h-screen bg-[#020617] text-slate-300 font-sans selection:bg-rose-500/30 overflow-x-hidden relative">
      
      {/* Background Effects */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[800px] overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-rose-500/10 blur-[120px]"></div>
        <div className="absolute top-[20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-blue-500/10 blur-[120px]"></div>
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAwIDEwIEwgNDAgMTAgTSAxMCAwIEwgMTAgNDAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsIDI1NSwgMjU1LCAwLjAzKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-50"></div>
      </div>

      {/* Navigation (Duplicated for standalone page independence) */}
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
            <Link href="/" className="text-slate-400 hover:text-white font-medium text-sm flex items-center gap-2 py-7 transition-colors">
              <Search className="w-4 h-4" /> Store X-Ray
            </Link>
            <Link href="/battle" className="text-rose-400 font-bold text-sm flex items-center gap-2 border-b-2 border-rose-400 py-7">
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
                  className="bg-emerald-500/10 border border-emerald-500/30 px-4 py-2 rounded-lg flex items-center gap-2 font-bold text-emerald-400"
                >
                  <Gem className="w-4 h-4" /> 
                  {(user.email === 'admin@shopiespy.com' || user.email === 'superadmin@shopiespy.com') ? 'Unlimited Credits' : (credits !== null ? `${credits} Credits` : '3 Credits')}
                </div>
                <button 
                  onClick={() => supabase.auth.signOut()}
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <Link href="/" className="text-sm font-bold text-emerald-400 hover:text-white transition-colors">
                Login / Signup &rarr;
              </Link>
            )}
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-36 pb-20 relative z-10">
        
        {/* Header Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm font-bold mb-6">
            <Swords className="w-4 h-4" /> COMPETITOR SHOWDOWN (1 CREDIT)
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-white tracking-tight mb-6">
            Store <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-400 to-orange-500">Battle</span> Arena
          </h1>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto">
            Input two rival Shopify stores and let our intelligence engine pit their metrics, apps, and best-sellers head-to-head.
          </p>
        </div>

        {/* Input Section */}
        <div className="bg-[#0f172a] border border-white/5 rounded-3xl p-6 md:p-8 max-w-4xl mx-auto mb-12 shadow-2xl relative">
          <div className="flex flex-col md:flex-row items-center gap-4 relative">
            <div className="flex-1 w-full relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Target className="w-5 h-5 text-slate-400" />
              </div>
              <input 
                type="text" 
                placeholder="Rival A (e.g. fashionnova.com)"
                className="w-full bg-[#1e293b] border border-white/10 text-white text-sm rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-transparent block p-4 pl-12 transition-all placeholder-slate-500"
                value={urlA}
                onChange={(e) => setUrlA(e.target.value)}
                disabled={isLoading}
              />
            </div>
            
            <div className="w-12 h-12 shrink-0 bg-slate-800 rounded-full flex items-center justify-center font-black text-rose-400 border border-white/5 z-10 relative">
              VS
            </div>

            <div className="flex-1 w-full relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Target className="w-5 h-5 text-slate-400" />
              </div>
              <input 
                type="text" 
                placeholder="Rival B (e.g. gymshark.com)"
                className="w-full bg-[#1e293b] border border-white/10 text-white text-sm rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-transparent block p-4 pl-12 transition-all placeholder-slate-500"
                value={urlB}
                onChange={(e) => setUrlB(e.target.value)}
                disabled={isLoading}
              />
            </div>
          </div>

          {error && (
            <div className="mt-6 flex items-center gap-2 text-rose-400 bg-rose-500/10 p-3 rounded-lg border border-rose-500/20 text-sm font-medium">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}

          <div className="mt-8 flex justify-center">
            <button 
              onClick={handleBattle}
              disabled={isLoading || !urlA || !urlB}
              className="group bg-gradient-to-r from-rose-500 to-orange-500 hover:from-rose-400 hover:to-orange-400 text-white px-10 py-4 rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-3 w-full md:w-auto shadow-[0_0_20px_rgba(244,63,94,0.3)] hover:shadow-[0_0_30px_rgba(244,63,94,0.5)] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <><Loader2 className="w-5 h-5 animate-spin" /> ANALYZING...</>
              ) : (
                <><Swords className="w-5 h-5 group-hover:scale-125 transition-transform" /> BATTLE NOW!</>
              )}
            </button>
          </div>
        </div>

        {/* Results Section */}
        {resultA && resultB && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
            
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-white flex items-center justify-center gap-2">
                <BarChart3 className="w-6 h-6 text-emerald-400" /> Head-to-Head Comparison
              </h2>
            </div>

            {/* Comparison Table */}
            <div className="bg-[#0f172a] border border-white/5 rounded-3xl overflow-hidden shadow-xl">
              <div className="grid grid-cols-3 divide-x divide-white/5">
                
                {/* Metrics Column (Center) */}
                <div className="col-span-3 grid grid-cols-3 bg-slate-800/50 p-4 border-b border-white/5 font-black text-white text-center uppercase tracking-wider text-xs md:text-sm">
                  <div className="truncate px-2 text-blue-400">{urlA}</div>
                  <div className="text-slate-500">METRICS</div>
                  <div className="truncate px-2 text-orange-400">{urlB}</div>
                </div>

                {/* Rows */}
                {[
                  { label: "Theme Detected", a: resultA.theme || 'Custom/Hidden', b: resultB.theme || 'Custom/Hidden' },
                  { label: "Primary Category", a: resultA.products[0]?.product_type || 'General/Mixed', b: resultB.products[0]?.product_type || 'General/Mixed' },
                  { label: "Detected Apps", a: resultA.apps.length, b: resultB.apps.length },
                  { label: "Tech Stack Spend (Est.)", a: `$${resultA.apps.length * 29}/mo`, b: `$${resultB.apps.length * 29}/mo` },
                  { label: "Top Selling Products", a: resultA.products.length, b: resultB.products.length },
                  { label: "Catalog Velocity", a: resultA.products.length >= 10 ? 'High 🚀' : 'Normal ⚡', b: resultB.products.length >= 10 ? 'High 🚀' : 'Normal ⚡' },
                  { label: "Average Order Value (AOV)", a: `$${getAveragePrice(resultA.products)}`, b: `$${getAveragePrice(resultB.products)}` },
                  { label: "Cheapest Item", a: `$${getCheapestPrice(resultA.products)}`, b: `$${getCheapestPrice(resultB.products)}` },
                  { label: "Most Expensive Item", a: `$${getMostExpensivePrice(resultA.products)}`, b: `$${getMostExpensivePrice(resultB.products)}` },
                  { label: "Est. Monthly Revenue", a: `$${(parseFloat(getAveragePrice(resultA.products).toString()) * resultA.products.length * 125).toLocaleString()}`, b: `$${(parseFloat(getAveragePrice(resultB.products).toString()) * resultB.products.length * 125).toLocaleString()}` },
                ].map((row, idx) => {
                  
                  // Simple winner logic for visual styling
                  let winner = 'tie';
                  if (typeof row.a === 'number' && typeof row.b === 'number') {
                    if (row.a > row.b) winner = 'a';
                    else if (row.b > row.a) winner = 'b';
                  } else if (typeof row.a === 'string' && typeof row.a.startsWith('$') && typeof row.b === 'string' && typeof row.b.startsWith('$')) {
                    const valA = parseFloat(row.a.replace('$', ''));
                    const valB = parseFloat(row.b.replace('$', ''));
                    if (valA > valB) winner = 'a';
                    else if (valB > valA) winner = 'b';
                  }

                  return (
                    <div key={idx} className="col-span-3 grid grid-cols-3 p-4 border-b border-white/5 items-center hover:bg-white/[0.02] transition-colors">
                      <div className={`text-center font-mono md:text-lg ${winner === 'a' ? 'text-blue-400 font-bold' : 'text-slate-400'}`}>
                        {winner === 'a' && <Crown className="w-4 h-4 inline-block mr-2 text-yellow-400" />}
                        {row.a}
                      </div>
                      <div className="text-center text-xs md:text-sm font-bold text-slate-500 uppercase tracking-wider px-2">
                        {row.label}
                      </div>
                      <div className={`text-center font-mono md:text-lg ${winner === 'b' ? 'text-orange-400 font-bold' : 'text-slate-400'}`}>
                        {row.b}
                        {winner === 'b' && <Crown className="w-4 h-4 inline-block ml-2 text-yellow-400" />}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Note */}
            <div className="text-center text-slate-500 text-sm">
              <p>Winner crowns 👑 are based on higher numerical values. Depending on the metric (like Cheapest Item), a higher value isn't always "better" in business context.</p>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}
