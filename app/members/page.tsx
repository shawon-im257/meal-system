'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Member {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  total_deposit: number;
  joined_date: string;
  total_meals: number;
}

export default function MembersPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [initialDeposit, setInitialDeposit] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchMembers = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/members');
      if (res.ok) {
        const data = await res.json();
        setMembers(data.members || []);
      }
    } catch (err) {
      console.error('Failed to load members', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage(null);

    try {
      const res = await fetch('/api/members', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          phone,
          initialDeposit: Number(initialDeposit) || 0,
        }),
      });
      const data = await res.json();

      if (res.ok) {
        setMessage({ type: 'success', text: data.message });
        setName('');
        setPhone('');
        setInitialDeposit('');
        fetchMembers();
      } else {
        setMessage({ type: 'error', text: data.message });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'সার্ভারে সমস্যা হয়েছে।' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number, memberName: string) => {
    if (!confirm(`আপনি কি নিশ্চিত যে "${memberName}"-কে মেম্বার তালিকা থেকে মুছে ফেলতে চান? তার সমস্ত মিল ও খরচের তথ্য মুছে যাবে!`)) return;

    try {
      const res = await fetch(`/api/members?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        setMembers(members.filter((m) => m.id !== id));
      } else {
        alert('মুছতে সমস্যা হয়েছে!');
      }
    } catch (err) {
      alert('সার্ভারে সমস্যা হয়েছে!');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-slate-100 p-4 sm:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <span className="text-xs px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30 font-medium">
              👥 মেম্বার ম্যানেজমেন্ট
            </span>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-white mt-2">
              মেসের সদস্যবৃন্দ
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              নতুন মেম্বার যুক্ত করুন অথবা মেম্বারদের তথ্য ও যোগাযোগ নম্বর পরিচালনা করুন।
            </p>
          </div>
          <Link
            href="/"
            className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-slate-200 border border-white/10 font-medium text-sm transition self-start sm:self-auto"
          >
            ← ড্যাশবোর্ডে ফিরে যান
          </Link>
        </div>

        {/* Add Member Card */}
        <div className="bg-white/5 border border-white/10 backdrop-blur-xl p-6 sm:p-8 rounded-3xl shadow-xl mb-10">
          <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            ➕ নতুন মেম্বার যুক্ত করুন
          </h2>

          {message && (
            <div
              className={`p-4 rounded-xl mb-4 text-sm font-medium ${
                message.type === 'success'
                  ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-300'
                  : 'bg-rose-500/20 border border-rose-500/40 text-rose-300'
              }`}
            >
              {message.text}
            </div>
          )}

          <form onSubmit={handleAddMember} className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="মেম্বারের নাম *"
                className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-blue-400 transition text-sm"
              />
            </div>
            <div>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="ফোন নম্বর (ঐচ্ছিক)"
                className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-blue-400 transition text-sm"
              />
            </div>
            <div>
              <input
                type="number"
                min="0"
                value={initialDeposit}
                onChange={(e) => setInitialDeposit(e.target.value)}
                placeholder="প্রাথমিক জমা টাকা (ঐচ্ছিক)"
                className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-blue-400 transition text-sm"
              />
            </div>
            <div>
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-2.5 px-4 rounded-xl font-bold text-white bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 shadow-md shadow-blue-500/20 transition disabled:opacity-50 text-sm"
              >
                {submitting ? 'যুক্ত হচ্ছে...' : 'মেম্বার যোগ করুন'}
              </button>
            </div>
          </form>
        </div>

        {/* Members Grid */}
        <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
          📋 বর্তমান সদস্য তালিকা ({members.length} জন)
        </h2>

        {loading ? (
          <div className="p-12 text-center text-slate-400">মেম্বার তালিকা লোড হচ্ছে...</div>
        ) : members.length === 0 ? (
          <div className="p-12 text-center text-slate-400 bg-white/5 rounded-3xl border border-white/10">
            এখনো কোনো মেম্বার যোগ করা হয়নি। উপরের ফর্ম ব্যবহার করে প্রথম মেম্বার যোগ করুন।
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {members.map((m) => (
              <div
                key={m.id}
                className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-blue-400/40 backdrop-blur-md transition-all duration-200 hover:-translate-y-1 shadow-lg"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-bold text-lg flex items-center justify-center shadow-md shadow-blue-500/20">
                      {m.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-bold text-white text-base leading-tight">{m.name}</h3>
                      <p className="text-xs text-slate-400 mt-0.5">{m.phone || 'ফোন নেই'}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDelete(m.id, m.name)}
                    title="মেম্বার মুছুন"
                    className="text-xs p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 transition"
                  >
                    🗑️
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-3 border-t border-white/10 text-xs">
                  <div>
                    <span className="text-slate-400 block">মোট মিল</span>
                    <span className="text-sm font-bold text-emerald-400 font-mono">
                      {m.total_meals} টি
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">মোট জমা</span>
                    <span className="text-sm font-bold text-amber-400 font-mono">
                      ৳ {Number(m.total_deposit).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

