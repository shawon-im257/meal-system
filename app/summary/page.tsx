'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface MemberSummary {
  id: number;
  name: string;
  email?: string;
  meals: number;
  deposit: number;
  expense: number;
  totalContribution?: number;
  cost: number;
  balance: number;
}

export default function SummaryPage() {
  // চলতি মাস ডিফল্ট হিসেবে রাখা (YYYY-MM)
  const [selectedMonth, setSelectedMonth] = useState('');
  const [data, setData] = useState<{
    selectedMonth: string;
    totalMeals: number;
    totalExpenses: number;
    mealRate: string;
    members: MemberSummary[];
  } | null>(null);
  const [loading, setLoading] = useState(true);

  // পেজ লোড হলে ক্লায়েন্টে আজকের মাস সেট করা
  useEffect(() => {
    const currentMonth = new Date().toISOString().slice(0, 7);
    setSelectedMonth(currentMonth);
  }, []);

  // নির্বাচিত মাস পরিবর্তন হলে ডাটা ফেচ করা
  useEffect(() => {
    if (!selectedMonth) return;

    async function fetchSummary() {
      try {
        setLoading(true);
        const res = await fetch(`/api/summary?month=${selectedMonth}`);
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
  }, [selectedMonth]);

  // মাসের সুন্দর নাম দেখানো (যেমন: নভেম্বর ২০২৬)
  const formatMonthTitle = (monthStr: string) => {
    if (!monthStr) return '';
    const [year, month] = monthStr.split('-');
    const date = new Date(Number(year), Number(month) - 1);
    return date.toLocaleString('bn-BD', { month: 'long', year: 'numeric' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-slate-100 p-4 sm:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header with Month Selector */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 border border-purple-400/30 font-medium">
                📑 মেস ব্যালান্স শিট
              </span>
              <span className="text-xs px-2.5 py-0.5 rounded-md bg-white/10 text-slate-300 font-mono">
                {formatMonthTitle(selectedMonth)}
              </span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-white mt-2">
              মেম্বারদের মাসিক হিসাব
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              মাস নির্বাচন করে সেই মাসের মোট মিল, মোট খরচ এবং মেম্বারদের ব্যালান্স দেখুন।
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Month Picker Input */}
            <div className="flex items-center gap-2 bg-white/5 border border-white/10 px-3 py-1.5 rounded-xl backdrop-blur-md">
              <span className="text-xs text-slate-400">📅 মাস:</span>
              <input
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="bg-transparent text-white text-sm focus:outline-none [color-scheme:dark] cursor-pointer font-medium"
              />
            </div>

            <button
              onClick={() => window.print()}
              className="px-4 py-2.5 rounded-xl bg-indigo-600/30 border border-indigo-400/40 text-indigo-200 hover:bg-indigo-600/50 font-medium text-sm transition flex items-center gap-1.5 shadow-md"
            >
              🖨️ প্রিন্ট / PDF
            </button>

            <Link
              href="/add-deposit"
              className="px-4 py-2.5 rounded-xl bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 hover:bg-emerald-500/30 font-medium text-sm transition"
            >
              + জমা
            </Link>

            <Link
              href="/"
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-slate-200 border border-white/10 font-medium text-sm transition"
            >
              ড্যাশবোর্ড
            </Link>
          </div>
        </div>

        {/* Top Summary Metric Cards */}
        {data && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <div className="p-5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
              <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">
                এই মাসের মোট মিল
              </span>
              <p className="text-3xl font-extrabold text-white mt-1">{data.totalMeals} টি</p>
            </div>
            <div className="p-5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
              <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">
                এই মাসের মোট বাজার খরচ
              </span>
              <p className="text-3xl font-extrabold text-amber-400 mt-1">
                ৳ {Number(data.totalExpenses).toLocaleString('bn-BD')}
              </p>
            </div>
            <div className="p-5 rounded-2xl bg-gradient-to-br from-purple-500/20 to-pink-500/10 border border-purple-400/30 backdrop-blur-md">
              <span className="text-xs text-purple-300 uppercase tracking-wider font-semibold">
                এই মাসের মিল রেট
              </span>
              <p className="text-3xl font-extrabold text-purple-300 mt-1">৳ {data.mealRate}</p>
            </div>
          </div>
        )}

        {/* Table Container */}
        <div className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-3xl overflow-hidden shadow-2xl">
          {loading ? (
            <div className="p-16 text-center text-slate-400">হিসাব লোড হচ্ছে...</div>
          ) : !data || data.members.length === 0 ? (
            <div className="p-16 text-center text-slate-400">
              কোনো মেম্বারের ডাটা পাওয়া যায়নি।
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-white/5 border-b border-white/10 text-xs uppercase tracking-wider text-slate-300 font-semibold">
                  <tr>
                    <th className="py-4 px-6">মেম্বার</th>
                    <th className="py-4 px-6 text-center">মিলের সংখ্যা</th>
                    <th className="py-4 px-6 text-right">বাজার খরচ (৳)</th>
                    <th className="py-4 px-6 text-right">ক্যাশ জমা (৳)</th>
                    <th className="py-4 px-6 text-right">মোট ক্রেডিট (৳)</th>
                    <th className="py-4 px-6 text-right">মিলের খরচ (৳)</th>
                    <th className="py-4 px-6 text-right">ব্যালান্স অবস্থা</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {data.members.map((m) => {
                    const isDue = m.balance < 0;
                    const totalCred = (m.deposit || 0) + (m.expense || 0);
                    return (
                      <tr key={m.id} className="hover:bg-white/[0.03] transition">
                        <td className="py-4 px-6 font-semibold text-white flex items-center gap-3">
                          <span className="w-8 h-8 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30 flex items-center justify-center text-xs font-bold">
                            {m.name.charAt(0).toUpperCase()}
                          </span>
                          <div>
                            <div>{m.name}</div>
                            <div className="text-[11px] text-slate-400 font-normal">{m.email}</div>
                          </div>
                        </td>
                        <td className="py-4 px-6 text-center font-mono text-slate-300 font-bold">
                          {m.meals}
                        </td>
                        <td className="py-4 px-6 text-right font-mono text-amber-400 font-semibold">
                          ৳ {(m.expense || 0).toFixed(2)}
                        </td>
                        <td className="py-4 px-6 text-right font-mono text-emerald-400 font-semibold">
                          ৳ {m.deposit.toFixed(2)}
                        </td>
                        <td className="py-4 px-6 text-right font-mono text-blue-300 font-bold">
                          ৳ {totalCred.toFixed(2)}
                        </td>
                        <td className="py-4 px-6 text-right font-mono text-slate-300">
                          ৳ {m.cost.toFixed(2)}
                        </td>
                        <td className="py-4 px-6 text-right font-medium">
                          <span
                            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
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
