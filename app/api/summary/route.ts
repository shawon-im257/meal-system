import { NextResponse } from 'next/server';
import pool from '../../database/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    // যদি কোনো মাস দেওয়া না থাকে, তবে চলতি মাস নেওয়া হবে (YYYY-MM)
    const selectedMonth = searchParams.get('month') || new Date().toISOString().slice(0, 7);

    // ১. নির্বাচিত মাসের মোট মিল
    const [totalMealRows]: any = await pool.query(
      `SELECT COALESCE(SUM(lunch_count + dinner_count), 0) AS totalMeals 
       FROM Meals 
       WHERE DATE_FORMAT(meal_date, '%Y-%m') = ?`,
      [selectedMonth]
    );
    const totalMeals = Number(totalMealRows[0]?.totalMeals || 0);

    // ২. নির্বাচিত মাসের মোট বাজার খরচ
    const [totalExpenseRows]: any = await pool.query(
      `SELECT COALESCE(SUM(amount), 0) AS totalExpenses 
       FROM Expenses 
       WHERE DATE_FORMAT(expense_date, '%Y-%m') = ?`,
      [selectedMonth]
    );
    const totalExpenses = Number(totalExpenseRows[0]?.totalExpenses || 0);

    // ৩. নির্বাচিত মাসের মিল রেট
    const mealRate = totalMeals > 0 ? totalExpenses / totalMeals : 0;

    // ৪. নির্বাচিত মাসে মেম্বারভিত্তিক মিল ও বাজার খরচের হিসাব
    const [members]: any = await pool.query(
      `
      SELECT 
        u.id,
        u.name,
        u.email,
        COALESCE(u.total_deposit, 0) AS totalDeposit,
        COALESCE(
          (SELECT SUM(m.lunch_count + m.dinner_count) 
           FROM Meals m 
           WHERE m.user_id = u.id AND DATE_FORMAT(m.meal_date, '%Y-%m') = ?), 
          0
        ) AS memberMeals,
        COALESCE(
          (SELECT SUM(e.amount) 
           FROM Expenses e 
           WHERE e.user_id = u.id AND DATE_FORMAT(e.expense_date, '%Y-%m') = ?), 
          0
        ) AS memberExpense
      FROM Users u
      ORDER BY u.name ASC
      `,
      [selectedMonth, selectedMonth]
    );

    const summary = members.map((member: any) => {
      const meals = Number(member.memberMeals || 0);
      const deposit = Number(member.totalDeposit || 0);
      const expense = Number(member.memberExpense || 0);
      
      // মেম্বারের মোট ক্রেডিট = (ম্যানেজারের কাছে ক্যাশ জমা + নিজের পকেট থেকে করা বাজার)
      const totalContribution = deposit + expense;
      
      // মিলের খরচ = মিল সংখ্যা × মিল রেট
      const cost = Number((meals * mealRate).toFixed(2));
      
      // ব্যালেন্স = (মোট ক্রেডিট - মিলের খরচ)
      // যদি পজিটিভ হয় -> ফেরত পাবে; যদি নেগেটিভ হয় -> বকেয়া দিতে হবে
      const balance = Number((totalContribution - cost).toFixed(2));

      return {
        id: member.id,
        name: member.name,
        email: member.email,
        meals,
        deposit,
        expense,
        totalContribution,
        cost,
        balance,
      };
    });

    return NextResponse.json(
      {
        selectedMonth,
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
