'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface CategoryCost {
  category: string;
  total: number;
}

interface MemberExpense {
  id: number;
  name: string;
  totalExpense: number;
  expenseCount: number;
}

interface DashboardStats {
  totalMembers: number;
  totalMeals: number;
  totalExpenses: number;
  mealRate: string;
  categoryBreakdown?: CategoryCost[];
  memberExpenses?: MemberExpense[];
}

export default function HomePage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalMembers: 0,
    totalMeals: 0,
    totalExpenses: 0,
    mealRate: '0.00',
    categoryBreakdown: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch('/api/dashboard');
        if (res.ok) {
          const data = await res.json();
          setStats(data);
        }
      } catch (err) {
        console.error('Failed to load dashboard stats', err);
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-slate-100 p-4 sm:p-8">
      {/* Top Hero Section */}
      <div className="max-w-6xl mx-auto mb-10">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-600/30 via-purple-600/20 to-pink-600/30 backdrop-blur-xl border border-white/10 p-8 sm:p-12 shadow-2xl">
          <div className="relative z-10 max-w-2xl">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-300 border border-blue-400/30 mb-4">
              ✨ স্মার্ট মেস ম্যানেজমেন্ট ড্যাশবোর্ড
            </span>
            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
              খাবার ও খরচের হিসাব, <br className="hidden sm:inline" />
              এখন আরও সহজ ও নির্ভুল
            </h1>
            <p className="mt-4 text-slate-300 text-base sm:text-lg">
              দৈনিক মিল এন্ট্রি, বাজার খরচ এবং অটোমেটিক মিল রেট হিসাবের সমন্বিত সমাধান। 
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                href="/add-meal"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold shadow-lg shadow-blue-500/30 hover:scale-105 transition-all duration-200"
              >
                ➕ মিল এন্ট্রি করুন
              </Link>
              <Link
                href="/add-expense"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white/10 hover:bg-white/15 text-white font-semibold backdrop-blur-md border border-white/10 hover:scale-105 transition-all duration-200"
              >
                🛒 বাজার খরচ যোগ করুন
              </Link>
            </div>
          </div>
          {/* Background Decorative Circles */}
          <div className="absolute -right-16 -top-16 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -right-8 -bottom-16 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />
        </div>
      </div>

      {/* Stats Cards Section */}
      <div className="max-w-6xl mx-auto mb-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl sm:text-2xl font-bold tracking-wide flex items-center gap-2">
            📊 বর্তমান পরিসংখ্যান
          </h2>
          <span className="text-xs text-slate-400">রিয়েল-টাইম ক্যালকুলেশন</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Card 1: Total Members */}
          <div className="group relative p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-blue-500/50 backdrop-blur-lg transition-all duration-300 hover:-translate-y-1 shadow-lg hover:shadow-blue-500/10">
            <div className="flex justify-between items-start mb-4">
              <div className="w-12 h-12 rounded-xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-2xl">
                👥
              </div>
              <span className="text-xs px-2 py-1 rounded bg-blue-500/10 text-blue-300 font-mono">Users</span>
            </div>
            <div className="text-sm font-medium text-slate-400">মোট সদস্য</div>
            <div className="text-3xl font-extrabold mt-1 text-white">
              {loading ? '...' : `${stats.totalMembers} জন`}
            </div>
          </div>

          {/* Card 2: Total Meals */}
          <div className="group relative p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-emerald-500/50 backdrop-blur-lg transition-all duration-300 hover:-translate-y-1 shadow-lg hover:shadow-emerald-500/10">
            <div className="flex justify-between items-start mb-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-2xl">
                🍲
              </div>
              <span className="text-xs px-2 py-1 rounded bg-emerald-500/10 text-emerald-300 font-mono">Meals</span>
            </div>
            <div className="text-sm font-medium text-slate-400">মোট গৃহীত মিল</div>
            <div className="text-3xl font-extrabold mt-1 text-white">
              {loading ? '...' : `${stats.totalMeals} টি`}
            </div>
          </div>

          {/* Card 3: Total Expenses */}
          <div className="group relative p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-amber-500/50 backdrop-blur-lg transition-all duration-300 hover:-translate-y-1 shadow-lg hover:shadow-amber-500/10">
            <div className="flex justify-between items-start mb-4">
              <div className="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-400/30 flex items-center justify-center text-2xl">
                💰
              </div>
              <span className="text-xs px-2 py-1 rounded bg-amber-500/10 text-amber-300 font-mono">Expenses</span>
            </div>
            <div className="text-sm font-medium text-slate-400">মোট বাজার খরচ</div>
            <div className="text-3xl font-extrabold mt-1 text-white">
              {loading ? '...' : `৳ ${Number(stats.totalExpenses).toLocaleString('bn-BD')}`}
            </div>
          </div>

          {/* Card 4: Current Meal Rate */}
          <div className="group relative p-6 rounded-2xl bg-gradient-to-br from-indigo-500/20 via-purple-500/10 to-pink-500/20 border border-purple-400/30 hover:border-purple-400 backdrop-blur-lg transition-all duration-300 hover:-translate-y-1 shadow-lg hover:shadow-purple-500/20">
            <div className="flex justify-between items-start mb-4">
              <div className="w-12 h-12 rounded-xl bg-purple-500/30 border border-purple-400/40 flex items-center justify-center text-2xl">
                ⚡
              </div>
              <span className="text-xs px-2 py-1 rounded bg-purple-500/20 text-purple-200 font-mono">Rate</span>
            </div>
            <div className="text-sm font-medium text-purple-200">বর্তমান মিল রেট</div>
            <div className="text-3xl font-black mt-1 text-transparent bg-clip-text bg-gradient-to-r from-purple-300 to-pink-300">
              {loading ? '...' : `৳ ${stats.mealRate}`}
            </div>
          </div>
        </div>
      </div>

      {/* Expense Category Breakdown Section */}
      {stats.categoryBreakdown && stats.categoryBreakdown.length > 0 && (
        <div className="max-w-6xl mx-auto mb-8">
          <div className="p-6 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-xl">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              🏷️ বাজারের খাত অনুযায়ী খরচ বণ্টন (Category Breakdown)
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {stats.categoryBreakdown.map((cat, idx) => {
                const percentage = stats.totalExpenses > 0 ? ((cat.total / stats.totalExpenses) * 100).toFixed(1) : '0';
                return (
                  <div key={idx} className="p-4 rounded-xl bg-white/5 border border-white/5">
                    <div className="flex justify-between text-xs text-slate-400 mb-1">
                      <span>{cat.category}</span>
                      <span className="font-mono text-amber-300">{percentage}%</span>
                    </div>
                    <div className="text-lg font-bold text-white font-mono">
                      ৳ {cat.total.toLocaleString('bn-BD')}
                    </div>
                    <div className="w-full bg-white/10 h-1.5 rounded-full mt-2 overflow-hidden">
                      <div
                        className="bg-amber-400 h-full rounded-full transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Member-wise Expense List (কে কত টাকা বাজার করেছে) */}
      {stats.memberExpenses && stats.memberExpenses.length > 0 && (
        <div className="max-w-6xl mx-auto mb-12">
          <div className="p-6 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                🛒 কে কত টাকা বাজার করেছে (সদস্যভিত্তিক বাজারের হিসাব)
              </h3>
              <Link href="/add-expense" className="text-xs text-amber-400 hover:underline">
                + নতুন বাজার যোগ করুন
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {stats.memberExpenses.map((m) => (
                <div
                  key={m.id}
                  className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-between hover:bg-white/[0.06] transition"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/30 flex items-center justify-center font-bold text-sm">
                      {m.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="font-semibold text-white">{m.name}</div>
                      <div className="text-xs text-slate-400">মোট {m.expenseCount} বার বাজার করেছে</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-base font-bold text-amber-400 font-mono">
                      ৳ {m.totalExpense.toLocaleString('bn-BD')}
                    </div>
                    <div className="text-[10px] text-slate-500 uppercase tracking-wider">মোট খরচ</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Quick Navigation Cards */}
      <div className="max-w-6xl mx-auto">
        <h2 className="text-xl sm:text-2xl font-bold tracking-wide mb-6 flex items-center gap-2">
          ⚡ কুইক অ্যাকশন
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <Link
            href="/sheet"
            className="group block p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-teal-400/50 hover:bg-white/[0.08] transition duration-200"
          >
            <div className="text-3xl mb-3">📅</div>
            <h3 className="text-lg font-semibold group-hover:text-teal-400 transition">
              ডিজিটাল মিল খাতা
            </h3>
            <p className="text-sm text-slate-400 mt-1">
              ১ থেকে ৩১ তারিখ পর্যন্ত সম্পূর্ণ মাসের দৈনিক মিলের গ্রিড শিট দেখুন।
            </p>
          </Link>

          <Link
            href="/add-meal"
            className="group block p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-blue-400/50 hover:bg-white/[0.08] transition duration-200"
          >
            <div className="text-3xl mb-3">📝</div>
            <h3 className="text-lg font-semibold group-hover:text-blue-400 transition">
              দৈনিক মিল এন্ট্রি
            </h3>
            <p className="text-sm text-slate-400 mt-1">
              তারিখ অনুযায়ী মেম্বারের দুপুরের বা রাতের মিল যোগ করুন বা আপডেট করুন।
            </p>
          </Link>

          <Link
            href="/add-expense"
            className="group block p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-amber-400/50 hover:bg-white/[0.08] transition duration-200"
          >
            <div className="text-3xl mb-3">🛍️</div>
            <h3 className="text-lg font-semibold group-hover:text-amber-400 transition">
              বাজার খরচের এন্ট্রি
            </h3>
            <p className="text-sm text-slate-400 mt-1">
              আজকের মেসের বাজার কত টাকা হলো এবং কোন খাতে খরচ হলো তা রেকর্ড রাখুন।
            </p>
          </Link>

          <Link
            href="/summary"
            className="group block p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-purple-400/50 hover:bg-white/[0.08] transition duration-200"
          >
            <div className="text-3xl mb-3">📑</div>
            <h3 className="text-lg font-semibold group-hover:text-purple-400 transition">
              মাসিক মেস হিসাব
            </h3>
            <p className="text-sm text-slate-400 mt-1">
              কে কত টাকা জমা দিয়েছে এবং কার কত টাকা ফেরত পাবে বা বকেয়া আছে তা দেখুন।
            </p>
          </Link>
        </div>
      </div>
    </div>
  );
}
