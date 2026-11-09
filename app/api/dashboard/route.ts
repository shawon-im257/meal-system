import { NextResponse } from 'next/server';
import pool from '../../database/db';

export async function GET() {
  try {
    // ১. মোট মেম্বার সংখ্যা
    const [userRows]: any = await pool.query('SELECT COUNT(*) AS totalMembers FROM Users');
    const totalMembers = userRows[0]?.totalMembers || 0;

    // ২. মোট মিল সংখ্যা (লাঞ্চ + ডিনার)
    const [mealRows]: any = await pool.query(
      'SELECT COALESCE(SUM(lunch_count + dinner_count), 0) AS totalMeals FROM Meals'
    );
    const totalMeals = Number(mealRows[0]?.totalMeals || 0);

    // ৩. মোট বাজার খরচ
    const [expenseRows]: any = await pool.query(
      'SELECT COALESCE(SUM(amount), 0) AS totalExpenses FROM Expenses'
    );
    const totalExpenses = Number(expenseRows[0]?.totalExpenses || 0);

    // ৪. মিল রেট হিসাব (খরচ ÷ মিল)
    const mealRate = totalMeals > 0 ? (totalExpenses / totalMeals).toFixed(2) : '0.00';

    // ৫. ক্যাটাগরিভিত্তিক খরচের ব্রেকডাউন
    let categoryBreakdown: any[] = [];
    try {
      const [catRows]: any = await pool.query(`
        SELECT 
          COALESCE(category, 'মুদি বাজার') AS category, 
          COALESCE(SUM(amount), 0) AS total
        FROM Expenses
        GROUP BY category
        ORDER BY total DESC
      `);
      categoryBreakdown = catRows.map((r: any) => ({
        category: r.category,
        total: Number(r.total),
      }));
    } catch (e) {
      // যদি ক্যাটাগরি কলাম না থাকে
      categoryBreakdown = [];
    }

    return NextResponse.json(
      {
        totalMembers,
        totalMeals,
        totalExpenses,
        mealRate,
        categoryBreakdown,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('ড্যাশবোর্ড ডাটা ফেচ করতে সমস্যা:', error);
    return NextResponse.json(
      { message: 'ডাটাবেজ থেকে তথ্য আনা সম্ভব হয়নি।' },
      { status: 500 }
    );
  }
}
