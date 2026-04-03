"use client"

import { ArrowDownNarrowWide, ArrowUpNarrowWide, Sparkles } from "lucide-react"

export type SortOption = "relevant" | "price-low" | "price-high"

interface FilterBarProps {
  sortBy: SortOption
  onSortChange: (sort: SortOption) => void
  resultCount: number
}

const SORT_OPTIONS = [
  { value: "relevant" as SortOption, label: "Most Relevant", icon: Sparkles },
  { value: "price-low" as SortOption, label: "Lowest Price", icon: ArrowDownNarrowWide },
  { value: "price-high" as SortOption, label: "Highest Price", icon: ArrowUpNarrowWide },
]

export function FilterBar({ sortBy, onSortChange, resultCount }: FilterBarProps) {
  return (
    <div className="flex flex-col gap-3 border-b border-border pb-4 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-muted-foreground">
        <span className="font-heading font-semibold text-foreground">{resultCount}</span>{" "}
        results found
      </p>
      <div className="flex items-center gap-1.5">
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
