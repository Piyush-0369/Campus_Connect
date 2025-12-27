import { NextResponse } from "next/server";
import { conversations } from "@/data/conversations";

export async function GET() {
  return NextResponse.json(conversations);
}
