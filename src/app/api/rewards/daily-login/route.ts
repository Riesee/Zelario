import { NextRequest, NextResponse } from "next/server"
import { getRecord, setClaimed, DAILY_REWARD_AMOUNT } from "@/lib/dailyLoginStore"
import jwt from "jsonwebtoken"

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret"

function getTodayIso() {
  return new Date().toISOString().split("T")[0]
}

function getAddressFromReq(req: NextRequest): string | null {
  // Priority: Authorization Bearer JWT -> x-demo-address header -> cookie
  const auth = req.headers.get("authorization")
  if (auth && auth.startsWith("Bearer ")) {
    try {
      const token = auth.slice("Bearer ".length)
      const decoded: any = jwt.verify(token, JWT_SECRET)
      if (decoded && decoded.address) return decoded.address
    } catch (e) {
      // invalid token, continue to other checks
    }
  }

  const addr = req.headers.get("x-demo-address") || req.cookies.get("demo-address")?.value
  return addr || null
}

export async function GET(request: NextRequest) {
  const address = getAddressFromReq(request)
  if (!address) return NextResponse.json({ error: "Unauthenticated" }, { status: 401 })

  const rec = await getRecord(address)
  const today = getTodayIso()
  const eligible = rec.lastClaimDate !== today

  return NextResponse.json({ eligible, lastClaimDate: rec.lastClaimDate, rewardAmount: rec.rewardAmount })
}

// POST /api/rewards/daily-login -> attempt to claim once (idempotent per-day)
export async function POST(request: NextRequest) {
  const address = getAddressFromReq(request)
  if (!address) return NextResponse.json({ success: false, message: "Unauthenticated" }, { status: 401 })

  const rec = await getRecord(address)
  const today = getTodayIso()
  if (rec.lastClaimDate === today) {
    return NextResponse.json({ success: false, message: "Already claimed today" }, { status: 400 })
  }

  // Mark claimed (persistent)
  await setClaimed(address, today)

  return NextResponse.json({ success: true, message: "Reward claimed successfully", rewardAmount: DAILY_REWARD_AMOUNT })
}

export const dynamic = "force-dynamic"
