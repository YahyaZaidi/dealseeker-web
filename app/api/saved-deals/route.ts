import { NextRequest, NextResponse } from "next/server"
import { getUserData, setUserData } from "@/lib/server/user-store"

const USER_COOKIE_KEY = "dealseeker_user"

interface ProductPayload {
  id: string
  name: string
  price: number
  image: string
  store: string
  url: string
}

function getCurrentUser(request: NextRequest): string | null {
  const user = request.cookies.get(USER_COOKIE_KEY)?.value?.trim()
  return user || null
}

function isValidProduct(value: unknown): value is ProductPayload {
  if (!value || typeof value !== "object") return false
  const item = value as Record<string, unknown>
  return (
    typeof item.id === "string" &&
    typeof item.name === "string" &&
    typeof item.price === "number" &&
    typeof item.image === "string" &&
    typeof item.store === "string" &&
    typeof item.url === "string"
  )
}

export async function GET(request: NextRequest) {
  const user = getCurrentUser(request)
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const data = await getUserData(user)
  return NextResponse.json({ products: data.savedDeals })
}

export async function POST(request: NextRequest) {
  const user = getCurrentUser(request)
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await request.json().catch(() => null)
  if (!isValidProduct(body?.product)) {
    return NextResponse.json({ error: "Invalid product" }, { status: 400 })
  }

  const data = await getUserData(user)
  const exists = data.savedDeals.some((item) => item.url === body.product.url)
  const nextSavedDeals = exists
    ? data.savedDeals
    : [body.product, ...data.savedDeals].slice(0, 50)

  await setUserData(user, { ...data, savedDeals: nextSavedDeals })
  return NextResponse.json({ products: nextSavedDeals })
}

export async function DELETE(request: NextRequest) {
  const user = getCurrentUser(request)
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await request.json().catch(() => null)
  const url = typeof body?.url === "string" ? body.url : ""
  if (!url) {
    return NextResponse.json({ error: "Missing url" }, { status: 400 })
  }

  const data = await getUserData(user)
  const nextSavedDeals = data.savedDeals.filter((item) => item.url !== url)
  await setUserData(user, { ...data, savedDeals: nextSavedDeals })
  return NextResponse.json({ products: nextSavedDeals })
}
