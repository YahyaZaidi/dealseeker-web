import { NextRequest, NextResponse } from "next/server"
import { confirmEmailVerification, normalizeEmail } from "@/lib/server/user-store"

const USER_COOKIE_KEY = "dealseeker_user"

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null)
  const email = typeof body?.email === "string" ? normalizeEmail(body.email) : ""
  const code = typeof body?.code === "string" ? body.code.trim() : ""
  if (!email || !code) {
    return NextResponse.json({ error: "Email and verification code are required." }, { status: 400 })
  }

  const result = await confirmEmailVerification(email, code)
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 400 })
  }

  const response = NextResponse.json({ ok: true, userEmail: email, emailVerified: true })
  response.cookies.set({
    name: USER_COOKIE_KEY,
    value: email,
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  })
  return response
}
