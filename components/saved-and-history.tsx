"use client"

import { Product } from "@/components/product-card"
import { Button } from "@/components/ui/button"

interface SavedAndHistoryProps {
  savedDeals: Product[]
  recentSearches: string[]
  onRunSearch: (query: string) => void
  onRemoveSaved: (product: Product) => void
  onClearHistory: () => void
}

export function SavedAndHistory({
  savedDeals,
  recentSearches,
  onRunSearch,
  onRemoveSaved,
  onClearHistory,
}: SavedAndHistoryProps) {
  return (
    <section className="mt-6 grid gap-4 lg:grid-cols-2">
      <div className="rounded-lg border border-border bg-card p-4">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="font-heading text-sm font-semibold text-foreground">Saved deals</h3>
          <span className="text-xs text-muted-foreground">{savedDeals.length}</span>
        </div>
        {savedDeals.length === 0 ? (
          <p className="text-xs text-muted-foreground">
            Save deals to quickly revisit the best options later.
          </p>
        ) : (
          <ul className="space-y-2">
            {savedDeals.slice(0, 6).map((product) => (
              <li key={`saved-${product.url}`} className="flex items-center justify-between gap-2">
                <a
                  href={product.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="truncate text-xs text-foreground hover:text-primary"
                >
                  {product.name}
                </a>
                <button
                  type="button"
                  onClick={() => onRemoveSaved(product)}
                  className="text-xs text-muted-foreground hover:text-foreground"
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="rounded-lg border border-border bg-card p-4">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="font-heading text-sm font-semibold text-foreground">Recent searches</h3>
          {recentSearches.length > 0 && (
            <Button size="sm" variant="ghost" onClick={onClearHistory}>
              Clear
            </Button>
          )}
        </div>
        {recentSearches.length === 0 ? (
          <p className="text-xs text-muted-foreground">
            Your recent searches will appear here after you search.
          </p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {recentSearches.map((query) => (
              <button
                key={`history-${query}`}
                type="button"
                onClick={() => onRunSearch(query)}
                className="rounded-full border border-border bg-background px-3 py-1 text-xs text-foreground transition-colors hover:border-primary/60 hover:text-primary"
              >
                {query}
              </button>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
