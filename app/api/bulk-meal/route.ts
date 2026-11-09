import { NextResponse } from 'next/server';
import pool from '../../database/db';

interface MealEntryItem {
  user_id: number;
  lunch_count: number;
  dinner_count: number;
}

export async function POST(request: Request) {
  try {
    const { meal_date, entries }: { meal_date: string; entries: MealEntryItem[] } = await request.json();

    if (!meal_date || !Array.isArray(entries) || entries.length === 0) {
      return NextResponse.json(
        { error: 'তারিখ এবং সদস্যদের মিলের তালিকা প্রদান করুন' },
        { status: 400 }
      );
    }

    const connection = await pool.getConnection();

    try {
      await connection.beginTransaction();

      for (const entry of entries) {
        const { user_id, lunch_count, dinner_count } = entry;
        const total = (Number(lunch_count) || 0) + (Number(dinner_count) || 0);

        // ওই তারিখ ও ইউজারের মিল আছে কিনা চেক
        const [existing]: any = await connection.query(
          'SELECT id FROM Meals WHERE user_id = ? AND meal_date = ?',
          [user_id, meal_date]
        );

        if (existing && existing.length > 0) {
          if (total === 0) {
            // যদি দুটোই ০ হয় তবে রেকর্ড মুছে ফেলা
            await connection.query('DELETE FROM Meals WHERE id = ?', [existing[0].id]);
          } else {
            // আপডেট করা
            await connection.query(
              'UPDATE Meals SET lunch_count = ?, dinner_count = ? WHERE id = ?',
              [lunch_count || 0, dinner_count || 0, existing[0].id]
            );
          }
        } else if (total > 0) {
          // নতুন ইনসার্ট
          await connection.query(
            'INSERT INTO Meals (user_id, meal_date, lunch_count, dinner_count) VALUES (?, ?, ?, ?)',
            [user_id, meal_date, lunch_count || 0, dinner_count || 0]
          );
        }
      }

      await connection.commit();
      connection.release();

      return NextResponse.json({ message: 'সফলভাবে সবার মিল সংরক্ষিত হয়েছে!' }, { status: 200 });
    } catch (err) {
      await connection.rollback();
      connection.release();
      throw err;
    }
  } catch (error: any) {
    console.error('Bulk meal save error:', error);
    return NextResponse.json(
      { error: 'মিল সংরক্ষণ করতে সমস্যা হয়েছে', details: error.message },
      { status: 500 }
    );
  }
}

