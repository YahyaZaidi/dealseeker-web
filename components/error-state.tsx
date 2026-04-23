import { AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ErrorStateProps {
  message: string
  searchQuery?: string
  onRetry: () => void
}

export function ErrorState({ message, searchQuery, onRetry }: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-24 px-4 text-center">
      <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-muted">
        <AlertCircle className="h-10 w-10 text-destructive" />
      </div>
      <h2 className="font-heading text-2xl font-bold text-foreground mb-2">
        Something went wrong
      </h2>
      <p className="text-muted-foreground max-w-md mb-6">
        We couldn&apos;t load results for{" "}
        <span className="font-medium text-foreground">&ldquo;{searchQuery}&rdquo;</span>.
        <br />
        {message}
      </p>
      <Button onClick={onRetry}>Try again</Button>
    </div>
  )
}
