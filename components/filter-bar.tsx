"use client"

import { ArrowDownNarrowWide, ArrowUpNarrowWide, Sparkles } from "lucide-react"

export type SortOption = "relevant" | "price-low" | "price-high"

interface FilterBarProps {
  sortBy: SortOption
  onSortChange: (sort: SortOption) => void
  resultCount: number
  stores: string[]
  selectedStore: string
  onStoreChange: (store: string) => void
  minPrice: string
  maxPrice: string
  onMinPriceChange: (value: string) => void
  onMaxPriceChange: (value: string) => void
  onClearFilters: () => void
}

const SORT_OPTIONS = [
  { value: "relevant" as SortOption, label: "Most Relevant", icon: Sparkles },
  { value: "price-low" as SortOption, label: "Lowest Price", icon: ArrowDownNarrowWide },
  { value: "price-high" as SortOption, label: "Highest Price", icon: ArrowUpNarrowWide },
]

export function FilterBar({
  sortBy,
  onSortChange,
  resultCount,
  stores,
  selectedStore,
  onStoreChange,
  minPrice,
  maxPrice,
  onMinPriceChange,
  onMaxPriceChange,
  onClearFilters,
}: FilterBarProps) {
  return (
    <div className="flex flex-col gap-4 border-b border-border pb-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted-foreground">
          <span className="font-heading font-semibold text-foreground">{resultCount}</span>{" "}
          results found
        </p>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Store:</span>
          <select
            className="h-8 rounded-md border border-border bg-background px-2 text-xs text-foreground"
            value={selectedStore}
            onChange={(e) => onStoreChange(e.target.value)}
          >
            <option value="all">All stores</option>
            {stores.map((store) => (
              <option key={store} value={store}>
                {store}
              </option>
            ))}
          </select>
          <button
            onClick={onClearFilters}
            className="h-8 rounded-md border border-border px-2 text-xs text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
          >
            Clear
          </button>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs text-muted-foreground">Price:</span>
        <input
          type="number"
          inputMode="decimal"
          min="0"
          placeholder="Min"
          value={minPrice}
          onChange={(e) => onMinPriceChange(e.target.value)}
          className="h-8 w-24 rounded-md border border-border bg-background px-2 text-xs text-foreground"
        />
        <span className="text-xs text-muted-foreground">to</span>
        <input
          type="number"
          inputMode="decimal"
          min="0"
          placeholder="Max"
          value={maxPrice}
          onChange={(e) => onMaxPriceChange(e.target.value)}
          className="h-8 w-24 rounded-md border border-border bg-background px-2 text-xs text-foreground"
        />
      </div>
      <div className="flex flex-wrap items-center gap-1.5">
        <span className="mr-1 text-xs text-muted-foreground">Sort:</span>
        {SORT_OPTIONS.map(({ value, label, icon: Icon }) => (
          <button
            key={value}
            onClick={() => onSortChange(value)}
            className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 font-heading text-xs font-semibold transition-colors ${
              sortBy === value
                ? "bg-primary text-white shadow-sm shadow-primary/30"
                : "bg-secondary text-secondary-foreground hover:bg-accent hover:text-accent-foreground"
            }`}
          >
            <Icon className="h-3.5 w-3.5" />
            {label}
          </button>
        ))}
      </div>
    </div>
  )
}
