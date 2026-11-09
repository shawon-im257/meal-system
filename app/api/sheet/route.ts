import { NextResponse } from 'next/server';
import pool from '../../database/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const selectedMonth = searchParams.get('month') || new Date().toISOString().slice(0, 7);

    const [year, month] = selectedMonth.split('-').map(Number);
    // ওই মাসে মোট কত দিন আছে (যেমন: ২৮, ৩০ বা ৩১ দিন)
    const daysInMonth = new Date(year, month, 0).getDate();

    // ১. সকল মেম্বারদের আনা
    const [users]: any = await pool.query('SELECT id, name FROM Users ORDER BY name ASC');

    // ২. নির্বাচিত মাসের সমস্ত মিলের এন্ট্রি নিয়ে আসা
    const [meals]: any = await pool.query(
      `
      SELECT 
        user_id,
        DAY(meal_date) AS day_of_month,
        (lunch_count + dinner_count) AS total_meal
      FROM Meals
      WHERE DATE_FORMAT(meal_date, '%Y-%m') = ?
      `,
      [selectedMonth]
    );

    // ৩. মেম্বার অনুযায়ী প্রতিদিনের মিল ম্যাপিং করা
    const matrix = users.map((user: any) => {
      const dailyMeals: { [day: number]: number } = {};
      let total = 0;

      // ১ থেকে শেষ দিন পর্যন্ত ডিফল্ট ০
      for (let d = 1; d <= daysInMonth; d++) {
        dailyMeals[d] = 0;
      }

      // ডাটাবেজের মিলগুলো বসানো
      meals
        .filter((m: any) => m.user_id === user.id)
        .forEach((m: any) => {
          dailyMeals[m.day_of_month] = Number(m.total_meal);
          total += Number(m.total_meal);
        });

      return {
        id: user.id,
        name: user.name,
        dailyMeals,
        totalMeals: total,
      };
    });

    // ৩. নির্বাচিত মাসের মোট মিল ও বাজার খরচ এনে মিল রেট হিসাব করা
    const [totalMealRows]: any = await pool.query(
      `SELECT COALESCE(SUM(lunch_count + dinner_count), 0) AS totalMeals 
       FROM Meals 
       WHERE DATE_FORMAT(meal_date, '%Y-%m') = ?`,
      [selectedMonth]
    );
    const totalMealsAll = Number(totalMealRows[0]?.totalMeals || 0);

    const [totalExpRows]: any = await pool.query(
      `SELECT COALESCE(SUM(amount), 0) AS totalExpenses 
       FROM Expenses 
       WHERE DATE_FORMAT(expense_date, '%Y-%m') = ?`,
      [selectedMonth]
    );
    const totalExpensesAll = Number(totalExpRows[0]?.totalExpenses || 0);
    const mealRate = totalMealsAll > 0 ? (totalExpensesAll / totalMealsAll).toFixed(2) : '0.00';

    return NextResponse.json({
      selectedMonth,
      daysInMonth,
      totalMeals: totalMealsAll,
      totalExpenses: totalExpensesAll,
      mealRate,
      matrix,
    });
  } catch (error) {
    console.error('শিট ডাটা ফেচ করতে সমস্যা:', error);
    return NextResponse.json({ message: 'শিট লোড হয়নি।' }, { status: 500 });
  }
}

