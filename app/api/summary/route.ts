import { NextResponse } from 'next/server';
import pool from '../../database/db';

export async function GET() {
  try {
    // মোট মিল
    const [totalMealRows]: any = await pool.query(
      'SELECT COALESCE(SUM(lunch_count + dinner_count), 0) AS totalMeals FROM Meals'
    );
    const totalMeals = Number(totalMealRows[0]?.totalMeals || 0);

    // মোট বাজার খরচ
    const [totalExpenseRows]: any = await pool.query(
      'SELECT COALESCE(SUM(amount), 0) AS totalExpenses FROM Expenses'
    );
    const totalExpenses = Number(totalExpenseRows[0]?.totalExpenses || 0);

    // মিল রেট
    const mealRate = totalMeals > 0 ? totalExpenses / totalMeals : 0;

    // মেম্বারভিত্তিক হিসাব
    const [members]: any = await pool.query(`
      SELECT 
        u.id,
        u.name,
        u.email,
        COALESCE(u.total_deposit, 0) AS totalDeposit,
        COALESCE(SUM(m.lunch_count + m.dinner_count), 0) AS memberMeals
      FROM Users u
      LEFT JOIN Meals m ON u.id = m.user_id
      GROUP BY u.id, u.name, u.email, u.total_deposit
      ORDER BY u.name ASC
    `);

    const summary = members.map((member: any) => {
      const meals = Number(member.memberMeals || 0);
      const deposit = Number(member.totalDeposit || 0);
      const cost = Number((meals * mealRate).toFixed(2));
      const balance = Number((deposit - cost).toFixed(2)); // পজিটিভ হলে ফেরত পাবে, নেগেটিভ হলে বকেয়া

      return {
        id: member.id,
        name: member.name,
        meals,
        deposit,
        cost,
        balance,
      };
    });

    return NextResponse.json(
      {
        totalMeals,
        totalExpenses,
        mealRate: mealRate.toFixed(2),
        members: summary,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('সামারি ফেচ করতে সমস্যা:', error);
    return NextResponse.json({ message: 'সামারি ডাটা লোড হয়নি।' }, { status: 500 });
  }
}

