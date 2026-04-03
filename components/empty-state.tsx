import { SearchX } from "lucide-react"

interface EmptyStateProps {
  searchQuery?: string
}

export function EmptyState({ searchQuery }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-24 px-4 text-center">
      <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-muted">
        <SearchX className="h-10 w-10 text-muted-foreground" />
      </div>
      <h2 className="font-heading text-2xl font-bold text-foreground mb-2">
        No results found
      </h2>
      <p className="text-muted-foreground max-w-sm">
        We couldn&apos;t find any deals matching{" "}
        <span className="font-medium text-foreground">&ldquo;{searchQuery}&rdquo;</span>.
        Try a different search term or check your spelling.
      </p>
    </div>
  )
}
