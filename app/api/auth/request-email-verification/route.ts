import { NextRequest, NextResponse } from "next/server"
import { issueEmailVerificationCode, normalizeEmail } from "@/lib/server/user-store"
import { buildVerificationEmail, sendEmail } from "@/lib/server/email"

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null)
  const email = typeof body?.email === "string" ? normalizeEmail(body.email) : ""
  if (!email) {
    return NextResponse.json({ error: "Email is required." }, { status: 400 })
  }

  const result = await issueEmailVerificationCode(email)
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 400 })
  }

  if (result.verificationCode) {
    const emailContent = buildVerificationEmail(result.verificationCode)
    const emailResult = await sendEmail({
      to: email,
      subject: emailContent.subject,
      text: emailContent.text,
      html: emailContent.html,
    })
    if (!emailResult.ok) {
      return NextResponse.json({ error: emailResult.error }, { status: 500 })
    }
  }

  return NextResponse.json({
    ok: true,
    devVerificationCode:
      process.env.NODE_ENV === "development" ? result.verificationCode : undefined,
  })
}
