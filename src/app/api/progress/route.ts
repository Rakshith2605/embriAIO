import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { redis } from "@/lib/redis";
import { ProgressState } from "@/types/curriculum";

function progressKey(email: string) {
  return `progress:${email}`;
}

export async function GET() {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const data = await redis.get<ProgressState>(progressKey(session.user.email));
  return NextResponse.json(data ?? null);
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = (await request.json()) as ProgressState;
  await redis.set(progressKey(session.user.email), body);
  return NextResponse.json({ ok: true });
}
