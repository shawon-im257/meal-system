'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface MemberOption {
  id: number;
  name: string;
}

export default function AddMeal() {
  const [name, setName] = useState('');
  const [lunch, setLunch] = useState('');
  const [dinner, setDinner] = useState('');
  const [date, setDate] = useState('');
  const [members, setMembers] = useState<MemberOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    setDate(new Date().toISOString().split('T')[0]);

    // মেম্বারদের তালিকা লোড করা
    fetch('/api/members/list')
      .then((res) => res.json())
      .then((data) => {
        if (data.members) setMembers(data.members);
      })
      .catch((err) => console.error('মেম্বার লিস্ট পাওয়া যায়নি', err));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const response = await fetch('/api/add-meal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          lunch: Number(lunch) || 0,
          dinner: Number(dinner) || 0,
          date,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ type: 'success', text: data.message || 'মিল সফলভাবে যোগ করা হয়েছে!' });
        setLunch('');
        setDinner('');
      } else {
        setMessage({ type: 'error', text: data.message || 'মিল যোগ করতে সমস্যা হয়েছে।' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'সার্ভারে সংযোগে সমস্যা হয়েছে! আবার চেষ্টা করুন।' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-slate-100 p-4 sm:p-8 flex items-center justify-center">
      <div className="w-full max-w-xl bg-white/5 border border-white/10 backdrop-blur-xl p-8 rounded-3xl shadow-2xl relative overflow-hidden">
        {/* Decorative Glow */}
        <div className="absolute -top-24 -left-24 w-60 h-60 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-60 h-60 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10">
          <div className="flex items-center justify-between mb-6">
            <span className="text-xs px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30 font-medium">
              🍲 দৈনিক মিল এন্ট্রি
            </span>
            <Link href="/" className="text-xs text-slate-400 hover:text-slate-200 transition">
              ← ড্যাশবোর্ডে ফিরে যান
            </Link>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-white mb-2">
            মেম্বারের মিল যোগ করুন
          </h1>
          <p className="text-sm text-slate-400 mb-6">
            বিদ্যমান মেম্বার সিলেক্ট করুন অথবা নতুন নাম লিখে মিল সংখ্যা ইনপুট দিন।
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
                মেম্বার নির্বাচন করুন বা নাম লিখুন <span className="text-blue-400">*</span>
              </label>
              
              {/* মেম্বার সিলেক্ট করার ড্রপডাউন (যদি মেম্বার থাকে) */}
              {members.length > 0 && (
                <div className="mb-2">
                  <select
                    onChange={(e) => {
                      if (e.target.value) setName(e.target.value);
                    }}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-800 border border-white/10 text-white focus:outline-none focus:border-blue-400 text-sm"
                  >
                    <option value="">-- তালিকা থেকে মেম্বার বেছে নিন --</option>
                    {members.map((m) => (
                      <option key={m.id} value={m.name}>
                        {m.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="অথবা এখানে মেম্বারের নাম লিখুন"
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">
                  দুপুরের মিল (Lunch)
                </label>
                <input
                  type="number"
                  step="0.5"
                  min="0"
                  value={lunch}
                  onChange={(e) => setLunch(e.target.value)}
                  placeholder="যেমন: ১ বা ০.৫"
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">
                  রাতের মিল (Dinner)
                </label>
                <input
                  type="number"
                  step="0.5"
                  min="0"
                  value={dinner}
                  onChange={(e) => setDinner(e.target.value)}
                  placeholder="যেমন: ১ বা ০.৫"
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">
                তারিখ <span className="text-blue-400">*</span>
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition [color-scheme:dark]"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3.5 px-4 rounded-xl font-bold text-white bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 shadow-lg shadow-blue-500/25 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.01]"
            >
              {loading ? 'সংরক্ষণ হচ্ছে...' : 'মিল সেভ করুন'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
