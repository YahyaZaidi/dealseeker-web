import { NextRequest, NextResponse } from "next/server"
import { createAccount, normalizeEmail } from "@/lib/server/user-store"
import { buildVerificationEmail, sendEmail } from "@/lib/server/email"

const USER_COOKIE_KEY = "dealseeker_user"

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null)
  const email = typeof body?.email === "string" ? normalizeEmail(body.email) : ""
  const password = typeof body?.password === "string" ? body.password : ""

  if (!email || !password) {
    return NextResponse.json({ error: "Email and password are required." }, { status: 400 })
  }

  const created = await createAccount(email, password)
  if (!created.ok) {
    return NextResponse.json({ error: created.error }, { status: 400 })
  }

  if (created.verificationCode) {
    const emailContent = buildVerificationEmail(created.verificationCode)
    const emailResult = await sendEmail({
      to: email,
      subject: emailContent.subject,
      text: emailContent.text,
      html: emailContent.html,
    })
    if (!emailResult.ok) {
      return NextResponse.json(
        { error: `Account created but email could not be sent: ${emailResult.error}` },
        { status: 500 }
      )
    }
  }

  const response = NextResponse.json({
    userEmail: email,
    emailVerified: false,
    devVerificationCode:
      process.env.NODE_ENV === "development" ? created.verificationCode : undefined,
  })
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
