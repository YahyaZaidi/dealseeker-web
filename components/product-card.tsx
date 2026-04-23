import { ExternalLink, Heart } from "lucide-react"

export interface Product {
  id: string
  name: string
  price: number
  image: string
  store: string
  url: string
}

interface ProductCardProps {
  product: Product
  isSaved?: boolean
  onToggleSave?: (product: Product) => void
}

export function ProductCard({ product, isSaved = false, onToggleSave }: ProductCardProps) {
  return (
    <div className="group flex flex-col overflow-hidden rounded-lg border border-border bg-card transition-all duration-200 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10">
      {/* Image */}
      <div className="relative aspect-square overflow-hidden bg-muted/40">
        {product.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={product.image}
            alt={product.name}
            className="h-full w-full object-contain p-4 transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">
            No image
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col p-4">
        <span className="mb-2 inline-block w-fit rounded-full bg-primary/15 px-2.5 py-0.5 font-heading text-xs font-semibold text-primary">
          {product.store}
        </span>
        <h3 className="mb-3 flex-1 text-sm font-medium leading-snug text-foreground line-clamp-2">
          {product.name}
        </h3>
        <div className="flex items-center justify-between gap-2">
          <span className="font-heading text-2xl font-bold text-primary">
            ${product.price.toLocaleString("en-NZ", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onToggleSave?.(product)}
              className={`rounded-md border px-2 py-1.5 transition-colors ${
                isSaved
                  ? "border-primary/40 bg-primary/10 text-primary"
                  : "border-border text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              }`}
              aria-label={isSaved ? "Remove saved deal" : "Save deal"}
            >
              <Heart className={`h-4 w-4 ${isSaved ? "fill-current" : ""}`} />
            </button>
            <a
              href={product.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 font-heading text-xs font-semibold text-white shadow-sm shadow-primary/30 transition-colors hover:bg-primary/90"
            >
              View Deal
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
