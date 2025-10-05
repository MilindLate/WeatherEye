import { NextResponse } from 'next/server';

const API_URL = "https://api.api-ninjas.com/v1/airquality";
const API_KEY = process.env.NEXT_PUBLIC_API_NINJAS_KEY!; // store key in .env.local

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const city = searchParams.get("city") || "Pune";

  const headers = { "X-Api-Key": API_KEY };
  const res = await fetch(`${API_URL}?city=${city}`, { headers });

  if (!res.ok) {
    return NextResponse.json({ error: `API Error: ${res.status}` }, { status: res.status });
  }

  const data = await res.json();
  return NextResponse.json(data);
}
