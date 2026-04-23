import { NextRequest, NextResponse } from "next/server"

const USER_COOKIE_KEY = "dealseeker_user"

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null)
  const userName = typeof body?.userName === "string" ? body.userName.trim() : ""

  if (!userName) {
    return NextResponse.json({ error: "User name is required" }, { status: 400 })
  }

  const response = NextResponse.json({ userName })
  response.cookies.set({
    name: USER_COOKIE_KEY,
    value: userName,
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  })

  return response
}
