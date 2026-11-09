import { NextResponse } from 'next/server';
import pool from '../../database/db';

export async function POST(request: Request) {
  try {
    const { name, amount, category, description, date } = await request.json();

    if (!name || !amount || !date) {
      return NextResponse.json(
        { message: 'সদস্যের নাম, খরচের পরিমাণ এবং তারিখ দেওয়া বাধ্যতামূলক।' },
        { status: 400 }
      );
    }

    // ১. চেক করা মেম্বার আগে থেকে Users টেবিলে আছে কি না
    const [users]: any = await pool.query('SELECT id FROM Users WHERE name = ?', [name.trim()]);
    let userId;

    if (users.length > 0) {
      userId = users[0].id;
    } else {
      const tempEmail = `${name.trim().replace(/\s+/g, '').toLowerCase()}${Date.now()}@test.com`;
      const [result]: any = await pool.query(
        'INSERT INTO Users (name, email) VALUES (?, ?)',
        [name.trim(), tempEmail]
      );
      userId = result.insertId;
    }

    // ২. Expenses টেবিলে খরচ এন্ট্রি করা (ক্যাটাগরি সহ)
    try {
      await pool.query(
        'INSERT INTO Expenses (user_id, amount, category, description, expense_date) VALUES (?, ?, ?, ?, ?)',
        [userId, Number(amount), category || 'মুদি বাজার', description || 'বাজার খরচ', date]
      );
    } catch (colErr: any) {
      // যদি ক্যাটাগরি কলাম না থাকে, তবে সাধারণ ইনসার্ট
      await pool.query(
        'INSERT INTO Expenses (user_id, amount, description, expense_date) VALUES (?, ?, ?, ?)',
        [userId, Number(amount), description || 'বাজার খরচ', date]
      );
    }

    return NextResponse.json(
      { message: 'বাজার খরচ সফলভাবে যোগ করা হয়েছে!' },
      { status: 200 }
    );
  } catch (error) {
    console.error('বাজার খরচ এন্ট্রিতে সমস্যা:', error);
    return NextResponse.json(
      { message: 'সার্ভারে সমস্যা হয়েছে, খরচ যোগ করা যায়নি।' },
      { status: 500 }
    );
  }
}
