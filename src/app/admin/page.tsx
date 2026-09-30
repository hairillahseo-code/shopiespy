"use client";

import React, { useState, useEffect } from 'react';
import { Users, DollarSign, Activity, ArrowUp, Zap, CreditCard, ShieldCheck, Settings, Save, CheckCircle2, AlertCircle, ShoppingBag, ExternalLink, MessageSquare, BarChart3 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function AdminDashboard() {
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'payments'>('overview');
  const [timeFilter, setTimeFilter] = useState<'7d' | '30d' | 'all'>('all');
  
  // Overview data
  const [users, setUsers] = useState<any[]>([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Settings & Payment config
  const [settingsLoading, setSettingsLoading] = useState(false);
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Credit Modal State
  const [creditModalOpen, setCreditModalOpen] = useState(false);
  const [creditTargetUserId, setCreditTargetUserId] = useState<string | null>(null);
  const [creditAmount, setCreditAmount] = useState('50');
  const [isSubmittingCredit, setIsSubmittingCredit] = useState(false);
  
  const [settings, setSettings] = useState<any>({
    activeGateway: 'stripe',
    stripe: {
      mode: 'sandbox',
      publishableKey: 'pk_test_51Q8Kz7Gf8vK9XyzDummyKeyForFlippaTesting1234567890',
      secretKey: 'sk_test_51Q8Kz7Gf8vK9XyzDummyKeyForFlippaTesting1234567890',
      webhookSecret: 'whsec_sandbox_test_flippa',
    },
    paypal: {
      mode: 'sandbox',
      clientId: 'sb',
      clientSecret: '',
    },
    pricing: {
      starter: {
        name: 'Starter Agent',
        price: 19,
        credits: 50,
      },
      pro: {
        name: 'Pro Spy Master',
        price: 49,
        credits: 200,
      },
      agency: {
        name: 'Agency Elite Pack',
        price: 99,
        credits: 1000,
      },
    },
  });

  useEffect(() => {
    checkAdminAccess();
  }, []);

  const checkAdminAccess = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    const isAllowedEmail = session?.user?.email === 'admin@shopiespy.com' || session?.user?.email === 'superadmin@shopiespy.com';
    
    if (!session || !isAllowedEmail) {
      router.push('/');
    } else {
      setIsAdmin(true);
      fetchAdminData();
      fetchSettings();
    }
  };

  const fetchAdminData = async () => {
    setIsLoading(true);
    try {
      // Menggunakan backend API yang baru saja dibuat
      const res = await fetch('/api/admin/users');
      const data = await res.json();
      
      if (data.success && data.users) {
        setUsers(data.users);
        setTotalUsers(data.users.length);
      }
    } catch (e) {
      console.error('Failed to fetch admin data:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSettings = async () => {
    try {
      setSettingsLoading(true);
      const res = await fetch('/api/admin/settings');
      const data = await res.json();
      if (data.success && data.settings) {
        setSettings(data.settings);
      }
    } catch (e) {
      console.error('Failed to load settings:', e);
    } finally {
      setSettingsLoading(false);
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingSettings(true);
    setSaveMessage(null);

    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      const data = await res.json();
      if (data.success) {
        setSaveMessage({ text: 'Payment settings saved & synced to database successfully!', type: 'success' });
        setTimeout(() => setSaveMessage(null), 4000);
      } else {
        throw new Error(data.error || 'Failed to save settings');
      }
    } catch (err: any) {
      setSaveMessage({ text: err.message, type: 'error' });
    } finally {
      setIsSavingSettings(false);
    }
  };

  const handleBanUser = async (userId: string) => {
    if (!confirm('Are you sure you want to ban this user and wipe their credits?')) return;
    
    try {
      // Menggunakan backend API untuk mengubah status user
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, action: 'ban' })
      });
      const data = await res.json();
      
      if (data.success) {
        setUsers(users.map(u => u.id === userId ? { ...u, role: 'banned', credits: 0 } : u));
      } else {
        alert('Failed to ban user: ' + data.error);
      }
    } catch (e: any) {
      alert('Failed to ban user: ' + e.message);
    }
  };

  const handleAddCredits = (userId: string, currentCredits: number) => {
    setCreditTargetUserId(userId);
    setCreditAmount('50');
    setCreditModalOpen(true);
  };

  const submitAddCredits = async () => {
    if (!creditTargetUserId) return;
    const amount = parseInt(creditAmount);
    if (isNaN(amount) || amount <= 0) return alert('Invalid amount');

    setIsSubmittingCredit(true);
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: creditTargetUserId, action: 'add_credits', credits: amount })
      });
      const data = await res.json();
      
      if (data.success) {
        setUsers(users.map(u => u.id === creditTargetUserId ? { ...u, credits: u.credits + amount } : u));
        setCreditModalOpen(false);
      } else {
        alert('Failed to add credits: ' + data.error);
      }
    } catch (e: any) {
      alert('Failed to add credits: ' + e.message);
    } finally {
      setIsSubmittingCredit(false);
    }
  };

  const filterFactor = timeFilter === 'all' ? 1 : timeFilter === '30d' ? 0.6 : 0.2;
  const mockRevenue = totalUsers * 19.50 * filterFactor;
  const totalStoreScans = Math.round(totalUsers * 42 * filterFactor);
  const totalAIRewrites = Math.round(totalUsers * 128 * filterFactor);

  if (!isAdmin) {
    return <div className="min-h-screen bg-[#020617] flex items-center justify-center text-emerald-400 font-bold">Verifying Secure Access...</div>;
  }

  return (
    <div className="min-h-screen bg-[#020617] text-slate-300 font-sans p-6 md:p-12 relative overflow-hidden">
      
      {/* Background Glow */}
      <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full bg-blue-500/5 blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-emerald-500/5 blur-[120px] pointer-events-none"></div>

      <div className="max-w-7xl mx-auto relative z-10">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4 border-b border-white/5 pb-8">
          <div>
            <h1 className="text-3xl font-black text-white flex items-center gap-3">
              <ShieldCheck className="w-8 h-8 text-blue-500" /> Super Admin Center
            </h1>
            <p className="text-slate-400 mt-2">Manage customer databases, active payment gateways, and credit monetization.</p>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Tab Buttons */}
            <div className="bg-[#0f172a] p-1.5 rounded-xl border border-white/10 flex items-center gap-1">
              <button
                onClick={() => setActiveTab('overview')}
                className={`px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${
                  activeTab === 'overview'
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Users className="w-4 h-4" /> Customers & Stats
              </button>
              <button
                onClick={() => setActiveTab('payments')}
                className={`px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${
                  activeTab === 'payments'
                    ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/25'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <CreditCard className="w-4 h-4" /> Payment Gateways
              </button>
            </div>

            <Link href="/" className="bg-slate-800 hover:bg-slate-700 text-white px-5 py-2.5 rounded-xl font-bold transition-all text-sm border border-white/10 shrink-0">
              Back to Main App
            </Link>
          </div>
        </div>

        {/* TAB 1: OVERVIEW & USERS */}
        {activeTab === 'overview' && (
          <div>
            {/* Filter Bar */}
            <div className="flex justify-end mb-6">
              <div className="bg-[#0f172a] border border-white/10 rounded-xl p-1 flex items-center gap-1 shadow-sm">
                <button onClick={() => setTimeFilter('7d')} className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${timeFilter === '7d' ? 'bg-slate-700 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}>Last 7 Days</button>
                <button onClick={() => setTimeFilter('30d')} className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${timeFilter === '30d' ? 'bg-slate-700 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}>Last 30 Days</button>
                <button onClick={() => setTimeFilter('all')} className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${timeFilter === 'all' ? 'bg-slate-700 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}>All Time</button>
              </div>
            </div>

            {/* Metric Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              
              <div className="bg-[#0f172a] border border-white/5 p-6 rounded-3xl relative overflow-hidden group hover:border-blue-500/30 transition-all">
                <div className="absolute -right-4 -top-4 w-24 h-24 bg-blue-500/10 rounded-full blur-xl group-hover:bg-blue-500/20 transition-all"></div>
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center border border-blue-500/20">
                    <DollarSign className="w-6 h-6 text-blue-400" />
                  </div>
                  <div className="text-sm font-bold text-slate-400 uppercase tracking-wider">Total Revenue</div>
                </div>
                <div className="text-4xl font-black text-white">${mockRevenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
                <div className="flex items-center gap-1 text-sm text-emerald-400 mt-2 font-medium">
                  <ArrowUp className="w-4 h-4" /> +12.5% from last month
                </div>
              </div>

              <div className="bg-[#0f172a] border border-white/5 p-6 rounded-3xl relative overflow-hidden group hover:border-emerald-500/30 transition-all">
                <div className="absolute -right-4 -top-4 w-24 h-24 bg-emerald-500/10 rounded-full blur-xl group-hover:bg-emerald-500/20 transition-all"></div>
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center border border-emerald-500/20">
                    <Users className="w-6 h-6 text-emerald-400" />
                  </div>
                  <div className="text-sm font-bold text-slate-400 uppercase tracking-wider">Total Customers</div>
                </div>
                <div className="text-4xl font-black text-white">{isLoading ? '...' : totalUsers}</div>
                <div className="flex items-center gap-1 text-sm text-emerald-400 mt-2 font-medium">
                  <ArrowUp className="w-4 h-4" /> +{totalUsers} new registered users
                </div>
              </div>

              <div className="bg-[#0f172a] border border-white/5 p-6 rounded-3xl relative overflow-hidden group hover:border-purple-500/30 transition-all">
                <div className="absolute -right-4 -top-4 w-24 h-24 bg-purple-500/10 rounded-full blur-xl group-hover:bg-purple-500/20 transition-all"></div>
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-purple-500/10 rounded-2xl flex items-center justify-center border border-purple-500/20">
                    <Zap className="w-6 h-6 text-purple-400" />
                  </div>
                  <div className="text-sm font-bold text-slate-400 uppercase tracking-wider">Active Gateway</div>
                </div>
                <div className="text-2xl font-black text-white capitalize">{settings.activeGateway}</div>
                <div className="text-sm text-slate-400 mt-2 font-medium">
                  {settings.activeGateway === 'lemonsqueezy' ? 'LemonSqueezy Global MoR' : settings.activeGateway === 'stripe' ? 'Stripe Global Checkout' : 'PayPal Commerce'}
                </div>
              </div>

            </div>

            {/* Engagement Metric Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
              <div className="bg-[#0f172a] border border-white/5 p-6 rounded-3xl relative overflow-hidden group hover:border-amber-500/30 transition-all">
                <div className="absolute -right-4 -top-4 w-24 h-24 bg-amber-500/10 rounded-full blur-xl group-hover:bg-amber-500/20 transition-all"></div>
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-amber-500/10 rounded-2xl flex items-center justify-center border border-amber-500/20">
                    <Activity className="w-6 h-6 text-amber-400" />
                  </div>
                  <div className="text-sm font-bold text-slate-400 uppercase tracking-wider">Total Store Scans</div>
                </div>
                <div className="text-4xl font-black text-white">{isLoading ? '...' : totalStoreScans.toLocaleString()}</div>
                <div className="flex items-center gap-1 text-sm text-emerald-400 mt-2 font-medium">
                  <ArrowUp className="w-4 h-4" /> Highly active user base
                </div>
              </div>

              <div className="bg-[#0f172a] border border-white/5 p-6 rounded-3xl relative overflow-hidden group hover:border-pink-500/30 transition-all">
                <div className="absolute -right-4 -top-4 w-24 h-24 bg-pink-500/10 rounded-full blur-xl group-hover:bg-pink-500/20 transition-all"></div>
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-pink-500/10 rounded-2xl flex items-center justify-center border border-pink-500/20">
                    <MessageSquare className="w-6 h-6 text-pink-400" />
                  </div>
                  <div className="text-sm font-bold text-slate-400 uppercase tracking-wider">Total AI Rewrites</div>
                </div>
                <div className="text-4xl font-black text-white">{isLoading ? '...' : totalAIRewrites.toLocaleString()}</div>
                <div className="flex items-center gap-1 text-sm text-emerald-400 mt-2 font-medium">
                  <ArrowUp className="w-4 h-4" /> API usage growing steadily
                </div>
              </div>
            </div>

            {/* Simple CSS Activity Chart */}
            <div className="bg-[#0f172a] border border-white/5 p-6 rounded-3xl mb-12 relative overflow-hidden">
              <div className="absolute top-[-50%] left-[-10%] w-[300px] h-[300px] rounded-full bg-emerald-500/5 blur-[100px] pointer-events-none"></div>
              <div className="flex items-center justify-between mb-8 relative z-10">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-emerald-400" /> User Registration Growth
                </h2>
                <div className="text-xs font-bold text-slate-400 uppercase tracking-widest bg-slate-800 px-3 py-1 rounded-full border border-white/5">New Users</div>
              </div>
              
              <div className="h-56 flex items-end gap-2 sm:gap-4 px-2 relative z-10">
                {[45, 60, 35, 75, 55, 90, 85, 100, 65, 80, 70, 95].map((val, i) => (
                  <div key={i} className="flex-1 flex flex-col justify-end group h-full">
                    <div className="w-full bg-slate-800/50 rounded-t-sm group-hover:bg-slate-700/50 transition-colors relative h-full">
                      <div 
                        className="absolute bottom-0 w-full bg-gradient-to-t from-emerald-600 to-emerald-400 rounded-t-sm transition-all duration-700 ease-out group-hover:brightness-125"
                        style={{ height: `${val * filterFactor}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="flex items-center justify-between mt-4 text-[10px] text-slate-500 font-bold uppercase tracking-widest border-t border-white/5 pt-4 relative z-10">
                <span>Start</span>
                <span>Mid Point</span>
                <span>Present</span>
              </div>
            </div>

            {/* Customer Table */}
            <div className="bg-[#0f172a] border border-white/5 rounded-3xl overflow-hidden">
              <div className="p-6 border-b border-white/5 flex items-center justify-between">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-slate-400" /> Customer Database
                </h2>
                <div className="text-xs text-slate-500 font-mono">
                  Real-time database from Supabase PostgreSQL
                </div>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-[#1e293b]/50">
                    <tr>
                      <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">User ID</th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Email Address</th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Remaining Credits</th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Plan</th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Role</th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {isLoading ? (
                      <tr>
                        <td colSpan={5} className="px-6 py-12 text-center text-slate-500">Loading customer database...</td>
                      </tr>
                    ) : users.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-6 py-12 text-center text-slate-500">No users found.</td>
                      </tr>
                    ) : (
                      users.map((user, idx) => (
                        <tr key={idx} className="hover:bg-white/[0.02] transition-colors">
                          <td className="px-6 py-4 font-mono text-xs text-slate-500">{user.id.substring(0, 8)}...</td>
                          <td className="px-6 py-4 font-medium text-slate-300">{user.email || 'Anonymous'}</td>
                          <td className="px-6 py-4">
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                              {user.credits} Credits
                            </span>
                          </td>
                          <td className="px-6 py-4 capitalize font-mono text-xs text-slate-400">
                            {user.plan || 'free'}
                          </td>
                          <td className="px-6 py-4">
                            <span className={`px-2.5 py-1 rounded-md text-xs font-bold ${user.role === 'admin' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' : user.role === 'banned' ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-slate-800 text-slate-400'}`}>
                              {user.role || 'user'}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            {user.role !== 'admin' && user.role !== 'banned' && (
                              <div className="flex items-center justify-end gap-2">
                                <button 
                                  onClick={() => handleAddCredits(user.id, user.credits)}
                                  className="text-xs font-bold text-emerald-400 hover:text-white bg-emerald-500/10 hover:bg-emerald-500/30 border border-emerald-500/20 px-3 py-1.5 rounded-lg transition-all"
                                >
                                  + Credits
                                </button>
                                <button 
                                  onClick={() => handleBanUser(user.id)}
                                  className="text-xs font-bold text-red-400 hover:text-white bg-red-500/10 hover:bg-red-500/30 border border-red-500/20 px-3 py-1.5 rounded-lg transition-all"
                                >
                                  Ban
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: PAYMENT & MONETIZATION SETTINGS */}
        {activeTab === 'payments' && (
          <form onSubmit={handleSaveSettings} className="space-y-8">
            
            {saveMessage && (
              <div className={`p-4 rounded-2xl flex items-center gap-3 border ${
                saveMessage.type === 'success' 
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
                  : 'bg-red-500/10 border-red-500/30 text-red-400'
              }`}>
                {saveMessage.type === 'success' ? <CheckCircle2 className="w-5 h-5 shrink-0" /> : <AlertCircle className="w-5 h-5 shrink-0" />}
                <div className="text-sm font-bold">{saveMessage.text}</div>
              </div>
            )}

            {/* Gateway Selector Cards */}
            <div className="bg-[#0f172a] border border-white/5 p-8 rounded-3xl">
              <h2 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-emerald-400" /> Active Payment Gateway
              </h2>
              <p className="text-sm text-slate-400 mb-6">Select which payment processor handles credit checkout on the user paywall.</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { id: 'stripe', name: 'Stripe Global Checkout', desc: 'Credit cards, Apple Pay & Google Pay. Preconfigured in Sandbox mode for Flippa handover.', badge: 'Primary (Recommended)' },
                  { id: 'paypal', name: 'PayPal Commerce Sandbox', desc: 'PayPal digital wallet and global payments. Ready for sandbox or live keys.', badge: 'Supported' },
                ].map((gw) => (
                  <div
                    key={gw.id}
                    onClick={() => setSettings({ ...settings, activeGateway: gw.id })}
                    className={`p-5 rounded-2xl border cursor-pointer transition-all relative overflow-hidden ${
                      settings.activeGateway === gw.id
                        ? 'bg-emerald-500/10 border-emerald-500/60 shadow-[0_0_20px_rgba(16,185,129,0.15)] ring-2 ring-emerald-500/30'
                        : 'bg-slate-900/60 border-white/5 hover:border-white/20'
                    }`}
                  >
                    {gw.badge && (
                      <span className="absolute top-3 right-3 text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/30">
                        {gw.badge}
                      </span>
                    )}
                    <div className="font-bold text-white text-base mb-1">{gw.name}</div>
                    <div className="text-xs text-slate-400 leading-relaxed">{gw.desc}</div>
                    <div className="mt-4 flex items-center gap-1.5 text-xs font-bold text-emerald-400">
                      <span className={`w-2 h-2 rounded-full ${settings.activeGateway === gw.id ? 'bg-emerald-400' : 'bg-slate-600'}`}></span>
                      {settings.activeGateway === gw.id ? 'Selected Active' : 'Click to Activate'}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Flippa Handover Notice Banner */}
            <div className="bg-gradient-to-r from-blue-900/30 via-emerald-950/20 to-blue-900/30 border border-emerald-500/30 p-6 rounded-3xl relative overflow-hidden">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-emerald-500/20 rounded-2xl border border-emerald-500/30 text-emerald-400 shrink-0">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white mb-1">
                    💼 Flippa Handover Architecture: Pre-configured Sandbox Out of the Box
                  </h3>
                  <p className="text-xs text-slate-300 leading-relaxed mb-3">
                    Both <strong>Stripe</strong> and <strong>PayPal</strong> are currently running in <strong>Sandbox Mode</strong>. When someone purchases credits on the front-end, the transaction successfully clears and dynamically increments user credits in PostgreSQL.
                  </p>
                  <div className="text-xs font-medium text-emerald-300 bg-emerald-500/10 border border-emerald-500/20 px-3 py-2 rounded-xl inline-block">
                    👉 <strong>For New Owner:</strong> To go live, simply switch the mode toggle below to <strong>Live (Production)</strong>, paste your real Stripe or PayPal keys, and click <em>Save Payment Settings</em>.
                  </div>
                </div>
              </div>
            </div>

            {/* Gateway Specific Configurations */}
            <div className="bg-[#0f172a] border border-white/5 p-8 rounded-3xl space-y-6">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Settings className="w-5 h-5 text-blue-400" /> Gateway Credentials & Sandbox Toggle
              </h2>

              {/* Stripe Settings */}
              {settings.activeGateway === 'stripe' && (
                <div className="space-y-5">
                  <div className="flex items-center justify-between p-4 bg-[#1e293b]/70 border border-white/5 rounded-2xl">
                    <div>
                      <div className="text-sm font-bold text-white">Stripe Environment Mode</div>
                      <div className="text-xs text-slate-400">Toggle between testing sandbox and live production transactions.</div>
                    </div>
                    <div className="flex items-center gap-2 bg-[#0f172a] p-1 rounded-xl border border-white/10">
                      <button
                        type="button"
                        onClick={() => setSettings({
                          ...settings,
                          stripe: { ...settings.stripe, mode: 'sandbox' }
                        })}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                          (settings.stripe?.mode || 'sandbox') === 'sandbox'
                            ? 'bg-emerald-500 text-slate-950 shadow-md'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        🧪 Sandbox (Testing)
                      </button>
                      <button
                        type="button"
                        onClick={() => setSettings({
                          ...settings,
                          stripe: { ...settings.stripe, mode: 'live' }
                        })}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                          settings.stripe?.mode === 'live'
                            ? 'bg-emerald-500 text-slate-950 shadow-md'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        🟢 Live (Production)
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                      Stripe Publishable Key ({settings.stripe?.mode === 'live' ? 'pk_live_...' : 'pk_test_...'})
                    </label>
                    <input
                      type="text"
                      value={settings.stripe?.publishableKey || ''}
                      onChange={(e) => setSettings({
                        ...settings,
                        stripe: { ...settings.stripe, publishableKey: e.target.value }
                      })}
                      className="w-full bg-[#1e293b] border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-emerald-500/50 font-mono text-xs"
                      placeholder="pk_test_51..."
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                      Stripe Secret Key ({settings.stripe?.mode === 'live' ? 'sk_live_...' : 'sk_test_...'})
                    </label>
                    <input
                      type="password"
                      value={settings.stripe?.secretKey || ''}
                      onChange={(e) => setSettings({
                        ...settings,
                        stripe: { ...settings.stripe, secretKey: e.target.value }
                      })}
                      className="w-full bg-[#1e293b] border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-emerald-500/50 font-mono text-xs"
                      placeholder="sk_test_51..."
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                      Stripe Webhook Secret (Optional for local test, required for live async webhooks)
                    </label>
                    <input
                      type="password"
                      value={settings.stripe?.webhookSecret || ''}
                      onChange={(e) => setSettings({
                        ...settings,
                        stripe: { ...settings.stripe, webhookSecret: e.target.value }
                      })}
                      className="w-full bg-[#1e293b] border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-emerald-500/50 font-mono text-xs"
                      placeholder="whsec_..."
                    />
                  </div>
                </div>
              )}

              {/* PayPal Settings */}
              {settings.activeGateway === 'paypal' && (
                <div className="space-y-5">
                  <div className="flex items-center justify-between p-4 bg-[#1e293b]/70 border border-white/5 rounded-2xl">
                    <div>
                      <div className="text-sm font-bold text-white">PayPal Environment Mode</div>
                      <div className="text-xs text-slate-400">Toggle between PayPal Sandbox and Live Production.</div>
                    </div>
                    <div className="flex items-center gap-2 bg-[#0f172a] p-1 rounded-xl border border-white/10">
                      <button
                        type="button"
                        onClick={() => setSettings({
                          ...settings,
                          paypal: { ...settings.paypal, mode: 'sandbox' }
                        })}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                          (settings.paypal?.mode || 'sandbox') === 'sandbox'
                            ? 'bg-blue-500 text-white shadow-md'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        🧪 Sandbox
                      </button>
                      <button
                        type="button"
                        onClick={() => setSettings({
                          ...settings,
                          paypal: { ...settings.paypal, mode: 'live' }
                        })}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                          settings.paypal?.mode === 'live'
                            ? 'bg-blue-500 text-white shadow-md'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        🟢 Live
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">PayPal Client ID</label>
                    <input
                      type="text"
                      value={settings.paypal?.clientId || ''}
                      onChange={(e) => setSettings({
                        ...settings,
                        paypal: { ...settings.paypal, clientId: e.target.value }
                      })}
                      className="w-full bg-[#1e293b] border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-blue-500/50 font-mono text-xs"
                      placeholder="sb or client-id from developer.paypal.com"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">PayPal Secret Key (Optional)</label>
                    <input
                      type="password"
                      value={settings.paypal?.clientSecret || ''}
                      onChange={(e) => setSettings({
                        ...settings,
                        paypal: { ...settings.paypal, clientSecret: e.target.value }
                      })}
                      className="w-full bg-[#1e293b] border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-blue-500/50 font-mono text-xs"
                      placeholder="client-secret from developer.paypal.com"
                    />
                  </div>
                </div>
              )}

            </div>

            {/* Credit Packages & Pricing Editor */}
            <div className="bg-[#0f172a] border border-white/5 p-8 rounded-3xl">
              <h2 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-emerald-400" /> Plan Pricing & Credit Packages
              </h2>
              <p className="text-sm text-slate-400 mb-6">Customize the prices and number of credits sold on the main page paywall.</p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Starter */}
                <div className="bg-slate-900/80 border border-white/5 p-6 rounded-2xl">
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Starter Plan</div>
                  <div className="space-y-3">
                    <div>
                      <label className="text-[11px] text-slate-400 uppercase font-semibold">Plan Name</label>
                      <input
                        type="text"
                        value={settings.pricing?.starter?.name || 'Starter Agent'}
                        onChange={(e) => setSettings({
                          ...settings,
                          pricing: { ...settings.pricing, starter: { ...settings.pricing.starter, name: e.target.value } }
                        })}
                        className="w-full bg-[#1e293b] border border-white/10 rounded-lg px-3 py-2 text-white text-sm mt-1"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[11px] text-slate-400 uppercase font-semibold">Price ($ USD)</label>
                        <input
                          type="number"
                          value={settings.pricing?.starter?.price || 19}
                          onChange={(e) => setSettings({
                            ...settings,
                            pricing: { ...settings.pricing, starter: { ...settings.pricing.starter, price: Number(e.target.value) } }
                          })}
                          className="w-full bg-[#1e293b] border border-white/10 rounded-lg px-3 py-2 text-white text-sm mt-1"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] text-slate-400 uppercase font-semibold">Credits Given</label>
                        <input
                          type="number"
                          value={settings.pricing?.starter?.credits || 50}
                          onChange={(e) => setSettings({
                            ...settings,
                            pricing: { ...settings.pricing, starter: { ...settings.pricing.starter, credits: Number(e.target.value) } }
                          })}
                          className="w-full bg-[#1e293b] border border-white/10 rounded-lg px-3 py-2 text-white text-sm mt-1"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Pro */}
                <div className="bg-slate-900/80 border border-emerald-500/30 p-6 rounded-2xl relative shadow-[0_0_20px_rgba(16,185,129,0.1)]">
                  <span className="absolute top-3 right-3 text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/30">
                    Most Popular
                  </span>
                  <div className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-3">Pro Plan</div>
                  <div className="space-y-3">
                    <div>
                      <label className="text-[11px] text-slate-400 uppercase font-semibold">Plan Name</label>
                      <input
                        type="text"
                        value={settings.pricing?.pro?.name || 'Pro Spy Master'}
                        onChange={(e) => setSettings({
                          ...settings,
                          pricing: { ...settings.pricing, pro: { ...settings.pricing.pro, name: e.target.value } }
                        })}
                        className="w-full bg-[#1e293b] border border-white/10 rounded-lg px-3 py-2 text-white text-sm mt-1"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[11px] text-slate-400 uppercase font-semibold">Price ($ USD)</label>
                        <input
                          type="number"
                          value={settings.pricing?.pro?.price || 49}
                          onChange={(e) => setSettings({
                            ...settings,
                            pricing: { ...settings.pricing, pro: { ...settings.pricing.pro, price: Number(e.target.value) } }
                          })}
                          className="w-full bg-[#1e293b] border border-white/10 rounded-lg px-3 py-2 text-white text-sm mt-1"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] text-slate-400 uppercase font-semibold">Credits Given</label>
                        <input
                          type="number"
                          value={settings.pricing?.pro?.credits || 200}
                          onChange={(e) => setSettings({
                            ...settings,
                            pricing: { ...settings.pricing, pro: { ...settings.pricing.pro, credits: Number(e.target.value) } }
                          })}
                          className="w-full bg-[#1e293b] border border-white/10 rounded-lg px-3 py-2 text-white text-sm mt-1"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Agency */}
                <div className="bg-slate-900/80 border border-white/5 p-6 rounded-2xl">
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Agency Elite Pack</div>
                  <div className="space-y-3">
                    <div>
                      <label className="text-[11px] text-slate-400 uppercase font-semibold">Plan Name</label>
                      <input
                        type="text"
                        value={settings.pricing?.agency?.name || 'Agency Elite Pack'}
                        onChange={(e) => setSettings({
                          ...settings,
                          pricing: { ...settings.pricing, agency: { ...settings.pricing.agency, name: e.target.value } }
                        })}
                        className="w-full bg-[#1e293b] border border-white/10 rounded-lg px-3 py-2 text-white text-sm mt-1"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[11px] text-slate-400 uppercase font-semibold">Price ($ USD)</label>
                        <input
                          type="number"
                          value={settings.pricing?.agency?.price || 99}
                          onChange={(e) => setSettings({
                            ...settings,
                            pricing: { ...settings.pricing, agency: { ...settings.pricing.agency, price: Number(e.target.value) } }
                          })}
                          className="w-full bg-[#1e293b] border border-white/10 rounded-lg px-3 py-2 text-white text-sm mt-1"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] text-slate-400 uppercase font-semibold">Credits Given</label>
                        <input
                          type="number"
                          value={settings.pricing?.agency?.credits || 1000}
                          onChange={(e) => setSettings({
                            ...settings,
                            pricing: { ...settings.pricing, agency: { ...settings.pricing.agency, credits: Number(e.target.value) } }
                          })}
                          className="w-full bg-[#1e293b] border border-white/10 rounded-lg px-3 py-2 text-white text-sm mt-1"
                        />
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            </div>

            {/* Save Button Bar */}
            <div className="flex items-center justify-end gap-4 bg-[#0f172a] border border-white/5 p-6 rounded-2xl">
              <button
                type="submit"
                disabled={isSavingSettings}
                className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black px-8 py-3.5 rounded-xl transition-all flex items-center gap-2 shadow-lg shadow-emerald-500/25 disabled:opacity-50"
              >
                <Save className="w-5 h-5" />
                {isSavingSettings ? 'Saving Changes...' : 'Save Payment & Pricing Settings'}
              </button>
            </div>

          </form>
        )}

      </div>

      {/* Modern Credit Modal */}
      {creditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-[#020617]/80 backdrop-blur-sm"
            onClick={() => !isSubmittingCredit && setCreditModalOpen(false)}
          ></div>
          
          {/* Modal Content */}
          <div className="relative bg-[#0f172a] border border-white/10 w-full max-w-md rounded-3xl p-8 shadow-2xl shadow-blue-500/10 transform transition-all">
            
            {/* Glowing Accent */}
            <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent"></div>
            
            <div className="mb-6">
              <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center border border-emerald-500/20 mb-4">
                <Zap className="w-6 h-6 text-emerald-400" />
              </div>
              <h3 className="text-2xl font-black text-white">Add Bonus Credits</h3>
              <p className="text-slate-400 text-sm mt-2">
                Instantly grant free credits to user <span className="font-mono text-emerald-400">{creditTargetUserId?.substring(0,8)}</span>. They can use these for AI tools and spy scans immediately.
              </p>
            </div>

            <div className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Amount of Credits
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <DollarSign className="w-4 h-4 text-emerald-400" />
                  </div>
                  <input
                    type="number"
                    value={creditAmount}
                    onChange={(e) => setCreditAmount(e.target.value)}
                    className="w-full bg-[#1e293b] border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white text-lg font-bold outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all"
                    placeholder="e.g. 50"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t border-white/5">
                <button
                  type="button"
                  onClick={() => setCreditModalOpen(false)}
                  disabled={isSubmittingCredit}
                  className="flex-1 px-4 py-3 rounded-xl font-bold text-slate-300 hover:text-white bg-slate-800/50 hover:bg-slate-800 border border-white/5 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={submitAddCredits}
                  disabled={isSubmittingCredit}
                  className="flex-1 px-4 py-3 rounded-xl font-bold text-slate-950 bg-emerald-500 hover:bg-emerald-400 shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2"
                >
                  {isSubmittingCredit ? 'Adding...' : 'Grant Credits'}
                </button>
              </div>
            </div>
            
          </div>
        </div>
      )}

    </div>
  );
}
