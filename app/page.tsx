"use client"

import { useState, useCallback } from "react"
import { SearchHeader } from "@/components/search-header"
import { FilterBar, SortOption } from "@/components/filter-bar"
import { ProductCard, Product } from "@/components/product-card"
import { ProductCardSkeleton } from "@/components/product-card-skeleton"
import { EmptyState } from "@/components/empty-state"
import { sortProducts } from "@/lib/mock-data"

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("")
  const [submittedQuery, setSubmittedQuery] = useState("")
  const [products, setProducts] = useState<Product[]>([])
  const [sortBy, setSortBy] = useState<SortOption>("relevant")
  const [isLoading, setIsLoading] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)

  const handleSearch = useCallback(async (queryOverride?: string) => {
    const q = (queryOverride ?? searchQuery).trim()
    if (!q) return

    if (queryOverride) setSearchQuery(queryOverride)
    setIsLoading(true)
    setHasSearched(true)
    setSubmittedQuery(q)

    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`)
      const data = await res.json()
      setProducts(res.ok ? data.products : [])
    } catch {
      setProducts([])
    } finally {
      setIsLoading(false)
    }
  }, [searchQuery])

  const handleSortChange = useCallback((newSort: SortOption) => {
    setSortBy(newSort)
  }, [])

  const sortedProducts = sortProducts(products, sortBy)

  return (
    <div className="min-h-screen bg-background">
      <SearchHeader
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onSearch={handleSearch}
        hasSearched={hasSearched}
      />

      {hasSearched && (
        <main className="container mx-auto px-4 py-6">
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <ProductCardSkeleton key={i} />
              ))}
            </div>
          ) : sortedProducts.length === 0 ? (
            <EmptyState searchQuery={submittedQuery} />
          ) : (
            <>
              <FilterBar
                sortBy={sortBy}
                onSortChange={handleSortChange}
                resultCount={sortedProducts.length}
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mt-6">
                {sortedProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            </>
          )}
        </main>
      )}

      <footer className="border-t border-border py-6 mt-16">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          Dealseeker &mdash; Compare prices across New Zealand&apos;s top online stores
        </div>
      </footer>
    </div>
  )
}
