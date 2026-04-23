"use client"

import { useState } from "react"
import { Search, Zap } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

const SUGGESTIONS = ["iPhone 16", "PS5", "MacBook Air", "Samsung TV", "AirPods Pro"]
type AuthMode =
  | "sign-in"
  | "sign-up"
  | "verify-email"
  | "request-email-verification"
  | "forgot-password"
  | "reset-password"

interface SearchHeaderProps {
  searchQuery: string
  onSearchChange: (query: string) => void
  onSearch: (queryOverride?: string) => void
  hasSearched: boolean
  userEmail: string | null
  onAuthSubmit: (payload: {
    mode: AuthMode
    email: string
    password?: string
    code?: string
    newPassword?: string
  }) => Promise<{
    ok: boolean
    error?: string
    reason?: string
    devVerificationCode?: string
    devResetCode?: string
  }>
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
  userEmail,
  onAuthSubmit,
  onSignOut,
}: SearchHeaderProps) {
  const [isAuthOpen, setIsAuthOpen] = useState(false)
  const [authMode, setAuthMode] = useState<AuthMode>("sign-in")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [code, setCode] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [authError, setAuthError] = useState<string | null>(null)
  const [authHint, setAuthHint] = useState<string | null>(null)
  const [isSubmittingAuth, setIsSubmittingAuth] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSearch()
  }

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setAuthError(null)
    setAuthHint(null)
    setIsSubmittingAuth(true)
    const submitMode = authMode === "request-email-verification" ? "request-email-verification" : authMode
    const result = await onAuthSubmit(
      submitMode === "sign-in" || submitMode === "sign-up"
        ? { mode: submitMode, email, password }
        : submitMode === "request-email-verification"
          ? { mode: submitMode, email }
        : authMode === "verify-email"
          ? { mode: authMode, email, code }
          : authMode === "forgot-password"
            ? { mode: authMode, email }
            : { mode: authMode, email, code, newPassword }
    )
    setIsSubmittingAuth(false)
    if (!result.ok) {
      setAuthError(result.error ?? "Authentication failed.")
      if (result.reason === "email_unverified") {
        setAuthMode("verify-email")
      }
      return
    }

    if (authMode === "sign-up") {
      setAuthMode("verify-email")
      setAuthHint(
        result.devVerificationCode
          ? `Verification code (dev): ${result.devVerificationCode}`
          : "Verification email sent. Enter your code."
      )
      return
    }

    if (authMode === "request-email-verification") {
      setAuthMode("verify-email")
      setAuthHint(
        result.devVerificationCode
          ? `Verification code (dev): ${result.devVerificationCode}`
          : "Verification code sent."
      )
      return
    }

    if (authMode === "forgot-password") {
      setAuthMode("reset-password")
      setAuthHint(
        result.devResetCode ? `Reset code (dev): ${result.devResetCode}` : "Reset code sent."
      )
      return
    }

    if (authMode === "reset-password") {
      setAuthMode("sign-in")
      setPassword("")
      setCode("")
      setNewPassword("")
      setAuthHint("Password reset complete. Sign in with your new password.")
      return
    }

    setIsAuthOpen(false)
    setPassword("")
    setCode("")
    setNewPassword("")
  }

  const displayName = userEmail?.split("@")[0] ?? null

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
        {userEmail ? (
          <div className="flex items-center gap-2">
            <span className="hidden text-xs text-muted-foreground sm:inline">
              Signed in as <span className="text-foreground">{displayName}</span>
            </span>
            <Button type="button" variant="outline" size="sm" onClick={onSignOut}>
              Sign out
            </Button>
          </div>
        ) : (
          <Button type="button" variant="outline" size="sm" onClick={() => setIsAuthOpen(true)}>
            Sign in
          </Button>
        )}
      </div>
      <Dialog open={isAuthOpen} onOpenChange={setIsAuthOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {authMode === "sign-in"
                ? "Sign in"
                : authMode === "sign-up"
                  ? "Create account"
                  : authMode === "verify-email"
                    ? "Verify your email"
                    : authMode === "forgot-password"
                      ? "Forgot password"
                      : "Reset password"}
            </DialogTitle>
            <DialogDescription>
              {authMode === "sign-in" && "Sign in with your customer email and password."}
              {authMode === "sign-up" && "Create an account with your customer email."}
              {authMode === "verify-email" &&
                "Enter the 6-digit verification code sent to your email."}
              {authMode === "request-email-verification" &&
                "Request a fresh email verification code."}
              {authMode === "forgot-password" &&
                "Request a one-time reset code sent to your email."}
              {authMode === "reset-password" &&
                "Enter your reset code and choose a new password."}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAuthSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm text-muted-foreground">Email</label>
              <Input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@example.com"
                required
              />
            </div>
            {(authMode === "sign-in" || authMode === "sign-up") && (
              <div className="space-y-1.5">
                <label className="text-sm text-muted-foreground">Password</label>
                <Input
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="At least 8 characters"
                  required
                  minLength={8}
                />
              </div>
            )}
            {(authMode === "verify-email" || authMode === "reset-password") && (
              <div className="space-y-1.5">
                <label className="text-sm text-muted-foreground">Code</label>
                <Input
                  type="text"
                  value={code}
                  onChange={(event) => setCode(event.target.value)}
                  placeholder="6-digit code"
                  required
                />
              </div>
            )}
            {authMode === "reset-password" && (
              <div className="space-y-1.5">
                <label className="text-sm text-muted-foreground">New password</label>
                <Input
                  type="password"
                  value={newPassword}
                  onChange={(event) => setNewPassword(event.target.value)}
                  placeholder="At least 8 characters"
                  required
                  minLength={8}
                />
              </div>
            )}
            {authHint && <p className="text-sm text-primary">{authHint}</p>}
            {authError && <p className="text-sm text-destructive">{authError}</p>}
            <div className="flex items-center justify-between gap-2">
              <div className="flex flex-wrap items-center gap-3 text-sm">
                {(authMode === "sign-in" || authMode === "sign-up") && (
                  <button
                    type="button"
                    className="text-primary underline-offset-4 hover:underline"
                    onClick={() => setAuthMode((prev) => (prev === "sign-in" ? "sign-up" : "sign-in"))}
                  >
                    {authMode === "sign-in"
                      ? "Need an account? Sign up"
                      : "Already have an account? Sign in"}
                  </button>
                )}
                {authMode === "sign-in" && (
                  <button
                    type="button"
                    className="text-primary underline-offset-4 hover:underline"
                    onClick={() => setAuthMode("forgot-password")}
                  >
                    Forgot password?
                  </button>
                )}
                {authMode === "verify-email" && (
                  <button
                    type="button"
                    className="text-primary underline-offset-4 hover:underline"
                    onClick={() => setAuthMode("request-email-verification")}
                  >
                    Need a new code?
                  </button>
                )}
                {(authMode === "request-email-verification" ||
                  authMode === "forgot-password" ||
                  authMode === "reset-password") && (
                  <button
                    type="button"
                    className="text-primary underline-offset-4 hover:underline"
                    onClick={() => setAuthMode("sign-in")}
                  >
                    Back to sign in
                  </button>
                )}
              </div>
              <Button type="submit" disabled={isSubmittingAuth}>
                {isSubmittingAuth
                  ? "Please wait..."
                  : authMode === "sign-in"
                    ? "Sign in"
                    : authMode === "sign-up"
                      ? "Sign up"
                      : authMode === "verify-email"
                        ? "Verify email"
                        : authMode === "request-email-verification"
                          ? "Send verification code"
                        : authMode === "forgot-password"
                          ? "Send reset code"
                          : "Reset password"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </header>
  )
}
