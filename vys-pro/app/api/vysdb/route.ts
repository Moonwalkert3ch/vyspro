// app/api/some-route/route.ts
import pool from '@/lib/db';

export async function GET() {
  const result = await pool.query('SELECT * FROM messages');
  return Response.json(result.rows);
}
