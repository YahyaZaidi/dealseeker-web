import { NextRequest, NextResponse } from "next/server"
import { getAccountByEmail } from "@/lib/server/user-store"

const USER_COOKIE_KEY = "dealseeker_user"

export async function GET(request: NextRequest) {
  const userEmail = request.cookies.get(USER_COOKIE_KEY)?.value ?? null
  if (!userEmail) {
    return NextResponse.json({ userEmail: null, emailVerified: false })
  }

  const account = await getAccountByEmail(userEmail)
  return NextResponse.json({
    userEmail,
    emailVerified: account?.emailVerified ?? false,
  })
}
