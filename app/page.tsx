"use client"

import { useState, useCallback, useMemo, useEffect } from "react"
import { SearchHeader } from "@/components/search-header"
import { FilterBar, SortOption } from "@/components/filter-bar"
import { ProductCard, Product } from "@/components/product-card"
import { ProductCardSkeleton } from "@/components/product-card-skeleton"
import { EmptyState } from "@/components/empty-state"
import { ErrorState } from "@/components/error-state"
import { SavedAndHistory } from "@/components/saved-and-history"
import { Button } from "@/components/ui/button"
import { sortProducts } from "@/lib/mock-data"

const RESULTS_PER_PAGE = 24
const SAVED_DEALS_KEY_PREFIX = "dealseeker:saved-deals"
const SEARCH_HISTORY_KEY_PREFIX = "dealseeker:search-history"

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("")
  const [submittedQuery, setSubmittedQuery] = useState("")
  const [products, setProducts] = useState<Product[]>([])
  const [sortBy, setSortBy] = useState<SortOption>("relevant")
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [hasMore, setHasMore] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [selectedStore, setSelectedStore] = useState("all")
  const [minPrice, setMinPrice] = useState("")
  const [maxPrice, setMaxPrice] = useState("")
  const [savedDeals, setSavedDeals] = useState<Product[]>([])
  const [recentSearches, setRecentSearches] = useState<string[]>([])
  const [userName, setUserName] = useState<string | null>(null)
  const [isStorageReady, setIsStorageReady] = useState(false)
  const storageNamespace = userName?.trim().toLowerCase() || "guest"
  const savedDealsStorageKey = `${SAVED_DEALS_KEY_PREFIX}:${storageNamespace}`
  const searchHistoryStorageKey = `${SEARCH_HISTORY_KEY_PREFIX}:${storageNamespace}`

  useEffect(() => {
    let ignore = false

    async function loadCurrentUser() {
      try {
        const response = await fetch("/api/auth/me", { cache: "no-store" })
        const data = await response.json().catch(() => null)
        if (!ignore && response.ok) {
          setUserName(typeof data?.userName === "string" ? data.userName : null)
        }
      } catch {
        if (!ignore) {
          setUserName(null)
        }
      }
    }

    void loadCurrentUser()

    return () => {
      ignore = true
    }
  }, [])

  useEffect(() => {
    if (typeof window === "undefined") return
    setIsStorageReady(false)
    try {
      const storedSavedDeals = window.localStorage.getItem(savedDealsStorageKey)
      if (storedSavedDeals) {
        const parsed = JSON.parse(storedSavedDeals)
        setSavedDeals(Array.isArray(parsed) ? parsed : [])
      } else {
        setSavedDeals([])
      }

      const storedHistory = window.localStorage.getItem(searchHistoryStorageKey)
      if (storedHistory) {
        const parsed = JSON.parse(storedHistory)
        setRecentSearches(
          Array.isArray(parsed) ? parsed.filter((item) => typeof item === "string") : []
        )
      } else {
        setRecentSearches([])
      }
    } catch {
      setSavedDeals([])
      setRecentSearches([])
    } finally {
      setIsStorageReady(true)
    }
  }, [savedDealsStorageKey, searchHistoryStorageKey])

  useEffect(() => {
    let ignore = false

    async function loadServerData() {
      if (!userName) return
      try {
        const [savedResponse, historyResponse] = await Promise.all([
          fetch("/api/saved-deals", { cache: "no-store" }),
          fetch("/api/search-history", { cache: "no-store" }),
        ])

        const savedPayload = await savedResponse.json().catch(() => null)
        const historyPayload = await historyResponse.json().catch(() => null)

        if (!ignore && savedResponse.ok && Array.isArray(savedPayload?.products)) {
          setSavedDeals(savedPayload.products)
        }
        if (!ignore && historyResponse.ok && Array.isArray(historyPayload?.queries)) {
          setRecentSearches(historyPayload.queries)
        }
      } catch {
        // Fall back to local storage data for resilience.
      }
    }

    void loadServerData()
    return () => {
      ignore = true
    }
  }, [userName])

  useEffect(() => {
    if (typeof window === "undefined" || !isStorageReady) return
    try {
      window.localStorage.setItem(savedDealsStorageKey, JSON.stringify(savedDeals))
    } catch {
      // Ignore quota/storage errors.
    }
  }, [savedDeals, savedDealsStorageKey, isStorageReady])

  useEffect(() => {
    if (typeof window === "undefined" || !isStorageReady) return
    try {
      window.localStorage.setItem(searchHistoryStorageKey, JSON.stringify(recentSearches))
    } catch {
      // Ignore quota/storage errors.
    }
  }, [recentSearches, searchHistoryStorageKey, isStorageReady])

  const handleSearch = useCallback(async (queryOverride?: string, page = 1, append = false) => {
    const q = (queryOverride ?? (append ? submittedQuery : searchQuery)).trim()
    if (!q) return

    if (queryOverride) setSearchQuery(queryOverride)
    if (append) {
      setIsLoadingMore(true)
    } else {
      setIsLoading(true)
      setHasSearched(true)
      setSubmittedQuery(q)
      setCurrentPage(1)
      setHasMore(false)
    }
    setErrorMessage(null)

    try {
      const params = new URLSearchParams({
        q,
        page: String(page),
        limit: String(RESULTS_PER_PAGE),
      })
      const res = await fetch(`/api/search?${params.toString()}`)
      const data = await res.json().catch(() => null)

      if (!res.ok) {
        if (!append) {
          setProducts([])
        }
        setErrorMessage(
          typeof data?.error === "string"
            ? data.error
            : "Unable to fetch deals right now. Please try again."
        )
        return
      }

      const nextProducts: Product[] = Array.isArray(data?.products) ? data.products : []
      setHasMore(nextProducts.length === RESULTS_PER_PAGE)
      setCurrentPage(page)
      if (!append) {
        setRecentSearches((prev) => {
          const normalized = q.trim()
          const withoutDuplicate = prev.filter(
            (entry) => entry.toLowerCase() !== normalized.toLowerCase()
          )
          return [normalized, ...withoutDuplicate].slice(0, 10)
        })
        if (userName) {
          void fetch("/api/search-history", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ query: q }),
          })
        }
      }
      setProducts((prev) => {
        if (!append) {
          return nextProducts
        }

        const seenUrls = new Set(prev.map((product) => product.url))
        const dedupedIncoming = nextProducts.filter((product) => !seenUrls.has(product.url))
        return [...prev, ...dedupedIncoming]
      })
    } catch {
      if (!append) {
        setProducts([])
      }
      setErrorMessage("Network error. Please check your connection and try again.")
    } finally {
      if (append) {
        setIsLoadingMore(false)
      } else {
        setIsLoading(false)
      }
    }
  }, [searchQuery, submittedQuery, userName])

  const handleSignIn = useCallback(async () => {
    if (typeof window === "undefined") return
    const name = window.prompt("Enter your name to sign in")
    if (!name) return
    const trimmed = name.trim()
    if (!trimmed) return

    try {
      const response = await fetch("/api/auth/sign-in", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userName: trimmed }),
      })
      if (!response.ok) {
        return
      }
      const data = await response.json().catch(() => null)
      setUserName(typeof data?.userName === "string" ? data.userName : trimmed)
    } catch {
      // Ignore failed sign in attempts in MVP mode.
    }
  }, [])

  const handleSignOut = useCallback(async () => {
    try {
      await fetch("/api/auth/sign-out", { method: "POST" })
    } finally {
      setUserName(null)
    }
  }, [])

  const handleToggleSavedDeal = useCallback((product: Product) => {
    setSavedDeals((prev) => {
      const exists = prev.some((saved) => saved.url === product.url)
      if (userName) {
        if (exists) {
          void fetch("/api/saved-deals", {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ url: product.url }),
          })
        } else {
          void fetch("/api/saved-deals", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ product }),
          })
        }
      }
      if (exists) {
        return prev.filter((saved) => saved.url !== product.url)
      }
      return [product, ...prev].slice(0, 50)
    })
  }, [userName])

  const handleClearHistory = useCallback(() => {
    setRecentSearches([])
    if (userName) {
      void fetch("/api/search-history", { method: "DELETE" })
    }
  }, [userName])

  const handleSortChange = useCallback((newSort: SortOption) => {
    setSortBy(newSort)
  }, [])

  const minPriceValue = Number.parseFloat(minPrice)
  const maxPriceValue = Number.parseFloat(maxPrice)

  const filteredProducts = products.filter((product) => {
    if (selectedStore !== "all" && product.store !== selectedStore) {
      return false
    }

    if (!Number.isNaN(minPriceValue) && product.price < minPriceValue) {
      return false
    }

    if (!Number.isNaN(maxPriceValue) && product.price > maxPriceValue) {
      return false
    }

    return true
  })

  const sortedProducts = sortProducts(filteredProducts, sortBy)
  const availableStores = useMemo(
    () => Array.from(new Set(products.map((product) => product.store))).sort(),
    [products]
  )
  const savedUrlSet = useMemo(() => new Set(savedDeals.map((deal) => deal.url)), [savedDeals])

  const handleRunSearchFromHistory = useCallback(
    (query: string) => {
      setSearchQuery(query)
      void handleSearch(query)
    },
    [handleSearch]
  )

  const clearFilters = useCallback(() => {
    setSelectedStore("all")
    setMinPrice("")
    setMaxPrice("")
  }, [])

  if (!isStorageReady) {
    return <div className="min-h-screen bg-background" />
  }

  return (
    <div className="min-h-screen bg-background">
      <SearchHeader
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onSearch={handleSearch}
        hasSearched={hasSearched}
        userName={userName}
        onSignIn={handleSignIn}
        onSignOut={handleSignOut}
      />

      {hasSearched && (
        <main className="container mx-auto px-4 py-6">
          <SavedAndHistory
            savedDeals={savedDeals}
            recentSearches={recentSearches}
            onRunSearch={handleRunSearchFromHistory}
            onRemoveSaved={handleToggleSavedDeal}
            onClearHistory={handleClearHistory}
          />
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <ProductCardSkeleton key={i} />
              ))}
            </div>
          ) : errorMessage ? (
            <ErrorState
              searchQuery={submittedQuery}
              message={errorMessage}
              onRetry={() => handleSearch(submittedQuery)}
            />
          ) : sortedProducts.length === 0 ? (
            <EmptyState searchQuery={submittedQuery} />
          ) : (
            <>
              <FilterBar
                sortBy={sortBy}
                onSortChange={handleSortChange}
                resultCount={sortedProducts.length}
                stores={availableStores}
                selectedStore={selectedStore}
                onStoreChange={setSelectedStore}
                minPrice={minPrice}
                maxPrice={maxPrice}
                onMinPriceChange={setMinPrice}
                onMaxPriceChange={setMaxPrice}
                onClearFilters={clearFilters}
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mt-6">
                {sortedProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    isSaved={savedUrlSet.has(product.url)}
                    onToggleSave={handleToggleSavedDeal}
                  />
                ))}
              </div>
              {hasMore && (
                <div className="mt-8 flex justify-center">
                  <Button
                    onClick={() => handleSearch(submittedQuery, currentPage + 1, true)}
                    disabled={isLoadingMore}
                    variant="outline"
                  >
                    {isLoadingMore ? "Loading..." : "Load more"}
                  </Button>
                </div>
              )}
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
