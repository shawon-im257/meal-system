'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Member {
  id: number;
  name: string;
}

interface MealRow {
  user_id: number;
  name: string;
  lunch_count: number;
  dinner_count: number;
}

export default function BulkMealPage() {
  const [mealDate, setMealDate] = useState('');
  const [members, setMembers] = useState<Member[]>([]);
  const [mealRows, setMealRows] = useState<MealRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    // আজকের তারিখ ডিফল্ট
    const today = new Date().toISOString().split('T')[0];
    setMealDate(today);

    // মেম্বার লোড
    fetch('/api/members/list')
      .then((res) => res.json())
      .then((data) => {
        const memberList = Array.isArray(data) ? data : [];
        setMembers(memberList);
        setMealRows(
          memberList.map((m) => ({
            user_id: m.id,
            name: m.name,
            lunch_count: 1,
            dinner_count: 1,
          }))
        );
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const handleLunchChange = (userId: number, val: number) => {
    setMealRows((prev) =>
      prev.map((row) => (row.user_id === userId ? { ...row, lunch_count: val } : row))
    );
  };

  const handleDinnerChange = (userId: number, val: number) => {
    setMealRows((prev) =>
      prev.map((row) => (row.user_id === userId ? { ...row, dinner_count: val } : row))
    );
  };

  const setAllLunch = (val: number) => {
    setMealRows((prev) => prev.map((row) => ({ ...row, lunch_count: val })));
  };

  const setAllDinner = (val: number) => {
    setMealRows((prev) => prev.map((row) => ({ ...row, dinner_count: val })));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage(null);

    try {
      const res = await fetch('/api/bulk-meal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          meal_date: mealDate,
          entries: mealRows.map((r) => ({
            user_id: r.user_id,
            lunch_count: Number(r.lunch_count) || 0,
            dinner_count: Number(r.dinner_count) || 0,
          })),
        }),
      });

      const resData = await res.json();
      if (res.ok) {
        setMessage({ text: resData.message || 'সফলভাবে সবার মিল সংরক্ষিত হয়েছে!', type: 'success' });
      } else {
        setMessage({ text: resData.error || 'সংরক্ষণ ব্যর্থ হয়েছে', type: 'error' });
      }
    } catch (err: any) {
      setMessage({ text: 'সার্ভারে সংযোগ করতে সমস্যা হয়েছে', type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  const totalDayMeals = mealRows.reduce(
    (sum, r) => sum + (Number(r.lunch_count) || 0) + (Number(r.dinner_count) || 0),
    0
  );

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 py-10 px-4 sm:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-blue-400 uppercase tracking-wider mb-1">
              <span>⚡ দ্রুত এন্ট্রি</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
              একসাথে সবার মিল এন্ট্রি (Bulk Entry)
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              এক ক্লিকে সকল সদস্যের দুপুরের ও রাতের মিল এন্ট্রি করুন
            </p>
          </div>
          <Link
            href="/"
            className="px-4 py-2 text-xs font-semibold rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 transition"
          >
            ← ড্যাশবোর্ডে ফিরুন
          </Link>
        </div>

        {/* Message Alert */}
        {message && (
          <div
            className={`p-4 rounded-xl mb-6 text-sm font-medium border flex items-center justify-between ${
              message.type === 'success'
                ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                : 'bg-rose-500/10 text-rose-300 border-rose-500/30'
            }`}
          >
            <span>{message.text}</span>
            <button onClick={() => setMessage(null)} className="text-xs opacity-70 hover:opacity-100">
              ✕
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Controls Bar */}
          <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/10 backdrop-blur-md flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <label className="text-sm font-semibold text-slate-300">তারিখ:</label>
              <input
                type="date"
                required
                value={mealDate}
                onChange={(e) => setMealDate(e.target.value)}
                className="bg-[#0e1626] border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Quick action buttons */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs text-slate-400 font-medium">সবার জন্য:</span>
              <button
                type="button"
                onClick={() => {
                  setAllLunch(1);
                  setAllDinner(1);
                }}
                className="px-3 py-1.5 text-xs rounded-lg bg-blue-500/20 text-blue-300 hover:bg-blue-500/30 border border-blue-500/30 transition"
              >
                সবার ১+১
              </button>
              <button
                type="button"
                onClick={() => setAllLunch(1)}
                className="px-3 py-1.5 text-xs rounded-lg bg-white/5 text-slate-300 hover:bg-white/10 border border-white/10 transition"
              >
                সবার লাঞ্চ ১
              </button>
              <button
                type="button"
                onClick={() => setAllDinner(1)}
                className="px-3 py-1.5 text-xs rounded-lg bg-white/5 text-slate-300 hover:bg-white/10 border border-white/10 transition"
              >
                সবার ডিনার ১
              </button>
              <button
                type="button"
                onClick={() => {
                  setAllLunch(0);
                  setAllDinner(0);
                }}
                className="px-3 py-1.5 text-xs rounded-lg bg-rose-500/10 text-rose-300 hover:bg-rose-500/20 border border-rose-500/20 transition"
              >
                সব ০
              </button>
            </div>
          </div>

          {/* Members Table */}
          <div className="rounded-2xl bg-white/[0.03] border border-white/10 overflow-hidden shadow-2xl">
            {loading ? (
              <div className="p-12 text-center text-slate-400 text-sm">মেম্বারদের তালিকা লোড হচ্ছে...</div>
            ) : mealRows.length === 0 ? (
              <div className="p-12 text-center text-slate-400 text-sm">
                কোনো সদস্য পাওয়া যায়নি। প্রথমে <Link href="/members" className="text-blue-400 underline">সদস্য যোগ করুন</Link>।
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-white/[0.04] text-xs text-slate-400 uppercase tracking-wider border-b border-white/10">
                    <tr>
                      <th className="py-3.5 px-6">সদস্যের নাম</th>
                      <th className="py-3.5 px-4 text-center">দুপুর (Lunch)</th>
                      <th className="py-3.5 px-4 text-center">রাত (Dinner)</th>
                      <th className="py-3.5 px-6 text-right">মোট মিল</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {mealRows.map((row) => (
                      <tr key={row.user_id} className="hover:bg-white/[0.02] transition">
                        <td className="py-3.5 px-6 font-semibold text-white flex items-center gap-3">
                          <span className="w-8 h-8 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/20 flex items-center justify-center text-xs font-bold">
                            {row.name.charAt(0).toUpperCase()}
                          </span>
                          <span>{row.name}</span>
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <input
                            type="number"
                            min="0"
                            step="0.5"
                            value={row.lunch_count}
                            onChange={(e) => handleLunchChange(row.user_id, parseFloat(e.target.value) || 0)}
                            className="w-20 text-center bg-[#0e1626] border border-white/10 rounded-lg py-1.5 text-white font-mono focus:outline-none focus:border-blue-400"
                          />
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <input
                            type="number"
                            min="0"
                            step="0.5"
                            value={row.dinner_count}
                            onChange={(e) => handleDinnerChange(row.user_id, parseFloat(e.target.value) || 0)}
                            className="w-20 text-center bg-[#0e1626] border border-white/10 rounded-lg py-1.5 text-white font-mono focus:outline-none focus:border-blue-400"
                          />
                        </td>
                        <td className="py-3.5 px-6 text-right font-mono font-bold text-blue-400">
                          {((Number(row.lunch_count) || 0) + (Number(row.dinner_count) || 0)).toFixed(1)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-white/[0.04] border-t border-white/10 font-bold">
                    <tr>
                      <td className="py-4 px-6 text-slate-300">আজকের সর্বমোট মিল:</td>
                      <td colSpan={2}></td>
                      <td className="py-4 px-6 text-right font-mono text-emerald-400 text-base">
                        {totalDayMeals.toFixed(1)} টি
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}
          </div>

          {/* Submit Button */}
          <div className="flex justify-end gap-4">
            <button
              type="submit"
              disabled={submitting || mealRows.length === 0}
              className="px-8 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-sm shadow-lg shadow-blue-500/20 disabled:opacity-50 transition"
            >
              {submitting ? 'সংরক্ষণ হচ্ছে...' : 'এক ক্লিকে সবার মিল সংরক্ষণ করুন (Save All)'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

