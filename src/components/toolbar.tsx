"use client"

import { useState } from "react"
import { useApp } from "../context/app-context"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
  DropdownMenuSeparator,
} from "./ui/dropdown-menu"
import { ColumnManager } from "./column-manager"
import { ViewManager } from "./view-manager"
import { Search, SortAsc, SortDesc, Eye, Plus, LayoutGrid } from "lucide-react"

export function Toolbar() {
  const { state, dispatch, loadDatabase, applyView } = useApp()
  const [searchValue, setSearchValue] = useState(state.uiPreferences.searchQuery)
  const [showColumnManager, setShowColumnManager] = useState(false)
  const [showViewManager, setShowViewManager] = useState(false)

  if (!state.database) return null

  const properties = Object.entries(state.database.properties)
  const currentView = state.views.find((v) => v.id === state.uiPreferences.currentView) || state.views[0]

  const handleSearch = (value: string) => {
    setSearchValue(value)
    dispatch({
      type: "UPDATE_UI_PREFERENCES",
      payload: { searchQuery: value },
    })
  }

  const handleSort = (property: string, direction: "asc" | "desc") => {
    dispatch({
      type: "UPDATE_UI_PREFERENCES",
      payload: { sortBy: { property, direction } },
    })
  }

  const toggleColumnVisibility = (columnKey: string) => {
    const hiddenColumns = state.uiPreferences.hiddenColumns
    const newHiddenColumns = hiddenColumns.includes(columnKey)
      ? hiddenColumns.filter((key) => key !== columnKey)
      : [...hiddenColumns, columnKey]

    dispatch({
      type: "UPDATE_UI_PREFERENCES",
      payload: { hiddenColumns: newHiddenColumns },
    })
  }

  return (
    <>
      <div className={`flex flex-wrap items-center gap-3 mb-4 ${state.uiPreferences.compactMode ? "py-1" : "py-2"}`}>
        {/* Views Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size={state.uiPreferences.compactMode ? "sm" : "default"}>
              <LayoutGrid className="w-4 h-4 mr-2" />
              {currentView.name}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            {state.views.map((view) => (
              <DropdownMenuItem
                key={view.id}
                onClick={() => applyView(view.id)}
                className={state.uiPreferences.currentView === view.id ? "bg-accent" : ""}
              >
                {view.name}
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => setShowViewManager(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Manage Views
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search rows..."
            value={searchValue}
            onChange={(e) => handleSearch(e.target.value)}
            className={`pl-10 ${state.uiPreferences.compactMode ? "h-8 text-sm" : ""}`}
          />
        </div>

        {/* Sort */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size={state.uiPreferences.compactMode ? "sm" : "default"}>
              {state.uiPreferences.sortBy ? (
                state.uiPreferences.sortBy.direction === "asc" ? (
                  <SortAsc className="w-4 h-4 mr-2" />
                ) : (
                  <SortDesc className="w-4 h-4 mr-2" />
                )
              ) : (
                <SortAsc className="w-4 h-4 mr-2" />
              )}
              Sort
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            {properties.map(([key, property]) => (
              <div key={key}>
                <DropdownMenuItem onClick={() => handleSort(key, "asc")}>
                  <SortAsc className="w-4 h-4 mr-2" />
                  {property.name} (A-Z)
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleSort(key, "desc")}>
                  <SortDesc className="w-4 h-4 mr-2" />
                  {property.name} (Z-A)
                </DropdownMenuItem>
              </div>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Column Visibility */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size={state.uiPreferences.compactMode ? "sm" : "default"}>
              <Eye className="w-4 h-4 mr-2" />
              Columns
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            {properties.map(([key, property]) => (
              <DropdownMenuCheckboxItem
                key={key}
                checked={!state.uiPreferences.hiddenColumns.includes(key)}
                onCheckedChange={() => toggleColumnVisibility(key)}
              >
                {property.name}
              </DropdownMenuCheckboxItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => setShowColumnManager(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Manage Columns
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Manage Columns Button */}
        <Button
          onClick={() => setShowColumnManager(true)}
          variant="outline"
          size={state.uiPreferences.compactMode ? "sm" : "default"}
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Column
        </Button>

        {/* Refresh */}
        <Button
          onClick={loadDatabase}
          variant="outline"
          size={state.uiPreferences.compactMode ? "sm" : "default"}
          disabled={state.loading}
        >
          Refresh
        </Button>
      </div>

      <ColumnManager open={showColumnManager} onOpenChange={setShowColumnManager} />
      <ViewManager open={showViewManager} onOpenChange={setShowViewManager} />
    </>
  )
}
