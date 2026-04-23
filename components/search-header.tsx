"use client"

import { Search, Zap } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

const SUGGESTIONS = ["iPhone 16", "PS5", "MacBook Air", "Samsung TV", "AirPods Pro"]

interface SearchHeaderProps {
  searchQuery: string
  onSearchChange: (query: string) => void
  onSearch: (queryOverride?: string) => void
  hasSearched: boolean
  userName: string | null
  onSignIn: () => void
  onSignOut: () => void
}

function Logo({ size = "lg" }: { size?: "sm" | "lg" }) {
  if (size === "sm") {
    return (
      <div className="flex shrink-0 items-center gap-2">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary shadow-md shadow-primary/40">
          <Zap className="h-4 w-4 fill-white text-white" />
        </div>
        <span className="font-heading text-lg font-bold tracking-tight">
          Deal<span className="text-primary">seeker</span>
        </span>
      </div>
    )
  }
  return (
    <div className="flex items-center justify-center gap-3 mb-6">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary shadow-xl shadow-primary/40">
        <Zap className="h-8 w-8 fill-white text-white" />
      </div>
      <span className="font-heading text-5xl font-extrabold tracking-tight">
        Deal<span className="text-primary">seeker</span>
      </span>
    </div>
  )
}

export function SearchHeader({
  searchQuery,
  onSearchChange,
  onSearch,
  hasSearched,
  userName,
  onSignIn,
  onSignOut,
}: SearchHeaderProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSearch()
  }

  if (!hasSearched) {
    return (
      <section className="relative flex min-h-[62vh] flex-col items-center justify-center overflow-hidden px-4">
        {/* Radial orange glow from top */}
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-3/4"
          style={{
            background:
              "radial-gradient(ellipse 90% 70% at 50% -10%, oklch(0.65 0.22 45 / 0.28), transparent)",
          }}
        />
        {/* Dot grid texture */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage:
              "radial-gradient(circle, #FF6B00 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />

        <div className="relative z-10 w-full max-w-2xl text-center">
          <Logo size="lg" />

          <p className="font-heading text-xl font-semibold text-foreground/80 mb-2">
            Hunt down the best prices in New Zealand
          </p>
          <p className="text-muted-foreground mb-10 text-sm">
            PB Tech · Mighty Ape · Harvey Norman · Noel Leeming · JB Hi-Fi and more
          </p>

          <form onSubmit={handleSubmit} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="text"
                placeholder="What deal are you hunting for?"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="h-14 border-border bg-card pl-12 text-base placeholder:text-muted-foreground/60 focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/25"
                autoFocus
              />
            </div>
            <Button
              type="submit"
              className="h-14 bg-primary px-8 font-heading text-base font-semibold tracking-wide shadow-lg shadow-primary/30 hover:bg-primary/90"
            >
              Search
            </Button>
          </form>

          <div className="mt-5 flex flex-wrap justify-center gap-2">
            <span className="text-xs text-muted-foreground mr-1 self-center">Try:</span>
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => {
                  onSearchChange(s)
                  onSearch(s)
                }}
                className="rounded-full border border-border bg-card/50 px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:border-primary/60 hover:text-primary"
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </section>
    )
  }

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/90 backdrop-blur-md">
      <div className="container mx-auto flex items-center gap-4 px-4 py-3">
        <Logo size="sm" />
        <form onSubmit={handleSubmit} className="flex flex-1 gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search for a product..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="border-border bg-card pl-9 focus-visible:border-primary focus-visible:ring-primary/25"
            />
          </div>
          <Button
            type="submit"
            className="bg-primary font-heading font-semibold shadow-sm shadow-primary/30 hover:bg-primary/90"
          >
            Search
          </Button>
        </form>
        {userName ? (
          <div className="flex items-center gap-2">
            <span className="hidden text-xs text-muted-foreground sm:inline">
              Signed in as <span className="text-foreground">{userName}</span>
            </span>
            <Button type="button" variant="outline" size="sm" onClick={onSignOut}>
              Sign out
            </Button>
          </div>
        ) : (
          <Button type="button" variant="outline" size="sm" onClick={onSignIn}>
            Sign in
          </Button>
        )}
      </div>
    </header>
  )
}
