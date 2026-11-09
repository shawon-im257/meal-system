'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface MealRecord {
  id: number;
  member_name: string;
  lunch_count: number;
  dinner_count: number;
  date: string;
}

interface ExpenseRecord {
  id: number;
  member_name: string;
  amount: number;
  description: string;
  date: string;
}

export default function HistoryPage() {
  const [activeTab, setActiveTab] = useState<'meals' | 'expenses'>('meals');
  const [meals, setMeals] = useState<MealRecord[]>([]);
  const [expenses, setExpenses] = useState<ExpenseRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/history');
      if (res.ok) {
        const data = await res.json();
        setMeals(data.recentMeals || []);
        setExpenses(data.recentExpenses || []);
      }
    } catch (err) {
      console.error('Failed to load history', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleDelete = async (type: 'meal' | 'expense', id: number) => {
    if (!confirm('আপনি কি নিশ্চিত যে এই এন্ট্রিটি মুছে ফেলতে চান?')) return;

    setDeletingId(id);
    try {
      const res = await fetch(`/api/history?type=${type}&id=${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        if (type === 'meal') {
          setMeals(meals.filter((m) => m.id !== id));
        } else {
          setExpenses(expenses.filter((e) => e.id !== id));
        }
      } else {
        alert('মুছতে সমস্যা হয়েছে!');
      }
    } catch (err) {
      alert('সার্ভারে সমস্যা হয়েছে!');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-slate-100 p-4 sm:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <span className="text-xs px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-400/30 font-medium">
              🕒 দৈনিক লগ ও হিস্ট্রি
            </span>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-white mt-2">
              সাম্প্রতিক অ্যাক্টিভিটি
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              দৈনিক মিল এন্ট্রি ও বাজার খরচের হিসাব নিরীক্ষণ এবং ব্যবস্থাপনা করুন।
            </p>
          </div>
          <Link
            href="/"
            className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-slate-200 border border-white/10 font-medium text-sm transition self-start sm:self-auto"
          >
            ← ড্যাশবোর্ডে ফিরে যান
          </Link>
        </div>

        {/* Tab Controls */}
        <div className="flex gap-3 mb-6">
          <button
            onClick={() => setActiveTab('meals')}
            className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition ${
              activeTab === 'meals'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
                : 'bg-white/5 text-slate-400 hover:text-white border border-white/10'
            }`}
          >
            🍲 সাম্প্রতিক মিলসমূহ ({meals.length})
          </button>
          <button
            onClick={() => setActiveTab('expenses')}
            className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition ${
              activeTab === 'expenses'
                ? 'bg-amber-600 text-white shadow-lg shadow-amber-500/30'
                : 'bg-white/5 text-slate-400 hover:text-white border border-white/10'
            }`}
          >
            🛍️ সাম্প্রতিক বাজার খরচ ({expenses.length})
          </button>
        </div>

        {/* Content Container */}
        <div className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-3xl overflow-hidden shadow-2xl">
          {loading ? (
            <div className="p-12 text-center text-slate-400">হিস্ট্রি লোড হচ্ছে...</div>
          ) : activeTab === 'meals' ? (
            meals.length === 0 ? (
              <div className="p-12 text-center text-slate-400">এখনো কোনো মিল রেকর্ড করা হয়নি।</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-white/5 border-b border-white/10 text-xs uppercase tracking-wider text-slate-300 font-semibold">
                    <tr>
                      <th className="py-4 px-6">তারিখ</th>
                      <th className="py-4 px-6">মেম্বার</th>
                      <th className="py-4 px-6 text-center">দুপুর (Lunch)</th>
                      <th className="py-4 px-6 text-center">রাত (Dinner)</th>
                      <th className="py-4 px-6 text-center">মোট মিল</th>
                      <th className="py-4 px-6 text-right">অ্যাকশন</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {meals.map((item) => (
                      <tr key={item.id} className="hover:bg-white/[0.03] transition">
                        <td className="py-4 px-6 font-mono text-slate-300">{item.date}</td>
                        <td className="py-4 px-6 font-semibold text-white">{item.member_name}</td>
                        <td className="py-4 px-6 text-center font-mono text-blue-300">
                          {item.lunch_count}
                        </td>
                        <td className="py-4 px-6 text-center font-mono text-indigo-300">
                          {item.dinner_count}
                        </td>
                        <td className="py-4 px-6 text-center font-mono font-bold text-emerald-400">
                          {Number(item.lunch_count) + Number(item.dinner_count)}
                        </td>
                        <td className="py-4 px-6 text-right">
                          <button
                            onClick={() => handleDelete('meal', item.id)}
                            disabled={deletingId === item.id}
                            className="text-xs px-3 py-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 transition disabled:opacity-50"
                          >
                            {deletingId === item.id ? 'মুছছে...' : 'মুছুন'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          ) : expenses.length === 0 ? (
            <div className="p-12 text-center text-slate-400">এখনো কোনো বাজার খরচ রেকর্ড করা হয়নি।</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-white/5 border-b border-white/10 text-xs uppercase tracking-wider text-slate-300 font-semibold">
                  <tr>
                    <th className="py-4 px-6">তারিখ</th>
                    <th className="py-4 px-6">বাজারকারী</th>
                    <th className="py-4 px-6">বিবরণ</th>
                    <th className="py-4 px-6 text-right">টাকা (৳)</th>
                    <th className="py-4 px-6 text-right">অ্যাকশন</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {expenses.map((item) => (
                    <tr key={item.id} className="hover:bg-white/[0.03] transition">
                      <td className="py-4 px-6 font-mono text-slate-300">{item.date}</td>
                      <td className="py-4 px-6 font-semibold text-white">{item.member_name}</td>
                      <td className="py-4 px-6 text-slate-300 max-w-xs truncate">
                        {item.description || 'বাজার খরচ'}
                      </td>
                      <td className="py-4 px-6 text-right font-mono font-bold text-amber-400">
                        ৳ {Number(item.amount).toFixed(2)}
                      </td>
                      <td className="py-4 px-6 text-right">
                        <button
                          onClick={() => handleDelete('expense', item.id)}
                          disabled={deletingId === item.id}
                          className="text-xs px-3 py-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 transition disabled:opacity-50"
                        >
                          {deletingId === item.id ? 'মুছছে...' : 'মুছুন'}
                        </button>
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

