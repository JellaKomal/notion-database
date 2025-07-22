"use client"

import { useApp } from "../context/app-context"
import { SettingsPanel } from "./settings-panel"
import { TableView } from "./table-view"
import { Toolbar } from "./toolbar"
import { Button } from "./ui/button"
import { Settings } from "lucide-react"
import { useState } from "react"

export function NotionApp() {
  const { state } = useApp()
  const [showSettings, setShowSettings] = useState(false)

  if (!state.token || !state.databaseId || !state.database) {
    return (
      <div className="container mx-auto p-4">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Notion Database Viewer</h1>
          <Button variant="outline" size="sm" onClick={() => setShowSettings(true)}>
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </Button>
        </div>

        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">Configure your Notion API token and database ID to get started</p>
          <Button onClick={() => setShowSettings(true)}>Open Settings</Button>
        </div>

        <SettingsPanel open={showSettings} onOpenChange={setShowSettings} />
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold">{state.database.title[0]?.plain_text || "Untitled Database"}</h1>
        <Button variant="outline" size="sm" onClick={() => setShowSettings(true)}>
          <Settings className="w-4 h-4 mr-2" />
          Settings
        </Button>
      </div>

      <Toolbar />
      <TableView />
      <SettingsPanel open={showSettings} onOpenChange={setShowSettings} />
    </div>
  )
}
