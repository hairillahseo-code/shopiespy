"use client";

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { 
  User, Mail, Shield, Key, CreditCard, ChevronLeft, 
  Loader2, CheckCircle2, Zap, AlertCircle
} from 'lucide-react';

export default function SettingsPage() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // Password change states
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null);

  // Profile update states
  const [name, setName] = useState('');
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileMessage, setProfileMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null);

  // Delete modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user);
        
        // Ensure profile is created and get credits from our server API (bypasses RLS)
        try {
          const res = await fetch('/api/user/credits', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: session.user.id, email: session.user.email })
          });
          const data = await res.json();
          
          if (data.success) {
            setProfile({
              credits: data.credits,
              plan: data.credits === -1 ? 'agency' : 'free',
            });
            if (data.name) setName(data.name);
          }
        } catch (e) {
          console.error("Failed to load profile", e);
        }
      }
      setLoading(false);
    };
    
    fetchUser();
  }, []);

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setMessage({ text: 'Passwords do not match.', type: 'error' });
      return;
    }
    if (newPassword.length < 6) {
      setMessage({ text: 'Password must be at least 6 characters.', type: 'error' });
      return;
    }

    setPasswordLoading(true);
    setMessage(null);

    const { error } = await supabase.auth.updateUser({
      password: newPassword
    });

    if (error) {
      setMessage({ text: error.message, type: 'error' });
    } else {
      setMessage({ text: 'Password updated successfully.', type: 'success' });
      setNewPassword('');
      setConfirmPassword('');
    }
    setPasswordLoading(false);
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileLoading(true);
    setProfileMessage(null);

    try {
      const res = await fetch('/api/user/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, name })
      });
      const data = await res.json();
      
      if (data.success) {
        setProfileMessage({ text: 'Profile updated successfully.', type: 'success' });
      } else {
        setProfileMessage({ text: data.error || 'Failed to update profile.', type: 'error' });
      }
    } catch (error: any) {
      setProfileMessage({ text: 'An unexpected error occurred.', type: 'error' });
    }
    
    setProfileLoading(false);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.href = '/';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-emerald-400">
        <Loader2 className="w-8 h-8 animate-spin mb-4" />
        <p className="text-sm font-semibold tracking-widest uppercase">Loading Profile...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-6 text-center">
        <Shield className="w-16 h-16 text-slate-600 mb-6" />
        <h1 className="text-2xl font-bold text-white mb-2">Access Denied</h1>
        <p className="text-slate-400 mb-6">Please log in to view your account settings.</p>
        <Link href="/" className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-2.5 rounded-lg font-semibold transition-colors">
          Return Home
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white font-sans selection:bg-emerald-500/30">
      {/* Top Navbar */}
      <header className="border-b border-white/5 bg-slate-900/50 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm font-semibold">
            <ChevronLeft className="w-4 h-4" /> Back to App
          </Link>
          <div className="text-sm font-bold tracking-widest uppercase text-emerald-400 flex items-center gap-2">
            <User className="w-4 h-4" /> Account Settings
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-10 space-y-8">
        
        {/* Profile Info Card */}
        <section className="bg-slate-800/50 border border-white/10 rounded-2xl p-6 sm:p-8 backdrop-blur-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
          
          <h2 className="text-lg font-bold flex items-center gap-2 mb-6">
            <User className="w-5 h-5 text-emerald-400" /> Personal Information
          </h2>
          
          <div className="grid sm:grid-cols-2 gap-6 relative z-10 mb-6">
            <div>
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1 block">Email Address</label>
              <div className="bg-slate-900/80 border border-white/5 rounded-lg px-4 py-3 flex items-center gap-3">
                <Mail className="w-4 h-4 text-slate-500" />
                <span className="text-sm text-slate-200">{user.email}</span>
              </div>
            </div>
            
            <div>
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1 block">Account Created</label>
              <div className="bg-slate-900/80 border border-white/5 rounded-lg px-4 py-3 flex items-center gap-3">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span className="text-sm text-slate-200">
                  {new Date(user.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                </span>
              </div>
            </div>
          </div>
          
          <form onSubmit={handleProfileUpdate} className="relative z-10 border-t border-white/10 pt-6 max-w-md">
            {profileMessage && (
              <div className={`mb-4 p-3 rounded-lg text-xs font-semibold flex items-center gap-2 ${profileMessage.type === 'success' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'}`}>
                {profileMessage.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                {profileMessage.text}
              </div>
            )}
            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1 block">Full Name</label>
                <input 
                  type="text" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-900 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-hidden focus:border-emerald-500/50 transition-colors"
                  placeholder="e.g. John Doe"
                />
              </div>
              <button 
                type="submit" 
                disabled={profileLoading}
                className="bg-slate-800 hover:bg-slate-700 border border-white/10 text-white px-5 py-2.5 rounded-lg text-sm font-bold transition-all flex items-center gap-2"
              >
                {profileLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                Save Changes
              </button>
            </div>
          </form>
        </section>

        {/* Subscription & Billing */}
        <section className="bg-slate-800/50 border border-white/10 rounded-2xl p-6 sm:p-8 backdrop-blur-sm relative overflow-hidden">
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>
          
          <h2 className="text-lg font-bold flex items-center gap-2 mb-6">
            <CreditCard className="w-5 h-5 text-blue-400" /> Subscription & Billing
          </h2>
          
          <div className="flex flex-col sm:flex-row gap-6 items-start relative z-10">
            <div className="flex-1 bg-gradient-to-br from-slate-900 to-slate-800 border border-white/10 rounded-xl p-5 shadow-lg">
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Current Plan</div>
              <div className="text-2xl font-black text-white flex items-end gap-2">
                {profile?.plan ? profile.plan.charAt(0).toUpperCase() + profile.plan.slice(1) : 'Free'}
                <span className="text-sm text-emerald-400 font-semibold mb-1">Active</span>
              </div>
              <p className="text-xs text-slate-500 mt-2">To upgrade your plan, visit the pricing page in the dashboard.</p>
            </div>

            <div className="flex-1 bg-gradient-to-br from-slate-900 to-slate-800 border border-white/10 rounded-xl p-5 shadow-lg">
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Available Credits</div>
              <div className="text-2xl font-black text-white flex items-center gap-2">
                <Zap className="w-6 h-6 text-amber-400" />
                {profile?.credits === -1 ? 'Unlimited' : (profile?.credits ?? '-')}
              </div>
              <p className="text-xs text-slate-500 mt-2">Used for AI Rewriting and deep store analysis.</p>
            </div>
          </div>
          
          <div className="mt-6 flex justify-end relative z-10">
            <button className="text-xs font-bold text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-1 bg-blue-500/10 px-4 py-2 rounded-lg">
              Manage Payment Methods (Stripe) <ChevronLeft className="w-3 h-3 rotate-180" />
            </button>
          </div>
        </section>

        {/* Security / Password */}
        <section className="bg-slate-800/50 border border-white/10 rounded-2xl p-6 sm:p-8 backdrop-blur-sm relative overflow-hidden">
          <h2 className="text-lg font-bold flex items-center gap-2 mb-6">
            <Key className="w-5 h-5 text-rose-400" /> Security Settings
          </h2>
          
          <form onSubmit={handlePasswordUpdate} className="max-w-md relative z-10">
            {message && (
              <div className={`mb-4 p-3 rounded-lg text-xs font-semibold flex items-center gap-2 ${message.type === 'success' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'}`}>
                {message.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                {message.text}
              </div>
            )}
            
            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1 block">New Password</label>
                <input 
                  type="password" 
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full bg-slate-900 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-hidden focus:border-emerald-500/50 transition-colors"
                  placeholder="Minimum 6 characters"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1 block">Confirm Password</label>
                <input 
                  type="password" 
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-slate-900 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-hidden focus:border-emerald-500/50 transition-colors"
                  placeholder="Repeat new password"
                />
              </div>
              
              <button 
                type="submit" 
                disabled={passwordLoading || !newPassword || !confirmPassword}
                className="bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed text-white px-5 py-2.5 rounded-lg text-sm font-bold transition-all flex items-center gap-2 shadow-[0_0_15px_rgba(16,185,129,0.2)]"
              >
                {passwordLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Shield className="w-4 h-4" />}
                Update Password
              </button>
            </div>
          </form>
        </section>

        {/* Danger Zone */}
        <section className="pt-6 border-t border-white/5 flex justify-between items-center">
          {user.email !== 'superadmin@shopiespy.com' && user.email !== 'admin@shopiespy.com' ? (
            <>
              <button 
                onClick={() => setShowDeleteModal(true)}
                className="text-xs font-bold text-rose-400 hover:text-white bg-rose-500/10 hover:bg-rose-500/30 border border-rose-500/20 px-4 py-2 rounded-lg transition-colors"
              >
                Delete Account
              </button>

              {/* Custom Delete Confirmation Modal */}
              {showDeleteModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
                  <div className="bg-slate-900 border border-rose-500/30 rounded-2xl p-6 max-w-sm w-full shadow-[0_0_40px_rgba(244,63,94,0.15)] transform transition-all">
                    <div className="flex items-center justify-center w-12 h-12 rounded-full bg-rose-500/10 text-rose-500 mb-4 mx-auto">
                      <AlertCircle className="w-6 h-6" />
                    </div>
                    <h3 className="text-xl font-bold text-white text-center mb-2">Delete Account?</h3>
                    <p className="text-sm text-slate-400 text-center mb-6">
                      This action cannot be undone. All your saved data, store analyses, and remaining credits will be permanently lost.
                    </p>
                    <div className="flex gap-3">
                      <button 
                        onClick={() => setShowDeleteModal(false)}
                        className="flex-1 px-4 py-2.5 rounded-lg text-sm font-bold text-slate-300 bg-slate-800 hover:bg-slate-700 transition-colors"
                      >
                        Cancel
                      </button>
                      <button 
                        onClick={async () => {
                          setShowDeleteModal(false);
                          const res = await fetch('/api/user/delete', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ userId: user.id, email: user.email })
                          });
                          if (res.ok) {
                            await handleSignOut();
                          } else {
                            alert('Failed to delete account. Please contact support.');
                          }
                        }}
                        className="flex-1 px-4 py-2.5 rounded-lg text-sm font-bold text-white bg-rose-500 hover:bg-rose-600 shadow-[0_0_15px_rgba(244,63,94,0.3)] transition-colors"
                      >
                        Yes, Delete
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div></div>
          )}
          <button 
            onClick={handleSignOut}
            className="text-xs font-bold text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 border border-white/5 px-4 py-2 rounded-lg transition-colors"
          >
            Sign Out
          </button>
        </section>

      </main>
    </div>
  );
}
