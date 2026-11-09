'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface MemberMealRow {
  id: number;
  name: string;
  dailyMeals: { [day: number]: number };
  totalMeals: number;
}

interface SheetResponse {
  daysInMonth: number;
  totalMeals: number;
  totalExpenses: number;
  mealRate: string;
  matrix: MemberMealRow[];
}

export default function MealSheetPage() {
  const [selectedMonth, setSelectedMonth] = useState('');
  const [daysCount, setDaysCount] = useState(30);
  const [sheetData, setSheetData] = useState<MemberMealRow[]>([]);
  const [meta, setMeta] = useState<{ totalMeals: number; totalExpenses: number; mealRate: string }>({
    totalMeals: 0,
    totalExpenses: 0,
    mealRate: '0.00',
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const currentMonth = new Date().toISOString().slice(0, 7);
    setSelectedMonth(currentMonth);
  }, []);

  useEffect(() => {
    if (!selectedMonth) return;

    async function loadSheet() {
      try {
        setLoading(true);
        const res = await fetch(`/api/sheet?month=${selectedMonth}`);
        if (res.ok) {
          const json = await res.json();
          setDaysCount(json.daysInMonth || 30);
          setSheetData(json.matrix || []);
          setMeta({
            totalMeals: json.totalMeals || 0,
            totalExpenses: json.totalExpenses || 0,
            mealRate: json.mealRate || '0.00',
          });
        }
      } catch (err) {
        console.error('Failed to load meal sheet', err);
      } finally {
        setLoading(false);
      }
    }

    loadSheet();
  }, [selectedMonth]);

  const daysArray = Array.from({ length: daysCount }, (_, i) => i + 1);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-slate-100 p-4 sm:p-8">
      <div className="max-w-[96rem] mx-auto">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-400/30 font-medium">
                📅 ডিজিটাল মিল খাতা
              </span>
              <span className="text-xs px-2.5 py-0.5 rounded-md bg-white/10 text-slate-300 font-mono">
                {selectedMonth}
              </span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-white mt-2">
              মাসিক মিল ক্যালেন্ডার শিট
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              পুরো মাসের প্রতিদিনের মেম্বারভিত্তিক মিল চার্ট ও সর্বমোট হিসাব।
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Month Selector */}
            <div className="flex items-center gap-2 bg-white/5 border border-white/10 px-3 py-1.5 rounded-xl backdrop-blur-md">
              <span className="text-xs text-slate-400">মাস:</span>
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
              🖨️ প্রিন্ট শিট
            </button>

            <Link
              href="/"
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-slate-200 border border-white/10 font-medium text-sm transition"
            >
              ড্যাশবোর্ড
            </Link>
          </div>
        </div>

        {/* Quick Month Metrics Bar including Meal Rate */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="p-4 sm:p-5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">এই মাসের মোট মিল</span>
              <div className="text-2xl font-black text-white mt-0.5">{meta.totalMeals} টি</div>
            </div>
            <div className="text-2xl">🍲</div>
          </div>
          <div className="p-4 sm:p-5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">এই মাসের মোট বাজার</span>
              <div className="text-2xl font-black text-amber-400 mt-0.5">৳ {Number(meta.totalExpenses).toLocaleString('bn-BD')}</div>
            </div>
            <div className="text-2xl">💰</div>
          </div>
          <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-400/30 backdrop-blur-md flex items-center justify-between shadow-lg shadow-purple-500/10">
            <div>
              <span className="text-xs text-purple-300 font-bold uppercase tracking-wider">চলতি মাসের মিল রেট</span>
              <div className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-300 to-pink-300 mt-0.5">
                ৳ {meta.mealRate}
              </div>
            </div>
            <div className="text-3xl">⚡</div>
          </div>
        </div>

        {/* Matrix Table */}
        <div className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-3xl overflow-hidden shadow-2xl">
          {loading ? (
            <div className="p-16 text-center text-slate-400">ক্যালেন্ডার শিট লোড হচ্ছে...</div>
          ) : sheetData.length === 0 ? (
            <div className="p-16 text-center text-slate-400">কোনো মেম্বারের তথ্য পাওয়া যায়নি।</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-center text-xs border-collapse">
                <thead className="bg-white/5 border-b border-white/10 text-slate-300">
                  <tr>
                    <th className="py-3 px-4 text-left sticky left-0 bg-slate-900/90 backdrop-blur-md z-20 border-r border-white/10 min-w-[140px] font-bold">
                      মেম্বারের নাম
                    </th>
                    {daysArray.map((day) => (
                      <th
                        key={day}
                        className="py-2.5 px-2 font-mono text-[11px] border-r border-white/5 min-w-[34px] hover:bg-white/10 transition"
                      >
                        {day}
                      </th>
                    ))}
                    <th className="py-3 px-4 font-bold text-emerald-400 border-l border-white/10 min-w-[90px] sticky right-0 bg-slate-900/90 backdrop-blur-md z-20">
                      মোট মিল
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {sheetData.map((row) => (
                    <tr key={row.id} className="hover:bg-white/[0.03] transition">
                      {/* Member Name Column (Sticky) */}
                      <td className="py-3 px-4 text-left font-semibold text-white sticky left-0 bg-slate-900/90 backdrop-blur-md z-10 border-r border-white/10 flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30 flex items-center justify-center text-[10px] font-bold">
                          {row.name.charAt(0).toUpperCase()}
                        </span>
                        <span className="truncate max-w-[100px]">{row.name}</span>
                      </td>

                      {/* Daily Days 1 to 30/31 */}
                      {daysArray.map((day) => {
                        const count = row.dailyMeals[day] || 0;
                        return (
                          <td
                            key={day}
                            className={`py-2 px-1 font-mono text-center border-r border-white/5 ${
                              count > 0
                                ? 'text-blue-300 font-bold bg-blue-500/10'
                                : 'text-slate-600'
                            }`}
                          >
                            {count > 0 ? count : '-'}
                          </td>
                        );
                      })}

                      {/* Total Column (Sticky) */}
                      <td className="py-3 px-4 font-mono font-extrabold text-emerald-400 text-sm border-l border-white/10 sticky right-0 bg-slate-900/90 backdrop-blur-md z-10">
                        {row.totalMeals}
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

