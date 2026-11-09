import { NextResponse } from 'next/server';
import pool from '../../../../database/db';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // ১. মেম্বারের মৌলিক তথ্য
    const [userRows]: any = await pool.query(
      'SELECT id, name, email, phone, COALESCE(total_deposit, 0) AS total_deposit, DATE_FORMAT(joined_date, "%Y-%m-%d") AS joined_date FROM Users WHERE id = ?',
      [id]
    );

    if (userRows.length === 0) {
      return NextResponse.json({ message: 'মেম্বার পাওয়া যায়নি।' }, { status: 404 });
    }

    const member = userRows[0];

    // ২. মেসের বর্তমান সার্বিক মিল রেট হিসাব
    const [totalMealRows]: any = await pool.query(
      'SELECT COALESCE(SUM(lunch_count + dinner_count), 0) AS totalMeals FROM Meals'
    );
    const [totalExpenseRows]: any = await pool.query(
      'SELECT COALESCE(SUM(amount), 0) AS totalExpenses FROM Expenses'
    );

    const totalMealsAll = Number(totalMealRows[0]?.totalMeals || 0);
    const totalExpensesAll = Number(totalExpenseRows[0]?.totalExpenses || 0);
    const currentMealRate = totalMealsAll > 0 ? totalExpensesAll / totalMealsAll : 0;

    // ৩. এই নির্দিষ্ট মেম্বারের সমস্ত মিলের হিস্ট্রি
    const [meals]: any = await pool.query(
      `SELECT 
        id, 
        lunch_count, 
        dinner_count, 
        (lunch_count + dinner_count) AS total_count,
        DATE_FORMAT(meal_date, '%Y-%m-%d') AS date
       FROM Meals 
       WHERE user_id = ? 
       ORDER BY meal_date DESC`,
      [id]
    );

    // ৪. এই মেম্বার বাজার করে থাকলে তার খরচের রেকর্ড
    const [expenses]: any = await pool.query(
      `SELECT 
        id, 
        amount, 
        category, 
        description, 
        DATE_FORMAT(expense_date, '%Y-%m-%d') AS date
       FROM Expenses 
       WHERE user_id = ? 
       ORDER BY expense_date DESC`,
      [id]
    );

    // মোট মিল ও ব্যালান্স ক্যালকুলেশন
    const totalMemberMeals = meals.reduce((sum: number, m: any) => sum + Number(m.total_count), 0);
    const totalMealCost = Number((totalMemberMeals * currentMealRate).toFixed(2));
    const deposit = Number(member.total_deposit);
    const balance = Number((deposit - totalMealCost).toFixed(2));

    return NextResponse.json({
      member,
      stats: {
        totalMeals: totalMemberMeals,
        currentMealRate: currentMealRate.toFixed(2),
        totalCost: totalMealCost,
        totalDeposit: deposit,
        balance, // পজিটিভ হলে পাবে, নেগেটিভ হলে বকেয়া
      },
      meals,
      expenses,
    });
  } catch (error) {
    console.error('মেম্বার স্টেটমেন্ট ফেচে সমস্যা:', error);
    return NextResponse.json({ message: 'ডাটা লোড হয়নি।' }, { status: 500 });
  }
}

