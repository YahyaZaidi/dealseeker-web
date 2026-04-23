import { NextRequest, NextResponse } from "next/server"
import { normalizeEmail, resetPasswordWithCode } from "@/lib/server/user-store"

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null)
  const email = typeof body?.email === "string" ? normalizeEmail(body.email) : ""
  const code = typeof body?.code === "string" ? body.code.trim() : ""
  const newPassword = typeof body?.newPassword === "string" ? body.newPassword : ""

  if (!email || !code || !newPassword) {
    return NextResponse.json(
      { error: "Email, reset code, and new password are required." },
      { status: 400 }
    )
  }

  const result = await resetPasswordWithCode(email, code, newPassword)
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 400 })
  }

  return NextResponse.json({ ok: true })
}
