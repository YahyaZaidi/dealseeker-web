import { NextRequest, NextResponse } from "next/server"
import { normalizeEmail, verifyAccount } from "@/lib/server/user-store"

const USER_COOKIE_KEY = "dealseeker_user"

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null)
  const email = typeof body?.email === "string" ? normalizeEmail(body.email) : ""
  const password = typeof body?.password === "string" ? body.password : ""

  if (!email || !password) {
    return NextResponse.json({ error: "Email and password are required." }, { status: 400 })
  }

  const isValid = await verifyAccount(email, password)
  if (!isValid.ok) {
    if (isValid.reason === "email_unverified") {
      return NextResponse.json(
        { error: "Please verify your email before signing in.", reason: isValid.reason },
        { status: 403 }
      )
    }
    if (isValid.reason === "locked") {
      return NextResponse.json(
        {
          error: "Too many failed attempts. Try again later.",
          reason: isValid.reason,
          lockUntil: isValid.lockUntil,
        },
        { status: 429 }
      )
    }
    return NextResponse.json({ error: "Invalid email or password." }, { status: 401 })
  }

  const response = NextResponse.json({ userEmail: email, emailVerified: true })
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
