import { NextResponse } from 'next/server';
import pool from '../../database/db';

export async function POST(request: Request) {
  try {
    const { name, amount } = await request.json();

    if (!name || !amount) {
      return NextResponse.json(
        { message: 'মেম্বারের নাম এবং জমার পরিমাণ দিন।' },
        { status: 400 }
      );
    }

    // ১. চেক করা মেম্বার আছে কি না
    const [users]: any = await pool.query('SELECT id, total_deposit FROM Users WHERE name = ?', [name.trim()]);

    if (users.length > 0) {
      // আগের জমার সাথে নতুন জমা যোগ করা
      const currentDeposit = Number(users[0].total_deposit || 0);
      const newDeposit = currentDeposit + Number(amount);

      await pool.query('UPDATE Users SET total_deposit = ? WHERE id = ?', [newDeposit, users[0].id]);
    } else {
      // নতুন মেম্বার তৈরি করে জমা রাখা
      const tempEmail = `${name.trim().replace(/\s+/g, '').toLowerCase()}${Date.now()}@test.com`;
      await pool.query(
        'INSERT INTO Users (name, email, total_deposit) VALUES (?, ?, ?)',
        [name.trim(), tempEmail, Number(amount)]
      );
    }

    return NextResponse.json(
      { message: 'টাকা জমা সফলভাবে আপডেট করা হয়েছে!' },
      { status: 200 }
    );
  } catch (error) {
    console.error('টাকা জমাতে সমস্যা:', error);
    return NextResponse.json(
      { message: 'সার্ভারে সমস্যা হয়েছে।' },
      { status: 500 }
    );
  }
}

