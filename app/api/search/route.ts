import { NextRequest, NextResponse } from "next/server"
import { Product } from "@/components/product-card"

interface ScrapingDogShoppingResult {
  position?: number
  title?: string
  product_url?: string
  source?: string
  price?: string
  thumbnail?: string
}

interface ScrapingDogResponse {
  shopping_results?: ScrapingDogShoppingResult[]
}

function parsePrice(priceStr?: string): number | null {
  if (!priceStr) return null
  const cleaned = priceStr.replace(/[^\d.]/g, "")
  const parsed = parseFloat(cleaned)
  return isNaN(parsed) ? null : parsed
}

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const query = searchParams.get("q")
  const pageParam = Number.parseInt(searchParams.get("page") ?? "1", 10)
  const limitParam = Number.parseInt(searchParams.get("limit") ?? "24", 10)
  const page = Number.isNaN(pageParam) || pageParam < 1 ? 1 : pageParam
  const limit = Number.isNaN(limitParam) || limitParam < 1 ? 24 : Math.min(limitParam, 50)

  if (!query?.trim()) {
    return NextResponse.json({ error: "Missing search query" }, { status: 400 })
  }

  const apiKey = process.env.SCRAPINGDOG_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: "API key not configured" }, { status: 500 })
  }

  const url = new URL("https://api.scrapingdog.com/google_shopping")
  url.searchParams.set("api_key", apiKey)
  url.searchParams.set("query", query)
  url.searchParams.set("country", "nz")
  url.searchParams.set("page", String(page))
  url.searchParams.set("num", String(limit))

  let response: Response
  try {
    response = await fetch(url.toString())
  } catch {
    return NextResponse.json(
      { error: "Failed to reach deal provider. Please try again shortly." },
      { status: 502 }
    )
  }

  if (!response.ok) {
    const body = await response.text()
    const errorMessage =
      response.status === 429
        ? "Too many requests to deal provider. Please try again in a minute."
        : `Deal provider error ${response.status}`

    return NextResponse.json(
      { error: errorMessage, detail: body },
      { status: response.status }
    )
  }

  const data: ScrapingDogResponse = await response.json()

  const products: Product[] = (data.shopping_results ?? [])
    .filter((item) => {
      const price = parsePrice(item.price)
      return item.title && price !== null && item.product_url
    })
    .map((item, index) => ({
      id: `${page}-${item.position ?? index}`,
      name: item.title!,
      price: parsePrice(item.price)!,
      image: item.thumbnail ?? "",
      store: item.source ?? "Unknown",
      url: item.product_url!,
    }))

  return NextResponse.json({ products })
}
