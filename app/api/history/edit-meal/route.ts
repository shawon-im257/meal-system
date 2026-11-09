import { NextResponse } from 'next/server';
import pool from '../../../database/db';

export async function PUT(request: Request) {
  try {
    const { id, lunch, dinner, pin } = await request.json();

    if (pin !== '1234') {
      return NextResponse.json({ message: 'ভুল পিন! মিল আপডেট করা সম্ভব হয়নি।' }, { status: 403 });
    }

    if (!id) {
      return NextResponse.json({ message: 'মিলের আইডি প্রয়োজন।' }, { status: 400 });
    }

    await pool.query(
      'UPDATE Meals SET lunch_count = ?, dinner_count = ? WHERE id = ?',
      [Number(lunch) || 0, Number(dinner) || 0, id]
    );

    return NextResponse.json({ message: 'মিল সফলভাবে আপডেট করা হয়েছে!' }, { status: 200 });
  } catch (error) {
    console.error('মিল এডিটে সমস্যা:', error);
    return NextResponse.json({ message: 'সার্ভারে সমস্যা হয়েছে।' }, { status: 500 });
  }
}

