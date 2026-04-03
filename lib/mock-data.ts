import { Product } from "@/components/product-card"

const stores = ["PB Tech", "Mighty Ape", "Harvey Norman", "Noel Leeming", "JB Hi-Fi"]

const productTemplates = [
  {
    name: "Apple iPhone 15 Pro Max 256GB",
    basePrice: 2149,
    image: "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=400&h=400&fit=crop",
  },
  {
    name: "Samsung Galaxy S24 Ultra 512GB",
    basePrice: 2299,
    image: "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=400&h=400&fit=crop",
  },
  {
    name: "Sony PlayStation 5 Console",
    basePrice: 849,
    image: "https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=400&h=400&fit=crop",
  },
  {
    name: "Apple MacBook Pro 14\" M3 Pro",
    basePrice: 3499,
    image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400&h=400&fit=crop",
  },
  {
    name: "Samsung 65\" Neo QLED 4K Smart TV",
    basePrice: 2799,
    image: "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=400&h=400&fit=crop",
  },
  {
    name: "Apple AirPods Pro 2nd Generation",
    basePrice: 449,
    image: "https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=400&h=400&fit=crop",
  },
  {
    name: "Nintendo Switch OLED Model",
    basePrice: 549,
    image: "https://images.unsplash.com/photo-1578303512597-81e6cc155b3e?w=400&h=400&fit=crop",
  },
  {
    name: "Sony WH-1000XM5 Wireless Headphones",
    basePrice: 549,
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop",
  },
  {
    name: "Apple iPad Pro 12.9\" M2 256GB",
    basePrice: 1999,
    image: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=400&h=400&fit=crop",
  },
  {
    name: "DJI Mini 4 Pro Drone",
    basePrice: 1299,
    image: "https://images.unsplash.com/photo-1473968512647-3e447244af8f?w=400&h=400&fit=crop",
  },
  {
    name: "Dyson V15 Detect Cordless Vacuum",
    basePrice: 1299,
    image: "https://images.unsplash.com/photo-1558317374-067fb5f30001?w=400&h=400&fit=crop",
  },
  {
    name: "Bose QuietComfort Ultra Earbuds",
    basePrice: 499,
    image: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=400&h=400&fit=crop",
  },
]

function generateVariation(basePrice: number): number {
  const variation = (Math.random() - 0.5) * 0.15 * basePrice
  return Math.round((basePrice + variation) * 100) / 100
}

export function searchProducts(query: string): Product[] {
  if (!query.trim()) return []

  const lowerQuery = query.toLowerCase()
  const matchingTemplates = productTemplates.filter((p) =>
    p.name.toLowerCase().includes(lowerQuery)
  )

  // If no exact matches, return all products for demo purposes
  const templatesToUse =
    matchingTemplates.length > 0 ? matchingTemplates : productTemplates

  const results: Product[] = []

  templatesToUse.forEach((template) => {
    // Generate 2-4 store listings per product
    const numListings = Math.floor(Math.random() * 3) + 2
    const shuffledStores = [...stores].sort(() => Math.random() - 0.5)

    for (let i = 0; i < numListings; i++) {
      results.push({
        id: `${template.name}-${shuffledStores[i]}-${Date.now()}-${Math.random()}`,
        name: template.name,
        price: generateVariation(template.basePrice),
        image: template.image,
        store: shuffledStores[i],
        url: "#",
      })
    }
  })

  return results
}

export function sortProducts(
  products: Product[],
  sortBy: "relevant" | "price-low" | "price-high"
): Product[] {
  const sorted = [...products]

  switch (sortBy) {
    case "price-low":
      return sorted.sort((a, b) => a.price - b.price)
    case "price-high":
      return sorted.sort((a, b) => b.price - a.price)
    default:
      return sorted
  }
}
