import { NextResponse } from "next/server"

const USER_COOKIE_KEY = "dealseeker_user"

export async function POST() {
  const response = NextResponse.json({ ok: true })
  response.cookies.set({
    name: USER_COOKIE_KEY,
    value: "",
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  })
  return response
}
