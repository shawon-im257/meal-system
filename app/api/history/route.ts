import { NextResponse } from 'next/server';
import pool from '../../database/db';

// ১. রিসেন্ট মিল এবং বাজার খরচের তালিকা পাওয়া
export async function GET() {
  try {
    // শেষ ২০টি মিল এন্ট্রি
    const [recentMeals]: any = await pool.query(`
      SELECT 
        m.id, 
        u.name AS member_name, 
        m.lunch_count, 
        m.dinner_count, 
        DATE_FORMAT(m.meal_date, '%Y-%m-%d') AS date
      FROM Meals m
      JOIN Users u ON m.user_id = u.id
      ORDER BY m.meal_date DESC, m.id DESC
      LIMIT 20
    `);

    // শেষ ২০টি বাজার খরচের এন্ট্রি
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
      LIMIT 20
    `);

    return NextResponse.json({
      recentMeals,
      recentExpenses,
    });
  } catch (error) {
    console.error('হিস্ট্রি ডাটা ফেচ করতে সমস্যা:', error);
    return NextResponse.json({ message: 'হিস্ট্রি লোড হয়নি।' }, { status: 500 });
  }
}

// ২. ভুল এন্ট্রি ডিলিট করা
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type'); // 'meal' অথবা 'expense'
    const id = searchParams.get('id');

    if (!type || !id) {
      return NextResponse.json({ message: 'টাইপ ও আইডি দেওয়া বাধ্যতামূলক।' }, { status: 400 });
    }

    if (type === 'meal') {
      await pool.query('DELETE FROM Meals WHERE id = ?', [id]);
    } else if (type === 'expense') {
      await pool.query('DELETE FROM Expenses WHERE id = ?', [id]);
    } else {
      return NextResponse.json({ message: 'অবৈধ টাইপ।' }, { status: 400 });
    }

    return NextResponse.json({ message: 'এন্ট্রিটি সফলভাবে মুছে ফেলা হয়েছে।' });
  } catch (error) {
    console.error('মুছতে সমস্যা হয়েছে:', error);
    return NextResponse.json({ message: 'মুছে ফেলা সম্ভব হয়নি।' }, { status: 500 });
  }
}

