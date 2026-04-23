import { NextRequest, NextResponse } from "next/server"
import { getUserData, setUserData } from "@/lib/server/user-store"

const USER_COOKIE_KEY = "dealseeker_user"

function getCurrentUser(request: NextRequest): string | null {
  const user = request.cookies.get(USER_COOKIE_KEY)?.value?.trim()
  return user || null
}

export async function GET(request: NextRequest) {
  const user = getCurrentUser(request)
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const data = await getUserData(user)
  return NextResponse.json({ queries: data.searchHistory })
}

export async function POST(request: NextRequest) {
  const user = getCurrentUser(request)
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await request.json().catch(() => null)
  const query = typeof body?.query === "string" ? body.query.trim() : ""
  if (!query) {
    return NextResponse.json({ error: "Missing query" }, { status: 400 })
  }

  const data = await getUserData(user)
  const withoutDuplicate = data.searchHistory.filter(
    (entry) => entry.toLowerCase() !== query.toLowerCase()
  )
  const nextSearchHistory = [query, ...withoutDuplicate].slice(0, 10)

  await setUserData(user, { ...data, searchHistory: nextSearchHistory })
  return NextResponse.json({ queries: nextSearchHistory })
}

export async function DELETE(request: NextRequest) {
  const user = getCurrentUser(request)
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const data = await getUserData(user)
  await setUserData(user, { ...data, searchHistory: [] })
  return NextResponse.json({ queries: [] })
}
