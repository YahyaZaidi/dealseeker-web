import { promises as fs } from "node:fs"
import path from "node:path"
import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto"

interface StoredProduct {
  id: string
  name: string
  price: number
  image: string
  store: string
  url: string
}

interface UserData {
  savedDeals: StoredProduct[]
  searchHistory: string[]
}

interface AuthUser {
  email: string
  passwordHash: string
  passwordSalt: string
  createdAt: string
  emailVerified: boolean
  emailVerificationCodeHash: string | null
  emailVerificationCodeExpiresAt: string | null
  passwordResetCodeHash: string | null
  passwordResetCodeExpiresAt: string | null
  failedSignInAttempts: number
  lockUntil: string | null
}

interface DataStore {
  users: Record<string, UserData>
  accounts: Record<string, AuthUser>
}

const STORE_DIR = path.join(process.cwd(), ".data")
const STORE_FILE = path.join(STORE_DIR, "dealseeker-store.json")

function defaultUserData(): UserData {
  return {
    savedDeals: [],
    searchHistory: [],
  }
}

async function ensureStore() {
  await fs.mkdir(STORE_DIR, { recursive: true })
  try {
    await fs.access(STORE_FILE)
  } catch {
    const initial: DataStore = { users: {}, accounts: {} }
    await fs.writeFile(STORE_FILE, JSON.stringify(initial, null, 2), "utf8")
  }
}

async function readStore(): Promise<DataStore> {
  await ensureStore()
  const raw = await fs.readFile(STORE_FILE, "utf8")
  const parsed = JSON.parse(raw) as DataStore
  const users = parsed.users && typeof parsed.users === "object" ? parsed.users : {}
  const accounts =
    parsed.accounts && typeof parsed.accounts === "object" ? parsed.accounts : {}
  return { users, accounts }
}

async function writeStore(store: DataStore) {
  await ensureStore()
  await fs.writeFile(STORE_FILE, JSON.stringify(store, null, 2), "utf8")
}

export async function getUserData(userName: string): Promise<UserData> {
  const store = await readStore()
  return store.users[userName] ?? defaultUserData()
}

export async function setUserData(userName: string, userData: UserData) {
  const store = await readStore()
  store.users[userName] = userData
  await writeStore(store)
}

export async function getAccountByEmail(email: string): Promise<AuthUser | null> {
  const normalizedEmail = normalizeEmail(email)
  const store = await readStore()
  return store.accounts[normalizedEmail] ?? null
}

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase()
}

function hashPassword(password: string, salt: string): string {
  return scryptSync(password, salt, 64).toString("hex")
}

function hashCode(code: string): string {
  return scryptSync(code, "dealseeker-code-salt", 64).toString("hex")
}

function createSixDigitCode(): string {
  return String(Math.floor(100000 + Math.random() * 900000))
}

function futureIso(minutes: number): string {
  return new Date(Date.now() + minutes * 60 * 1000).toISOString()
}

function isExpired(isoDate: string | null): boolean {
  if (!isoDate) return true
  return new Date(isoDate).getTime() < Date.now()
}

function compareHash(expectedHex: string, actualHex: string): boolean {
  const expectedHash = Buffer.from(expectedHex, "hex")
  const actualHash = Buffer.from(actualHex, "hex")
  if (expectedHash.length !== actualHash.length) return false
  return timingSafeEqual(expectedHash, actualHash)
}

export async function createAccount(email: string, password: string): Promise<{
  ok: boolean
  verificationCode?: string
  error?: string
}> {
  const normalizedEmail = normalizeEmail(email)
  if (!normalizedEmail || !normalizedEmail.includes("@")) {
    return { ok: false, error: "Please enter a valid email address." }
  }
  if (password.length < 8) {
    return { ok: false, error: "Password must be at least 8 characters." }
  }

  const store = await readStore()
  if (store.accounts[normalizedEmail]) {
    return { ok: false, error: "An account with that email already exists." }
  }

  const salt = randomBytes(16).toString("hex")
  const passwordHash = hashPassword(password, salt)
  const verificationCode = createSixDigitCode()
  store.accounts[normalizedEmail] = {
    email: normalizedEmail,
    passwordHash,
    passwordSalt: salt,
    createdAt: new Date().toISOString(),
    emailVerified: false,
    emailVerificationCodeHash: hashCode(verificationCode),
    emailVerificationCodeExpiresAt: futureIso(15),
    passwordResetCodeHash: null,
    passwordResetCodeExpiresAt: null,
    failedSignInAttempts: 0,
    lockUntil: null,
  }
  if (!store.users[normalizedEmail]) {
    store.users[normalizedEmail] = defaultUserData()
  }
  await writeStore(store)
  return { ok: true, verificationCode }
}

