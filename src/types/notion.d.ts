export interface NotionProperty {
  id: string
  name: string
  type: "title" | "rich_text" | "select" | "multi_select" | "date" | "checkbox" | "number" | "url" | "email"
  select?: {
    options: Array<{ id: string; name: string; color: string }>
  }
  multi_select?: {
    options: Array<{ id: string; name: string; color: string }>
  }
}

export interface NotionDatabase {
  id: string
  title: Array<{ plain_text: string }>
  properties: Record<string, NotionProperty>
}

export interface NotionPropertyValue {
  id: string
  type: string
  title?: Array<{ plain_text: string }>
  rich_text?: Array<{ plain_text: string }>
  select?: { id: string; name: string; color: string } | null
  multi_select?: Array<{ id: string; name: string; color: string }>
  date?: { start: string; end?: string } | null
  checkbox?: boolean
  number?: number | null
  url?: string | null
  email?: string | null
}

export interface NotionRow {
  id: string
  properties: Record<string, NotionPropertyValue>
  created_time: string
  last_edited_time: string
}

export interface TableView {
  id: string
  name: string
  sortBy: { property: string; direction: "asc" | "desc" } | null
  filters: Array<{ property: string; condition: string; value: string }>
  hiddenColumns: string[]
  searchQuery: string
}

export interface UIPreferences {
  darkMode: boolean
  compactMode: boolean
  hiddenColumns: string[]
  sortBy: { property: string; direction: "asc" | "desc" } | null
  filters: Array<{ property: string; condition: string; value: string }>
  searchQuery: string
  currentView: string | null
  pageSize: number
  currentPage: number
}

export interface AppState {
  token: string
  databaseId: string
  database: NotionDatabase | null
  rows: NotionRow[]
  loading: boolean
  error: string | null
  uiPreferences: UIPreferences
  views: TableView[]
}

export type AppAction =
  | { type: "SET_TOKEN"; payload: string }
  | { type: "SET_DATABASE_ID"; payload: string }
  | { type: "SET_DATABASE"; payload: NotionDatabase }
  | { type: "SET_ROWS"; payload: NotionRow[] }
  | { type: "ADD_ROW"; payload: NotionRow }
  | { type: "UPDATE_ROW"; payload: NotionRow }
  | { type: "DELETE_ROW"; payload: string }
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_ERROR"; payload: string | null }
  | { type: "UPDATE_UI_PREFERENCES"; payload: Partial<UIPreferences> }
  | { type: "ADD_VIEW"; payload: TableView }
  | { type: "UPDATE_VIEW"; payload: TableView }
  | { type: "DELETE_VIEW"; payload: string }
  | { type: "SET_CURRENT_VIEW"; payload: string | null }
  | { type: "CLEAR_DATA" }

export interface NotionConfig {
  token: string
  databaseId: string
}

export interface CreatePropertyRequest {
  name: string
  type: string
  selectOptions?: Array<{ name: string; color: string }>
}
