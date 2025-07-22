"use client"

import type React from "react"
import { createContext, useContext, useReducer, useEffect } from "react"
import type { AppState, AppAction, TableView } from "../types/notion"
import { loadFromStorage, saveToStorage } from "../lib/storage"
import { notionService } from "../lib/notion"

const initialState: AppState = {
  token: "",
  databaseId: "",
  database: null,
  rows: [],
  loading: false,
  error: null,
  uiPreferences: {
    darkMode: false,
    compactMode: false,
    hiddenColumns: [],
    sortBy: null,
    filters: [],
    searchQuery: "",
    currentView: null,
    pageSize: 25,
    currentPage: 1,
  },
  views: [
    {
      id: "default",
      name: "All Items",
      sortBy: null,
      filters: [],
      hiddenColumns: [],
      searchQuery: "",
    },
  ],
}

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case "SET_TOKEN":
      return { ...state, token: action.payload }
    case "SET_DATABASE_ID":
      return { ...state, databaseId: action.payload }
    case "SET_DATABASE":
      return { ...state, database: action.payload }
    case "SET_ROWS":
      return { ...state, rows: action.payload }
    case "ADD_ROW":
      return { ...state, rows: [...state.rows, action.payload] }
    case "UPDATE_ROW":
      return {
        ...state,
        rows: state.rows.map((row) => (row.id === action.payload.id ? action.payload : row)),
      }
    case "DELETE_ROW":
      return {
        ...state,
        rows: state.rows.filter((row) => row.id !== action.payload),
      }
    case "SET_LOADING":
      return { ...state, loading: action.payload }
    case "SET_ERROR":
      return { ...state, error: action.payload }
    case "UPDATE_UI_PREFERENCES":
      return {
        ...state,
        uiPreferences: { ...state.uiPreferences, ...action.payload },
      }
    case "ADD_VIEW":
      return {
        ...state,
        views: [...state.views, action.payload],
      }
    case "UPDATE_VIEW":
      return {
        ...state,
        views: state.views.map((view) => (view.id === action.payload.id ? action.payload : view)),
      }
    case "DELETE_VIEW":
      return {
        ...state,
        views: state.views.filter((view) => view.id !== action.payload),
        uiPreferences: {
          ...state.uiPreferences,
          currentView: state.uiPreferences.currentView === action.payload ? null : state.uiPreferences.currentView,
        },
      }
    case "SET_CURRENT_VIEW":
      const selectedView = action.payload ? state.views.find((v) => v.id === action.payload) : null
      return {
        ...state,
        uiPreferences: {
          ...state.uiPreferences,
          currentView: action.payload,
          ...(selectedView && {
            sortBy: selectedView.sortBy,
            filters: selectedView.filters,
            hiddenColumns: selectedView.hiddenColumns,
            searchQuery: selectedView.searchQuery,
          }),
        },
      }
    case "CLEAR_DATA":
      return { ...initialState }
    default:
      return state
  }
}

const AppContext = createContext<{
  state: AppState
  dispatch: React.Dispatch<AppAction>
  loadDatabase: () => Promise<void>
  validateConnection: () => Promise<boolean>
  saveCurrentAsView: (name: string) => void
  applyView: (viewId: string) => void
} | null>(null)

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState)

  useEffect(() => {
    // Load from localStorage on mount
    const stored = loadFromStorage()
    if (stored.token) dispatch({ type: "SET_TOKEN", payload: stored.token })
    if (stored.databaseId) dispatch({ type: "SET_DATABASE_ID", payload: stored.databaseId })
    if (stored.uiPreferences) {
      dispatch({ type: "UPDATE_UI_PREFERENCES", payload: stored.uiPreferences })
    }
    if (stored.views) {
      stored.views.forEach((view) => dispatch({ type: "ADD_VIEW", payload: view }))
    }
  }, [])

  useEffect(() => {
    // Save to localStorage when state changes
    saveToStorage({
      token: state.token,
      databaseId: state.databaseId,
      uiPreferences: state.uiPreferences,
      views: state.views.filter((v) => v.id !== "default"), // Don't save default view
    })
  }, [state.token, state.databaseId, state.uiPreferences, state.views])

  const validateConnection = async (): Promise<boolean> => {
    if (!state.token || !state.databaseId) return false

    try {
      dispatch({ type: "SET_LOADING", payload: true })
      dispatch({ type: "SET_ERROR", payload: null })

      // Initialize the service with current config
      notionService.initialize({
        token: state.token,
        databaseId: state.databaseId,
      })

      const result = await notionService.testConnection()

      if (result.isConnected) {
        const database = await notionService.getDatabase()
        if (database) {
          dispatch({ type: "SET_DATABASE", payload: database })
        }
        return true
      } else {
        dispatch({ type: "SET_ERROR", payload: result.error || "Connection failed" })
        return false
      }
    } catch (error) {
      dispatch({ type: "SET_ERROR", payload: error instanceof Error ? error.message : "Connection failed" })
      return false
    } finally {
      dispatch({ type: "SET_LOADING", payload: false })
    }
  }

  const loadDatabase = async () => {
    if (!state.token || !state.databaseId) return

    try {
      dispatch({ type: "SET_LOADING", payload: true })
      dispatch({ type: "SET_ERROR", payload: null })

      // Initialize the service with current config
      notionService.initialize({
        token: state.token,
        databaseId: state.databaseId,
      })

      const [database, rows] = await Promise.all([notionService.getDatabase(), notionService.queryPages()])

      if (database) {
        dispatch({ type: "SET_DATABASE", payload: database })
      }
      dispatch({ type: "SET_ROWS", payload: rows })
    } catch (error) {
      dispatch({ type: "SET_ERROR", payload: error instanceof Error ? error.message : "Failed to load database" })
    } finally {
      dispatch({ type: "SET_LOADING", payload: false })
    }
  }

  const saveCurrentAsView = (name: string) => {
    const newView: TableView = {
      id: Date.now().toString(),
      name,
      sortBy: state.uiPreferences.sortBy,
      filters: state.uiPreferences.filters,
      hiddenColumns: state.uiPreferences.hiddenColumns,
      searchQuery: state.uiPreferences.searchQuery,
    }
    dispatch({ type: "ADD_VIEW", payload: newView })
  }

  const applyView = (viewId: string) => {
    dispatch({ type: "SET_CURRENT_VIEW", payload: viewId })
  }

  return (
    <AppContext.Provider value={{ state, dispatch, loadDatabase, validateConnection, saveCurrentAsView, applyView }}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error("useApp must be used within AppProvider")
  }
  return context
}
