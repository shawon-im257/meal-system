import { NextResponse } from 'next/server';
import pool from '../../database/db';

// ১. সকল মেম্বারদের তালিকা নিয়ে আসা
export async function GET() {
  try {
    const [rows]: any = await pool.query(`
      SELECT 
        u.id, 
        u.name, 
        u.email, 
        u.phone, 
        COALESCE(u.total_deposit, 0) AS total_deposit,
        DATE_FORMAT(u.joined_date, '%Y-%m-%d') AS joined_date,
        COALESCE(SUM(m.lunch_count + m.dinner_count), 0) AS total_meals
      FROM Users u
      LEFT JOIN Meals m ON u.id = m.user_id
      GROUP BY u.id, u.name, u.email, u.phone, u.total_deposit, u.joined_date
      ORDER BY u.name ASC
    `);

    return NextResponse.json({ members: rows });
  } catch (error) {
    console.error('মেম্বার ফেচ করতে সমস্যা:', error);
    return NextResponse.json({ message: 'মেম্বার তালিকা লোড হয়নি।' }, { status: 500 });
  }
}

// ২. নতুন মেম্বার যুক্ত করা
export async function POST(request: Request) {
  try {
    const { name, phone, email, initialDeposit } = await request.json();

    if (!name) {
      return NextResponse.json({ message: 'মেম্বারের নাম দেওয়া আবশ্যক।' }, { status: 400 });
    }

    const memberEmail = email?.trim() || `${name.trim().replace(/\s+/g, '').toLowerCase()}${Date.now()}@test.com`;

    const [result]: any = await pool.query(
      'INSERT INTO Users (name, email, phone, total_deposit) VALUES (?, ?, ?, ?)',
      [name.trim(), memberEmail, phone?.trim() || null, Number(initialDeposit) || 0]
    );

    return NextResponse.json({
      message: 'নতুন মেম্বার সফলভাবে যোগ করা হয়েছে!',
      memberId: result.insertId,
    });
  } catch (error: any) {
    console.error('মেম্বার তৈরিতে সমস্যা:', error);
    if (error.code === 'ER_DUP_ENTRY') {
      return NextResponse.json({ message: 'এই ইমেইল দিয়ে মেম্বার ইতিমধ্যে রয়েছে।' }, { status: 400 });
    }
    return NextResponse.json({ message: 'মেম্বার যোগ করতে সমস্যা হয়েছে।' }, { status: 500 });
  }
}

// ৩. মেম্বার মুছে ফেলা
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ message: 'মেম্বারের আইডি প্রয়োজন।' }, { status: 400 });
    }

    await pool.query('DELETE FROM Users WHERE id = ?', [id]);
    return NextResponse.json({ message: 'মেম্বার সফলভাবে মুছে ফেলা হয়েছে।' });
  } catch (error) {
    console.error('মেম্বার মুছতে সমস্যা:', error);
    return NextResponse.json({ message: 'মেম্বার মোছা সম্ভব হয়নি।' }, { status: 500 });
  }
}

