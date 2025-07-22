import type { UIPreferences, TableView } from "../types/notion"

interface StoredData {
  token: string
  databaseId: string
  uiPreferences: UIPreferences
  views: TableView[]
}

export function loadFromStorage(): Partial<StoredData> {
  if (typeof window === "undefined") return {}

  try {
    const stored = localStorage.getItem("notion-app-data")
    return stored ? JSON.parse(stored) : {}
  } catch {
    return {}
  }
}

export function saveToStorage(data: Partial<StoredData>) {
  if (typeof window === "undefined") return

  try {
    const existing = loadFromStorage()
    const updated = { ...existing, ...data }
    localStorage.setItem("notion-app-data", JSON.stringify(updated))
  } catch (error) {
    console.error("Failed to save to localStorage:", error)
  }
}

export function clearStorage() {
  if (typeof window === "undefined") return
  localStorage.removeItem("notion-app-data")
}
