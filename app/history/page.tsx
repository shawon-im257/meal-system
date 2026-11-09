'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Member {
  id: number;
  name: string;
}

interface DateRow {
  date: string;
  memberMeals: {
    [memberName: string]: {
      id: number;
      lunch: number;
      dinner: number;
      total: number;
    };
  };
  dayTotal: number;
  entries: any[];
}

interface ExpenseRecord {
  id: number;
  member_name: string;
  amount: number;
  description: string;
  date: string;
}

interface EditState {
  id: number;
  memberName: string;
  date: string;
  lunch: number;
  dinner: number;
}

export default function HistoryPage() {
  const [activeTab, setActiveTab] = useState<'matrix' | 'expenses'>('matrix');
  const [members, setMembers] = useState<Member[]>([]);
  const [groupedDates, setGroupedDates] = useState<DateRow[]>([]);
  const [expenses, setExpenses] = useState<ExpenseRecord[]>([]);
  const [loading, setLoading] = useState(true);

  // এডিট মডালের স্টেট
  const [editTarget, setEditTarget] = useState<EditState | null>(null);
  const [editLunch, setEditLunch] = useState<number | string>('');
  const [editDinner, setEditDinner] = useState<number | string>('');
  const [editPin, setEditPin] = useState('');
  const [updating, setUpdating] = useState(false);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/history');
      if (res.ok) {
        const data = await res.json();
        setMembers(data.members || []);
        setGroupedDates(data.groupedDates || []);
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

  const openEditModal = (id: number, memberName: string, date: string, lunch: number, dinner: number) => {
    setEditTarget({ id, memberName, date, lunch, dinner });
    setEditLunch(lunch);
    setEditDinner(dinner);
    setEditPin('1234');
  };

  const handleUpdateMeal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editTarget) return;

    setUpdating(true);
    try {
      const res = await fetch('/api/history/edit-meal', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editTarget.id,
          lunch: Number(editLunch) || 0,
          dinner: Number(editDinner) || 0,
          pin: editPin,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        alert('মিল সফলভাবে আপডেট করা হয়েছে!');
        setEditTarget(null);
        fetchHistory();
      } else {
        alert(data.message || 'আপডেট করতে সমস্যা হয়েছে!');
      }
    } catch (err) {
      alert('সার্ভারে সমস্যা হয়েছে!');
    } finally {
      setUpdating(false);
    }
  };

  const handleDeleteMeal = async (mealId: number, memberName: string, date: string) => {
    const enteredPin = prompt(`"${date}" তারিখে "${memberName}"-এর মিল মুছে ফেলার জন্য পিন দিন (1234):`);
    if (enteredPin !== '1234') {
      alert('ভুল পিন!');
      return;
    }

    try {
      const res = await fetch(`/api/history?type=meal&id=${mealId}`, { method: 'DELETE' });
      if (res.ok) {
        alert('মিল মুছে ফেলা হয়েছে!');
        fetchHistory();
      } else {
        alert('মুছতে সমস্যা হয়েছে!');
      }
    } catch (err) {
      alert('সার্ভারে সমস্যা হয়েছে!');
    }
  };

  const handleDeleteExpense = async (id: number) => {
    const enteredPin = prompt('খরচ মোছার জন্য পিন দিন (1234):');
    if (enteredPin !== '1234') {
      alert('ভুল পিন!');
      return;
    }

    try {
      const res = await fetch(`/api/history?type=expense&id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        setExpenses(expenses.filter((e) => e.id !== id));
        alert('খরচ মুছে ফেলা হয়েছে!');
      } else {
        alert('মুছতে সমস্যা হয়েছে!');
      }
    } catch (err) {
      alert('সার্ভারে সমস্যা হয়েছে!');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-slate-100 p-4 sm:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <span className="text-xs px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-400/30 font-medium">
              📊 তারিখভিত্তিক মিল ও খরচ লগ
            </span>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-white mt-2">
              দৈনিক মিল ও খরচের রেজিস্টার
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              তারিখ অনুযায়ী প্রতিটি মেম্বারের মিলের হিসাব (Row: তারিখ, Column: মেম্বারের নাম)।
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
            onClick={() => setActiveTab('matrix')}
            className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition ${
              activeTab === 'matrix'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
                : 'bg-white/5 text-slate-400 hover:text-white border border-white/10'
            }`}
          >
            🍲 তারিখভিত্তিক মিল চার্ট ({groupedDates.length} দিন)
          </button>
          <button
            onClick={() => setActiveTab('expenses')}
            className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition ${
              activeTab === 'expenses'
                ? 'bg-amber-600 text-white shadow-lg shadow-amber-500/30'
                : 'bg-white/5 text-slate-400 hover:text-white border border-white/10'
            }`}
          >
            🛍️ বাজার খরচের লগ ({expenses.length})
          </button>
        </div>

        {/* Content Container */}
        <div className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-3xl overflow-hidden shadow-2xl">
          {loading ? (
            <div className="p-16 text-center text-slate-400">ডাটা লোড হচ্ছে...</div>
          ) : activeTab === 'matrix' ? (
            groupedDates.length === 0 ? (
              <div className="p-16 text-center text-slate-400">এখনো কোনো মিল এন্ট্রি করা হয়নি।</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-center text-sm border-collapse">
                  <thead className="bg-white/5 border-b border-white/10 text-xs uppercase tracking-wider text-slate-300 font-semibold">
                    <tr>
                      <th className="py-4 px-6 text-left border-r border-white/10 min-w-[140px] sticky left-0 bg-slate-900/95 z-20">
                        তারিখ (Date)
                      </th>
                      {members.map((m) => (
                        <th
                          key={m.id}
                          className="py-4 px-6 border-r border-white/5 min-w-[130px] font-bold text-blue-300"
                        >
                          <div className="flex flex-col items-center">
                            <span>{m.name}</span>
                            <span className="text-[10px] text-slate-400 font-normal">
                              দুপুর + রাত
                            </span>
                          </div>
                        </th>
                      ))}
                      <th className="py-4 px-6 font-bold text-emerald-400 border-l border-white/10 min-w-[120px] sticky right-0 bg-slate-900/95 z-20">
                        দিনের মোট
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-sm">
                    {groupedDates.map((row) => (
                      <tr key={row.date} className="hover:bg-white/[0.03] transition">
                        <td className="py-4 px-6 text-left font-mono font-semibold text-slate-200 border-r border-white/10 sticky left-0 bg-slate-900/95 z-10">
                          {row.date === '0000-00-00' ? 'অজানা তারিখ' : row.date}
                        </td>

                        {members.map((m) => {
                          const record = row.memberMeals[m.name];
                          return (
                            <td
                              key={m.id}
                              className={`py-3 px-4 border-r border-white/5 font-mono ${
                                record && record.total > 0
                                  ? 'bg-blue-500/10 text-white'
                                  : 'text-slate-600'
                              }`}
                            >
                              {record ? (
                                <div className="flex flex-col items-center group relative">
                                  <span className="font-extrabold text-blue-300 text-base">
                                    {record.total}
                                  </span>
                                  <span className="text-[10px] text-slate-400">
                                    (L: {record.lunch}, D: {record.dinner})
                                  </span>
                                  {/* Edit & Delete Actions */}
                                  <div className="opacity-0 group-hover:opacity-100 flex items-center gap-2 mt-1 transition">
                                    <button
                                      onClick={() =>
                                        openEditModal(
                                          record.id,
                                          m.name,
                                          row.date,
                                          record.lunch,
                                          record.dinner
                                        )
                                      }
                                      className="text-[10px] text-blue-400 hover:text-blue-300 underline"
                                    >
                                      এডিট
                                    </button>
                                    <span className="text-slate-600 text-[10px]">•</span>
                                    <button
                                      onClick={() => handleDeleteMeal(record.id, m.name, row.date)}
                                      className="text-[10px] text-rose-400 hover:text-rose-300 underline"
                                    >
                                      মুছুন
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <span>-</span>
                              )}
                            </td>
                          );
                        })}

                        <td className="py-4 px-6 font-mono font-extrabold text-emerald-400 text-base border-l border-white/10 sticky right-0 bg-slate-900/95 z-10">
                          {row.dayTotal}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          ) : expenses.length === 0 ? (
            <div className="p-16 text-center text-slate-400">এখনো কোনো বাজার খরচ রেকর্ড করা হয়নি।</div>
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
                          onClick={() => handleDeleteExpense(item.id)}
                          className="text-xs px-3 py-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 transition"
                        >
                          মুছুন
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

      {/* Edit Meal Modal */}
      {editTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-slate-900 border border-white/20 p-6 rounded-3xl shadow-2xl relative">
            <h3 className="text-lg font-bold text-white mb-1">
              ✏️ মিল আপডেট করুন
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              মেম্বার: <span className="text-blue-300 font-bold">{editTarget.memberName}</span> | তারিখ: <span className="font-mono text-slate-300">{editTarget.date}</span>
            </p>

            <form onSubmit={handleUpdateMeal} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    দুপুরের মিল (Lunch)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    value={editLunch}
                    onChange={(e) => setEditLunch(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-blue-400 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    রাতের মিল (Dinner)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    value={editDinner}
                    onChange={(e) => setEditDinner(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-blue-400 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  ম্যানেজার পিন (ডিফল্ট: 1234)
                </label>
                <input
                  type="password"
                  required
                  value={editPin}
                  onChange={(e) => setEditPin(e.target.value)}
                  placeholder="পিন লিখুন"
                  className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-blue-400 text-sm"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setEditTarget(null)}
                  className="flex-1 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-slate-300 text-xs font-semibold transition"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  disabled={updating}
                  className="flex-1 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition shadow-md shadow-blue-500/20 disabled:opacity-50"
                >
                  {updating ? 'আপডেট হচ্ছে...' : 'সংরক্ষণ করুন'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
