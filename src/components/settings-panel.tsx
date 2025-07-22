"use client"

import { useState } from "react"
import { useApp } from "../context/app-context"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import { Switch } from "./ui/switch"
import { Textarea } from "./ui/textarea"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "./ui/sheet"
import { useToast } from "../hooks/use-toast"
import { clearStorage } from "../lib/storage"
import { CorsNotice } from "./cors-notice"
import { Loader2, CheckCircle, XCircle, AlertTriangle } from "lucide-react"

interface SettingsPanelProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function SettingsPanel({ open, onOpenChange }: SettingsPanelProps) {
  const { state, dispatch, validateConnection, loadDatabase } = useApp()
  const { toast } = useToast()
  const [tempToken, setTempToken] = useState(state.token)
  const [tempDatabaseId, setTempDatabaseId] = useState(state.databaseId)
  const [testing, setTesting] = useState(false)
  const [testResult, setTestResult] = useState<"success" | "error" | null>(null)
  const [showCorsNotice, setShowCorsNotice] = useState(false)

  const handleSave = () => {
    dispatch({ type: "SET_TOKEN", payload: tempToken })
    dispatch({ type: "SET_DATABASE_ID", payload: tempDatabaseId })
    toast({
      title: "Settings saved",
      description: "Your configuration has been saved to localStorage",
    })
  }

  const handleTest = async () => {
    if (!tempToken || !tempDatabaseId) {
      toast({
        title: "Missing configuration",
        description: "Please provide both token and database ID",
        variant: "destructive",
      })
      return
    }

    setTesting(true)
    setTestResult(null)

    // Temporarily set values for testing
    dispatch({ type: "SET_TOKEN", payload: tempToken })
    dispatch({ type: "SET_DATABASE_ID", payload: tempDatabaseId })

    const success = await validateConnection()
    setTestResult(success ? "success" : "error")
    setTesting(false)

    if (success) {
      toast({
        title: "Connection successful",
        description: "Successfully connected to your Notion database",
      })
      await loadDatabase()
    } else {
      // Check if it's a CORS error
      if (state.error?.includes("CORS") || state.error?.includes("blocked")) {
        setShowCorsNotice(true)
      }
      toast({
        title: "Connection failed",
        description: state.error || "Failed to connect to Notion",
        variant: "destructive",
      })
    }
  }

  const handleClear = () => {
    clearStorage()
    dispatch({ type: "CLEAR_DATA" })
    setTempToken("")
    setTempDatabaseId("")
    setTestResult(null)
    toast({
      title: "Data cleared",
      description: "All stored data has been cleared",
    })
  }

  const toggleDarkMode = (enabled: boolean) => {
    dispatch({
      type: "UPDATE_UI_PREFERENCES",
      payload: { darkMode: enabled },
    })
    document.documentElement.classList.toggle("dark", enabled)
  }

  const toggleCompactMode = (enabled: boolean) => {
    dispatch({
      type: "UPDATE_UI_PREFERENCES",
      payload: { compactMode: enabled },
    })
  }

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent className="w-[400px] sm:w-[540px]">
          <SheetHeader>
            <SheetTitle>Settings</SheetTitle>
            <SheetDescription>Configure your Notion integration and app preferences</SheetDescription>
          </SheetHeader>

          <div className="space-y-6 mt-6">
            {/* CORS Warning */}
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-amber-800">CORS Setup Required</h4>
                  <p className="text-sm text-amber-700 mt-1">
                    This app makes direct API calls to Notion. You may need to disable CORS in your browser.
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-2 bg-transparent"
                    onClick={() => setShowCorsNotice(true)}
                  >
                    Setup Instructions
                  </Button>
                </div>
              </div>
            </div>

            {/* API Configuration */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Notion API Configuration</h3>

              <div className="space-y-2">
                <Label htmlFor="token">API Token</Label>
                <Textarea
                  id="token"
                  placeholder="secret_..."
                  value={tempToken}
                  onChange={(e) => setTempToken(e.target.value)}
                  className="min-h-[80px] text-sm"
                />
                <p className="text-xs text-muted-foreground">
                  Create an internal integration at notion.so/my-integrations
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="database-id">Database ID</Label>
                <Input
                  id="database-id"
                  placeholder="32-character database ID"
                  value={tempDatabaseId}
                  onChange={(e) => setTempDatabaseId(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">Found in your database URL after the last slash</p>
              </div>

              <div className="flex gap-2">
                <Button onClick={handleTest} disabled={testing} className="flex-1">
                  {testing ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : testResult === "success" ? (
                    <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                  ) : testResult === "error" ? (
                    <XCircle className="w-4 h-4 mr-2 text-red-500" />
                  ) : null}
                  Test Connection
                </Button>
                <Button onClick={handleSave} variant="outline">
                  Save
                </Button>
              </div>
            </div>

            {/* UI Preferences */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">UI Preferences</h3>

              <div className="flex items-center justify-between">
                <Label htmlFor="dark-mode">Dark Mode</Label>
                <Switch id="dark-mode" checked={state.uiPreferences.darkMode} onCheckedChange={toggleDarkMode} />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="compact-mode">Compact Mode</Label>
                <Switch
                  id="compact-mode"
                  checked={state.uiPreferences.compactMode}
                  onCheckedChange={toggleCompactMode}
                />
              </div>
            </div>

            {/* Data Management */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Data Management</h3>
              <Button onClick={handleClear} variant="destructive" className="w-full">
                Clear All Data
              </Button>
              <p className="text-xs text-muted-foreground">
                This will clear all stored tokens, preferences, and cached data
              </p>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      <CorsNotice open={showCorsNotice} onOpenChange={setShowCorsNotice} />
    </>
  )
}
