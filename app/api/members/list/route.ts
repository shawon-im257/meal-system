import { NextResponse } from 'next/server';
import pool from '../../../database/db';

export async function GET() {
  try {
    const [rows]: any = await pool.query('SELECT id, name FROM Users ORDER BY name ASC');
    return NextResponse.json({ members: rows });
  } catch (error) {
    console.error('মেম্বার লিস্ট ফেচ করতে সমস্যা:', error);
    return NextResponse.json({ members: [] }, { status: 500 });
  }
}

