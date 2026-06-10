import { NextRequest, NextResponse } from "next/server"
import { POST as mainPost } from "../route"

// Alias route to match PDF path: POST /api/rewards/daily-login/claim
export async function POST(request: NextRequest) {
  return await mainPost(request)
}

export const dynamic = "force-dynamic"
