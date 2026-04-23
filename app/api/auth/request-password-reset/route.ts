import { NextRequest, NextResponse } from "next/server"
import { issuePasswordResetCode, normalizeEmail } from "@/lib/server/user-store"
import { buildResetPasswordEmail, sendEmail } from "@/lib/server/email"

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null)
  const email = typeof body?.email === "string" ? normalizeEmail(body.email) : ""
  if (!email) {
    return NextResponse.json({ error: "Email is required." }, { status: 400 })
  }

  const result = await issuePasswordResetCode(email)
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 400 })
  }

  if (result.resetCode) {
    const emailContent = buildResetPasswordEmail(result.resetCode)
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
    devResetCode: process.env.NODE_ENV === "development" ? result.resetCode : undefined,
  })
}
