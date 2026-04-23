import { NextRequest, NextResponse } from "next/server"

const USER_COOKIE_KEY = "dealseeker_user"

export async function GET(request: NextRequest) {
  const userName = request.cookies.get(USER_COOKIE_KEY)?.value ?? null
  return NextResponse.json({ userName })
}
