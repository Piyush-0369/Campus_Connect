import { NextResponse } from "next/server";
import { students, alumni } from "@/data/profiles";

export async function GET() {
  return NextResponse.json({ students, alumni });
}
