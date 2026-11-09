'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface MemberSummary {
  id: number;
  name: string;
  meals: number;
  deposit: number;
  cost: number;
  balance: number;
}

export default function SummaryPage() {
  const [data, setData] = useState<{
    totalMeals: number;
    totalExpenses: number;
    mealRate: string;
    members: MemberSummary[];
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSummary() {
      try {
        const res = await fetch('/api/summary');
        if (res.ok) {
          const json = await res.json();
          setData(json);
        }
      } catch (err) {
        console.error('Failed to load summary', err);
      } finally {
        setLoading(false);
      }
    }
    fetchSummary();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-slate-100 p-4 sm:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <span className="text-xs px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 border border-purple-400/30 font-medium">
              📑 মেস ব্যালান্স শিট
            </span>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-white mt-2">
              মেম্বারদের চূড়ান্ত হিসাব
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              বর্তমান মিল রেট অনুযায়ী কে কত টাকা ফেরত পাবে বা কার কত টাকা বকেয়া আছে।
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => window.print()}
              className="px-4 py-2.5 rounded-xl bg-indigo-600/30 border border-indigo-400/40 text-indigo-200 hover:bg-indigo-600/50 font-medium text-sm transition flex items-center gap-1.5"
            >
              🖨️ প্রিন্ট / PDF
            </button>
            <Link
              href="/add-deposit"
              className="px-4 py-2.5 rounded-xl bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 hover:bg-emerald-500/30 font-medium text-sm transition"
            >
              + টাকা জমা দিন
            </Link>
            <Link
              href="/"
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-slate-200 border border-white/10 font-medium text-sm transition"
            >
              ড্যাশবোর্ড
            </Link>
          </div>
        </div>

        {/* Top Summary Chips */}
        {data && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
              <span className="text-xs text-slate-400">সর্বমোট মিল</span>
              <p className="text-2xl font-bold text-white mt-0.5">{data.totalMeals} টি</p>
            </div>
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
              <span className="text-xs text-slate-400">সর্বমোট খরচ</span>
              <p className="text-2xl font-bold text-amber-400 mt-0.5">৳ {Number(data.totalExpenses).toLocaleString('bn-BD')}</p>
            </div>
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
              <span className="text-xs text-purple-300">বর্তমান মিল রেট</span>
              <p className="text-2xl font-bold text-purple-400 mt-0.5">৳ {data.mealRate}</p>
            </div>
          </div>
        )}

        {/* Table Container */}
        <div className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-3xl overflow-hidden shadow-2xl">
          {loading ? (
            <div className="p-12 text-center text-slate-400">হিসাব লোড হচ্ছে...</div>
          ) : !data || data.members.length === 0 ? (
            <div className="p-12 text-center text-slate-400">
              কোনো মেম্বারের ডাটা পাওয়া যায়নি। আগে মিল অথবা জমা এন্ট্রি করুন।
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-white/5 border-b border-white/10 text-xs uppercase tracking-wider text-slate-300 font-semibold">
                  <tr>
                    <th className="py-4 px-6">মেম্বারের নাম</th>
                    <th className="py-4 px-6 text-center">মোট মিল</th>
                    <th className="py-4 px-6 text-right">জমা (৳)</th>
                    <th className="py-4 px-6 text-right">মিল খরচ (৳)</th>
                    <th className="py-4 px-6 text-right">ব্যালান্স অবস্থা</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {data.members.map((m) => {
                    const isDue = m.balance < 0;
                    return (
                      <tr key={m.id} className="hover:bg-white/[0.03] transition">
                        <td className="py-4 px-6 font-semibold text-white flex items-center gap-2">
                          <span className="w-8 h-8 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30 flex items-center justify-center text-xs">
                            {m.name.charAt(0).toUpperCase()}
                          </span>
                          {m.name}
                        </td>
                        <td className="py-4 px-6 text-center font-mono text-slate-300">
                          {m.meals}
                        </td>
                        <td className="py-4 px-6 text-right font-mono text-emerald-400">
                          ৳ {m.deposit.toFixed(2)}
                        </td>
                        <td className="py-4 px-6 text-right font-mono text-slate-300">
                          ৳ {m.cost.toFixed(2)}
                        </td>
                        <td className="py-4 px-6 text-right font-medium">
                          <span
                            className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                              isDue
                                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                                : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            }`}
                          >
                            {isDue
                              ? `বকেয়া: ৳ ${Math.abs(m.balance)}`
                              : `ফেরত পাবে: ৳ ${m.balance}`}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

