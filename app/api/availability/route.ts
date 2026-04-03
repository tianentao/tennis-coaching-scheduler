import { NextResponse } from "next/server";
import { getAvailability } from "@/lib/data";

export async function GET() {
  return NextResponse.json(await getAvailability());
}
