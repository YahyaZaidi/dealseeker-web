import { promises as fs } from "node:fs"
import path from "node:path"

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

interface DataStore {
  users: Record<string, UserData>
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
    const initial: DataStore = { users: {} }
    await fs.writeFile(STORE_FILE, JSON.stringify(initial, null, 2), "utf8")
  }
}

async function readStore(): Promise<DataStore> {
  await ensureStore()
  const raw = await fs.readFile(STORE_FILE, "utf8")
  const parsed = JSON.parse(raw) as DataStore
  if (!parsed.users || typeof parsed.users !== "object") {
    return { users: {} }
  }
  return parsed
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