export async function verifyAccount(
  email: string,
  password: string
): Promise<
  | { ok: true }
  | { ok: false; reason: "invalid_credentials" | "email_unverified" | "locked"; lockUntil?: string }
> {
  const normalizedEmail = normalizeEmail(email)
  const store = await readStore()
  const account = store.accounts[normalizedEmail]
  if (!account) return { ok: false, reason: "invalid_credentials" }

  if (account.lockUntil && new Date(account.lockUntil).getTime() > Date.now()) {
    return { ok: false, reason: "locked", lockUntil: account.lockUntil }
  }

  const isPasswordMatch = compareHash(
    account.passwordHash,
    hashPassword(password, account.passwordSalt)
  )

  if (!isPasswordMatch) {
    account.failedSignInAttempts += 1
    if (account.failedSignInAttempts >= 5) {
      account.lockUntil = futureIso(15)
      account.failedSignInAttempts = 0
    }
    store.accounts[normalizedEmail] = account
    await writeStore(store)
    return { ok: false, reason: "invalid_credentials" }
  }

  account.failedSignInAttempts = 0
  account.lockUntil = null
  store.accounts[normalizedEmail] = account
  await writeStore(store)

  if (!account.emailVerified) {
    return { ok: false, reason: "email_unverified" }
  }

  return { ok: true }
}

export async function issueEmailVerificationCode(email: string): Promise<{
  ok: boolean
  verificationCode?: string
  error?: string
}> {
  const normalizedEmail = normalizeEmail(email)
  const store = await readStore()
  const account = store.accounts[normalizedEmail]
  if (!account) {
    return { ok: false, error: "No account found for that email." }
  }

  const verificationCode = createSixDigitCode()
  account.emailVerificationCodeHash = hashCode(verificationCode)
  account.emailVerificationCodeExpiresAt = futureIso(15)
  store.accounts[normalizedEmail] = account
  await writeStore(store)
  return { ok: true, verificationCode }
}

export async function confirmEmailVerification(
  email: string,
  code: string
): Promise<{ ok: boolean; error?: string }> {
  const normalizedEmail = normalizeEmail(email)
  const store = await readStore()
  const account = store.accounts[normalizedEmail]
  if (!account) {
    return { ok: false, error: "No account found for that email." }
  }
  if (!account.emailVerificationCodeHash || isExpired(account.emailVerificationCodeExpiresAt)) {
    return { ok: false, error: "Verification code expired. Request a new one." }
  }

  const codeMatches = compareHash(account.emailVerificationCodeHash, hashCode(code))
  if (!codeMatches) {
    return { ok: false, error: "Invalid verification code." }
  }

  account.emailVerified = true
  account.emailVerificationCodeHash = null
  account.emailVerificationCodeExpiresAt = null
  store.accounts[normalizedEmail] = account
  await writeStore(store)
  return { ok: true }
}

export async function issuePasswordResetCode(email: string): Promise<{
  ok: boolean
  resetCode?: string
  error?: string
}> {
  const normalizedEmail = normalizeEmail(email)
  const store = await readStore()
  const account = store.accounts[normalizedEmail]
  if (!account) {
    return { ok: false, error: "No account found for that email." }
  }

  const resetCode = createSixDigitCode()
  account.passwordResetCodeHash = hashCode(resetCode)
  account.passwordResetCodeExpiresAt = futureIso(15)
  store.accounts[normalizedEmail] = account
  await writeStore(store)
  return { ok: true, resetCode }
}

export async function resetPasswordWithCode(
  email: string,
  code: string,
  newPassword: string
): Promise<{ ok: boolean; error?: string }> {
  const normalizedEmail = normalizeEmail(email)
  if (newPassword.length < 8) {
    return { ok: false, error: "Password must be at least 8 characters." }
  }

  const store = await readStore()
  const account = store.accounts[normalizedEmail]
  if (!account) {
    return { ok: false, error: "No account found for that email." }
  }

  if (!account.passwordResetCodeHash || isExpired(account.passwordResetCodeExpiresAt)) {
    return { ok: false, error: "Reset code expired. Request a new one." }
  }

  const codeMatches = compareHash(account.passwordResetCodeHash, hashCode(code))
  if (!codeMatches) {
    return { ok: false, error: "Invalid reset code." }
  }

  const salt = randomBytes(16).toString("hex")
  account.passwordSalt = salt
  account.passwordHash = hashPassword(newPassword, salt)
  account.passwordResetCodeHash = null
  account.passwordResetCodeExpiresAt = null
  account.failedSignInAttempts = 0
  account.lockUntil = null
  store.accounts[normalizedEmail] = account
  await writeStore(store)
  return { ok: true }
}

