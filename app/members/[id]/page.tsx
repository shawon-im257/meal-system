'use client';

import { useEffect, useState, use } from 'react';
import Link from 'next/link';

interface MemberDetail {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  joined_date: string;
  total_deposit: number;
}

interface MemberStats {
  totalMeals: number;
  currentMealRate: string;
  totalCost: number;
  totalDeposit: number;
  balance: number;
}

interface MealItem {
  id: number;
  lunch_count: number;
  dinner_count: number;
  total_count: number;
  date: string;
}

export default function MemberProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const [data, setData] = useState<{
    member: MemberDetail;
    stats: MemberStats;
    meals: MealItem[];
    expenses: any[];
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProfile() {
      try {
        const res = await fetch(`/api/members/${resolvedParams.id}`);
        if (res.ok) {
          const json = await res.json();
          setData(json);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadProfile();
  }, [resolvedParams.id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center">
        <p className="text-slate-400">মেম্বার স্টেটমেন্ট লোড হচ্ছে...</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center gap-4">
        <p className="text-rose-400">মেম্বার তথ্য পাওয়া যায়নি।</p>
        <Link href="/members" className="text-blue-400 underline">
          মেম্বার তালিকায় ফিরে যান
        </Link>
      </div>
    );
  }

  const { member, stats, meals } = data;
  const isDue = stats.balance < 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-slate-100 p-4 sm:p-8">
      <div className="max-w-5xl mx-auto">
        {/* Navigation & Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Link href="/members" className="text-xs text-blue-400 hover:underline">
                ← সকল মেম্বার
              </Link>
              <span className="text-xs text-slate-500">•</span>
              <span className="text-xs text-slate-400">ব্যক্তিগত স্টেটমেন্ট</span>
            </div>
            <h1 className="text-3xl font-extrabold text-white flex items-center gap-3">
              <span className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center text-lg shadow-md">
                {member.name.charAt(0).toUpperCase()}
              </span>
              {member.name}
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              ফোন: {member.phone || 'যুক্ত করা হয়নি'} | যুক্ত হয়েছেন: {member.joined_date}
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => window.print()}
              className="px-4 py-2.5 rounded-xl bg-indigo-600/30 border border-indigo-400/40 text-indigo-200 hover:bg-indigo-600/50 text-xs font-semibold transition"
            >
              🖨️ রসিদ প্রিন্ট করুন
            </button>
            <Link
              href="/add-meal"
              className="px-4 py-2.5 rounded-xl bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition"
            >
              + মিল এন্ট্রি
            </Link>
          </div>
        </div>

        {/* 4 Financial Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="p-5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
            <span className="text-xs text-slate-400">গৃহীত মোট মিল</span>
            <p className="text-2xl font-extrabold text-white mt-1">{stats.totalMeals} টি</p>
            <span className="text-[11px] text-slate-500 mt-1 block">মিল রেট: ৳{stats.currentMealRate}</span>
          </div>

          <div className="p-5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
            <span className="text-xs text-slate-400">মিলের মোট খরচ</span>
            <p className="text-2xl font-extrabold text-slate-200 mt-1 font-mono">
              ৳ {stats.totalCost.toFixed(2)}
            </p>
            <span className="text-[11px] text-slate-500 mt-1 block">({stats.totalMeals} × ৳{stats.currentMealRate})</span>
          </div>

          <div className="p-5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
            <span className="text-xs text-slate-400">জমা দেওয়া অগ্রিম</span>
            <p className="text-2xl font-extrabold text-emerald-400 mt-1 font-mono">
              ৳ {stats.totalDeposit.toFixed(2)}
            </p>
            <span className="text-[11px] text-emerald-500/80 mt-1 block">ম্যানেজারের কাছে জমা</span>
          </div>

          <div
            className={`p-5 rounded-2xl border backdrop-blur-md ${
              isDue
                ? 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
            }`}
          >
            <span className="text-xs font-semibold uppercase tracking-wider block">
              {isDue ? 'বকেয়া দিতে হবে' : 'মেস থেকে ফেরত পাবে'}
            </span>
            <p className="text-2xl font-black mt-1 font-mono">
              ৳ {Math.abs(stats.balance).toFixed(2)}
            </p>
            <span className="text-[11px] opacity-80 mt-1 block">
              {isDue ? 'বকেয়া টাকা দ্রুত পরিশোধ করুন' : 'ব্যালান্স সন্তোষজনক'}
            </span>
          </div>
        </div>

        {/* Meal History Table */}
        <div className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-3xl overflow-hidden shadow-xl">
          <div className="p-5 border-b border-white/10 flex justify-between items-center">
            <h3 className="font-bold text-white text-sm sm:text-base flex items-center gap-2">
              <span>📋</span> মিলের বিস্তারিত লগ ({meals.length} দিন)
            </h3>
            <span className="text-xs text-slate-400">সর্বশেষ এন্ট্রিগুলো প্রথমে</span>
          </div>

          {meals.length === 0 ? (
            <div className="p-12 text-center text-slate-400 text-sm">
              এই সদস্যের কোনো মিল রেকর্ড এখনো নেই।
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-white/5 border-b border-white/10 text-slate-300">
                  <tr>
                    <th className="py-3 px-6">তারিখ</th>
                    <th className="py-3 px-6 text-center">দুপুর (Lunch)</th>
                    <th className="py-3 px-6 text-center">রাত (Dinner)</th>
                    <th className="py-3 px-6 text-right">মোট মিল</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 font-mono">
                  {meals.map((item) => (
                    <tr key={item.id} className="hover:bg-white/[0.03] transition">
                      <td className="py-3 px-6 text-slate-300">{item.date}</td>
                      <td className="py-3 px-6 text-center text-blue-300">{item.lunch_count}</td>
                      <td className="py-3 px-6 text-center text-indigo-300">{item.dinner_count}</td>
                      <td className="py-3 px-6 text-right font-bold text-emerald-400">
                        {item.total_count}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

