'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function AddDeposit() {
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const response = await fetch('/api/add-deposit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, amount: Number(amount) }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ type: 'success', text: data.message || 'টাকা সফলভাবে জমা হয়েছে!' });
        setName('');
        setAmount('');
      } else {
        setMessage({ type: 'error', text: data.message || 'জমা করতে সমস্যা হয়েছে।' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'সার্ভারে সংযোগে সমস্যা হয়েছে!' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-slate-100 p-4 sm:p-8 flex items-center justify-center">
      <div className="w-full max-w-xl bg-white/5 border border-white/10 backdrop-blur-xl p-8 rounded-3xl shadow-2xl relative overflow-hidden">
        {/* Glow */}
        <div className="absolute -top-20 -right-20 w-56 h-56 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-56 h-56 bg-teal-500/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10">
          <div className="flex items-center justify-between mb-6">
            <span className="text-xs px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 font-medium">
              💵 মেম্বার ডিপোজিট
            </span>
            <Link href="/" className="text-xs text-slate-400 hover:text-slate-200 transition">
              ← ড্যাশবোর্ডে ফিরে যান
            </Link>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-white mb-2">
            মেম্বারের টাকা জমা দিন
          </h1>
          <p className="text-sm text-slate-400 mb-6">
            সদস্যের মেস ম্যানেজারের কাছে জমা দেওয়া অগ্রিম টাকা এখানে এন্ট্রি করুন।
          </p>

          {message && (
            <div
              className={`p-4 rounded-xl mb-6 text-sm font-medium ${
                message.type === 'success'
                  ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-300'
                  : 'bg-rose-500/20 border border-rose-500/40 text-rose-300'
              }`}
            >
              {message.text}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">
                মেম্বারের নাম <span className="text-emerald-400">*</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="যেমন: রাহাত, তানভীর"
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 transition"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">
                জমার পরিমাণ (৳) <span className="text-emerald-400">*</span>
              </label>
              <input
                type="number"
                min="1"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="যেমন: ২০০০"
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 transition"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3.5 px-4 rounded-xl font-bold text-white bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 shadow-lg shadow-emerald-500/25 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.01]"
            >
              {loading ? 'সংরক্ষণ হচ্ছে...' : 'টাকা জমা নিশ্চিত করুন'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

