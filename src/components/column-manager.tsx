"use client"

import { useState } from "react"
import { useApp } from "../context/app-context"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "./ui/dialog"
import { Badge } from "./ui/badge"
import { useToast } from "../hooks/use-toast"
import { notionService } from "../lib/notion"
import { Plus, Trash2, X } from "lucide-react"
import type { CreatePropertyRequest } from "../types/notion"

interface ColumnManagerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ColumnManager({ open, onOpenChange }: ColumnManagerProps) {
  const { state, dispatch, loadDatabase } = useApp()
  const { toast } = useToast()
  const [newColumn, setNewColumn] = useState<CreatePropertyRequest>({
    name: "",
    type: "rich_text",
    selectOptions: [],
  })
  const [newOptionName, setNewOptionName] = useState("")
  const [saving, setSaving] = useState(false)

  if (!state.database) return null

  const properties = Object.entries(state.database.properties)

  const handleAddSelectOption = () => {
    if (!newOptionName.trim()) return

    const colors = ["default", "gray", "brown", "orange", "yellow", "green", "blue", "purple", "pink", "red"]
    const randomColor = colors[Math.floor(Math.random() * colors.length)]

    setNewColumn((prev) => ({
      ...prev,
      selectOptions: [...(prev.selectOptions || []), { name: newOptionName.trim(), color: randomColor }],
    }))
    setNewOptionName("")
  }

  const handleRemoveSelectOption = (index: number) => {
    setNewColumn((prev) => ({
      ...prev,
      selectOptions: prev.selectOptions?.filter((_, i) => i !== index) || [],
    }))
  }

  const handleCreateColumn = async () => {
    if (!newColumn.name.trim()) {
      toast({
        title: "Invalid column name",
        description: "Please enter a valid column name",
        variant: "destructive",
      })
      return
    }

    // Validate select/multi-select columns have options
    if (
      (newColumn.type === "select" || newColumn.type === "multi_select") &&
      (!newColumn.selectOptions || newColumn.selectOptions.length === 0)
    ) {
      toast({
        title: "Missing options",
        description: "Select and multi-select columns need at least one option",
        variant: "destructive",
      })
      return
    }

    setSaving(true)
    try {
      notionService.initialize({
        token: state.token,
        databaseId: state.databaseId,
      })

      const updatedDatabase = await notionService.createProperty(newColumn)
      if (updatedDatabase) {
        dispatch({ type: "SET_DATABASE", payload: updatedDatabase })
        toast({
          title: "Column created",
          description: `Column "${newColumn.name}" has been created successfully`,
        })
        setNewColumn({ name: "", type: "rich_text", selectOptions: [] })
        // Refresh the entire database to get updated schema
        await loadDatabase()
      } else {
        throw new Error("Failed to create column")
      }
    } catch (error) {
      toast({
        title: "Failed to create column",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteColumn = async (propertyId: string, propertyName: string) => {
    if (!confirm(`Are you sure you want to delete the column "${propertyName}"? This action cannot be undone.`)) {
      return
    }

    setSaving(true)
    try {
      notionService.initialize({
        token: state.token,
        databaseId: state.databaseId,
      })

      const updatedDatabase = await notionService.deleteProperty(propertyId)
      if (updatedDatabase) {
        dispatch({ type: "SET_DATABASE", payload: updatedDatabase })
        toast({
          title: "Column deleted",
          description: `Column "${propertyName}" has been deleted successfully`,
        })
        // Refresh the entire database to get updated schema
        await loadDatabase()
      } else {
        throw new Error("Failed to delete column")
      }
    } catch (error) {
      toast({
        title: "Failed to delete column",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Manage Columns</DialogTitle>
          <DialogDescription>Add new columns, delete existing ones, or modify column properties</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Existing Columns */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Existing Columns ({properties.length})</h3>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {properties.map(([key, property]) => (
                <div key={key} className="flex items-center justify-between p-3 border rounded-lg bg-muted/20">
                  <div className="flex items-center gap-3">
                    <span className="font-medium">{property.name}</span>
                    <Badge variant="secondary" className="text-xs">
                      {property.type.replace("_", " ")}
                    </Badge>
                    {(property.type === "select" || property.type === "multi_select") && (
                      <span className="text-sm text-muted-foreground">
                        ({property.select?.options.length || property.multi_select?.options.length || 0} options)
                      </span>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteColumn(property.id, property.name)}
                    disabled={saving}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          {/* Add New Column */}
          <div className="space-y-4 border-t pt-4">
            <h3 className="text-lg font-medium">Add New Column</h3>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="column-name">Column Name</Label>
                <Input
                  id="column-name"
                  value={newColumn.name}
                  onChange={(e) => setNewColumn((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter column name..."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="column-type">Column Type</Label>
                <Select
                  value={newColumn.type}
                  onValueChange={(value) => setNewColumn((prev) => ({ ...prev, type: value, selectOptions: [] }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="rich_text">Text</SelectItem>
                    <SelectItem value="number">Number</SelectItem>
                    <SelectItem value="select">Select (Single Choice)</SelectItem>
                    <SelectItem value="multi_select">Multi-select (Multiple Choice)</SelectItem>
                    <SelectItem value="date">Date</SelectItem>
                    <SelectItem value="checkbox">Checkbox</SelectItem>
                    <SelectItem value="url">URL</SelectItem>
                    <SelectItem value="email">Email</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Select Options */}
            {(newColumn.type === "select" || newColumn.type === "multi_select") && (
              <div className="space-y-3">
                <Label>Options for {newColumn.type === "select" ? "Select" : "Multi-select"}</Label>

                {/* Existing Options */}
                {newColumn.selectOptions && newColumn.selectOptions.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {newColumn.selectOptions.map((option, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {option.name}
                        <button
                          onClick={() => handleRemoveSelectOption(index)}
                          className="ml-1 hover:bg-muted-foreground/20 rounded-full p-0.5"
                        >
                          <X className="w-2 h-2" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}

                {/* Add New Option */}
                <div className="flex gap-2">
                  <Input
                    value={newOptionName}
                    onChange={(e) => setNewOptionName(e.target.value)}
                    placeholder="Add option..."
                    onKeyPress={(e) => e.key === "Enter" && handleAddSelectOption()}
                  />
                  <Button onClick={handleAddSelectOption} size="sm" disabled={!newOptionName.trim()}>
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Add at least one option for {newColumn.type === "select" ? "select" : "multi-select"} fields
                </p>
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          <Button
            onClick={handleCreateColumn}
            disabled={
              saving ||
              !newColumn.name.trim() ||
              ((newColumn.type === "select" || newColumn.type === "multi_select") &&
                (!newColumn.selectOptions || newColumn.selectOptions.length === 0))
            }
          >
            {saving ? "Creating..." : "Create Column"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
