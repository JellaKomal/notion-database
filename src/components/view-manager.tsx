"use client"

import { useState } from "react"
import { useApp } from "../context/app-context"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "./ui/dialog"
import { Badge } from "./ui/badge"
import { useToast } from "../hooks/use-toast"
import { Trash2, Plus, Eye } from "lucide-react"

interface ViewManagerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ViewManager({ open, onOpenChange }: ViewManagerProps) {
  const { state, dispatch, saveCurrentAsView, applyView } = useApp()
  const { toast } = useToast()
  const [newViewName, setNewViewName] = useState("")

  const handleSaveCurrentView = () => {
    if (!newViewName.trim()) {
      toast({
        title: "Invalid view name",
        description: "Please enter a valid view name",
        variant: "destructive",
      })
      return
    }

    saveCurrentAsView(newViewName.trim())
    setNewViewName("")
    toast({
      title: "View saved",
      description: `View "${newViewName}" has been saved successfully`,
    })
  }

  const handleDeleteView = (viewId: string, viewName: string) => {
    if (viewId === "default") {
      toast({
        title: "Cannot delete default view",
        description: "The default view cannot be deleted",
        variant: "destructive",
      })
      return
    }

    if (!confirm(`Are you sure you want to delete the view "${viewName}"?`)) {
      return
    }

    dispatch({ type: "DELETE_VIEW", payload: viewId })
    toast({
      title: "View deleted",
      description: `View "${viewName}" has been deleted successfully`,
    })
  }

  const handleApplyView = (viewId: string) => {
    applyView(viewId)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Manage Views</DialogTitle>
          <DialogDescription>Create, apply, or delete different views of your data</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Existing Views */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Saved Views ({state.views.length})</h3>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {state.views.map((view) => (
                <div key={view.id} className="flex items-center justify-between p-3 border rounded-lg bg-muted/20">
                  <div className="flex items-center gap-3">
                    <span className="font-medium">{view.name}</span>
                    {state.uiPreferences.currentView === view.id && (
                      <Badge variant="secondary" className="text-xs">
                        Current
                      </Badge>
                    )}
                    <div className="flex gap-1 text-xs text-muted-foreground">
                      {view.sortBy && <span>Sorted</span>}
                      {view.filters.length > 0 && <span>{view.filters.length} filters</span>}
                      {view.hiddenColumns.length > 0 && <span>{view.hiddenColumns.length} hidden</span>}
                      {view.searchQuery && <span>Search: "{view.searchQuery}"</span>}
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="sm" onClick={() => handleApplyView(view.id)}>
                      <Eye className="w-4 h-4" />
                    </Button>
                    {view.id !== "default" && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteView(view.id, view.name)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Save Current View */}
          <div className="space-y-4 border-t pt-4">
            <h3 className="text-lg font-medium">Save Current View</h3>
            <div className="space-y-2">
              <Label htmlFor="view-name">View Name</Label>
              <Input
                id="view-name"
                value={newViewName}
                onChange={(e) => setNewViewName(e.target.value)}
                placeholder="Enter view name..."
                onKeyPress={(e) => e.key === "Enter" && handleSaveCurrentView()}
              />
            </div>
            <div className="text-sm text-muted-foreground">
              Current settings: {state.uiPreferences.sortBy ? "Sorted" : "No sort"}
              {state.uiPreferences.filters.length > 0 && `, ${state.uiPreferences.filters.length} filters`}
              {state.uiPreferences.hiddenColumns.length > 0 &&
                `, ${state.uiPreferences.hiddenColumns.length} hidden columns`}
              {state.uiPreferences.searchQuery && `, Search: "${state.uiPreferences.searchQuery}"`}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          <Button onClick={handleSaveCurrentView} disabled={!newViewName.trim()}>
            <Plus className="w-4 h-4 mr-2" />
            Save View
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
