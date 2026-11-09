import { NextResponse } from 'next/server';
import pool from '../../database/db'; // তোমার ডাটাবেস কানেকশন ফাইল

export async function POST(request: Request) {
    try {
        // ফর্ম থেকে ডেটাগুলো গ্রহণ করা হচ্ছে
        const { name, lunch, dinner, date } = await request.json();

        // ১. প্রথমে চেক করা হচ্ছে এই মেম্বার আগে থেকে ডাটাবেসে আছে কি না
        const [users]: any = await pool.query('SELECT id FROM Users WHERE name = ?', [name]);
        let userId;

        if (users.length > 0) {
            userId = users[0].id; // মেম্বার থাকলে তার আইডি নেওয়া হলো
        } else {
            // মেম্বার না থাকলে নতুন মেম্বার তৈরি করা হলো (ডামি ইমেইল দিয়ে)
            const tempEmail = `${name.replace(/\s+/g, '').toLowerCase()}${Date.now()}@test.com`;
            const [result]: any = await pool.query(
                'INSERT INTO Users (name, email) VALUES (?, ?)',
                [name, tempEmail]
            );
            userId = result.insertId;
        }

        // ২. এবার মিলের হিসাব Meals টেবিলে সেভ করা হচ্ছে
        await pool.query(
            'INSERT INTO Meals (user_id, meal_date, lunch_count, dinner_count) VALUES (?, ?, ?, ?)',
            [userId, date, lunch || 0, dinner || 0]
        );

        return NextResponse.json({ message: 'মিল সফলভাবে যোগ করা হয়েছে!' }, { status: 200 });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ message: 'মিল যোগ করতে সমস্যা হয়েছে।' }, { status: 500 });
    }
}