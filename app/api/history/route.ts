import { NextResponse } from 'next/server';
import pool from '../../database/db';

export async function GET() {
  try {
    // ১. সমস্ত মেম্বারদের নাম
    const [users]: any = await pool.query('SELECT id, name FROM Users ORDER BY name ASC');

    // ২. মিলের সমস্ত এন্ট্রি (তারিখ ও মেম্বার অনুযায়ী)
    const [meals]: any = await pool.query(`
      SELECT 
        m.id,
        m.user_id,
        u.name AS member_name,
        m.lunch_count,
        m.dinner_count,
        (m.lunch_count + m.dinner_count) AS total_meal,
        DATE_FORMAT(m.meal_date, '%Y-%m-%d') AS date
      FROM Meals m
      JOIN Users u ON m.user_id = u.id
      ORDER BY m.meal_date DESC, m.id DESC
    `);

    // ৩. তারিখ অনুযায়ী গ্রুপ করা (Row = Date, Columns = Members)
    const datesMap: { [date: string]: any } = {};

    meals.forEach((m: any) => {
      const d = m.date;
      if (!datesMap[d]) {
        datesMap[d] = {
          date: d,
          memberMeals: {},
          dayTotal: 0,
          entries: [],
        };
      }
      datesMap[d].memberMeals[m.member_name] = {
        id: m.id,
        lunch: Number(m.lunch_count),
        dinner: Number(m.dinner_count),
        total: Number(m.total_meal),
      };
      datesMap[d].dayTotal += Number(m.total_meal);
      datesMap[d].entries.push(m);
    });

    const groupedDates = Object.values(datesMap);

    // ৪. বাজার খরচের তালিকা
    const [recentExpenses]: any = await pool.query(`
      SELECT 
        e.id, 
        u.name AS member_name, 
        e.amount, 
        e.description, 
        DATE_FORMAT(e.expense_date, '%Y-%m-%d') AS date
      FROM Expenses e
      JOIN Users u ON e.user_id = u.id
      ORDER BY e.expense_date DESC, e.id DESC
      LIMIT 30
    `);

    return NextResponse.json({
      members: users,
      groupedDates,
      recentExpenses,
    });
  } catch (error) {
    console.error('হিস্ট্রি ডাটা ফেচ করতে সমস্যা:', error);
    return NextResponse.json({ message: 'হিস্ট্রি লোড হয়নি।' }, { status: 500 });
  }
}

// এন্ট্রি ডিলিট করা
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const id = searchParams.get('id');

    if (!type || !id) {
      return NextResponse.json({ message: 'টাইপ ও আইডি দেওয়া বাধ্যতামূলক।' }, { status: 400 });
    }

    if (type === 'meal') {
      await pool.query('DELETE FROM Meals WHERE id = ?', [id]);
    } else if (type === 'expense') {
      await pool.query('DELETE FROM Expenses WHERE id = ?', [id]);
    }

    return NextResponse.json({ message: 'এন্ট্রি সফলভাবে মুছে ফেলা হয়েছে।' });
  } catch (error) {
    console.error('মুছতে সমস্যা:', error);
    return NextResponse.json({ message: 'মুছে ফেলা সম্ভব হয়নি।' }, { status: 500 });
  }
}
