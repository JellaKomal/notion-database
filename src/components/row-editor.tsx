"use client"

import { useState, useEffect } from "react"
import { useApp } from "../context/app-context"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import { Textarea } from "./ui/textarea"
import { Checkbox } from "./ui/checkbox"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "./ui/dialog"
import type { NotionRow, NotionProperty } from "../types/notion"
import { useToast } from "../hooks/use-toast"
import { notionService } from "../lib/notion"
import { SearchableSelect } from "./searchable-select"

interface RowEditorProps {
  row: NotionRow | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function RowEditor({ row, open, onOpenChange }: RowEditorProps) {
  const { state, dispatch } = useApp()
  const { toast } = useToast()
  const [formData, setFormData] = useState<Record<string, any>>({})
  const [saving, setSaving] = useState(false)

  const isEditing = !!row
  const properties = state.database ? Object.entries(state.database.properties) : []

  useEffect(() => {
    if (row) {
      // Initialize form with existing row data
      const data: Record<string, any> = {}
      Object.entries(row.properties).forEach(([key, value]) => {
        data[key] = getFormValue(value)
      })
      setFormData(data)
    } else {
      // Initialize empty form
      setFormData({})
    }
  }, [row, open])

  const handleSave = async () => {
    if (!state.database) return

    setSaving(true)
    try {
      // Initialize the service with current config
      notionService.initialize({
        token: state.token,
        databaseId: state.databaseId,
      })

      // Convert form data to Notion property format
      const properties: Record<string, any> = {}

      Object.entries(formData).forEach(([key, value]) => {
        const property = state.database!.properties[key]
        if (property && value !== undefined && value !== "") {
          properties[key] = formatPropertyValue(property, value)
        }
      })

      let updatedRow: NotionRow

      if (isEditing) {
        const result = await notionService.updatePage(row.id, properties)
        if (!result) throw new Error("Failed to update row")
        updatedRow = result
        dispatch({ type: "UPDATE_ROW", payload: updatedRow })
        toast({
          title: "Row updated",
          description: "The row has been successfully updated",
        })
      } else {
        const result = await notionService.createPage(properties)
        if (!result) throw new Error("Failed to create row")
        updatedRow = result
        dispatch({ type: "ADD_ROW", payload: updatedRow })
        toast({
          title: "Row created",
          description: "A new row has been successfully created",
        })
      }

      onOpenChange(false)
    } catch (error) {
      toast({
        title: isEditing ? "Update failed" : "Create failed",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const updateFormData = (key: string, value: any) => {
    setFormData((prev) => ({ ...prev, [key]: value }))
  }

  const handleAddNewOption = async (propertyKey: string, propertyId: string, optionName: string) => {
    try {
      notionService.initialize({
        token: state.token,
        databaseId: state.databaseId,
      })

      const updatedDatabase = await notionService.addSelectOption(propertyId, optionName)
      if (updatedDatabase) {
        dispatch({ type: "SET_DATABASE", payload: updatedDatabase })

        // Find the new option and select it
        const property = updatedDatabase.properties[propertyKey]
        const newOption =
          property.select?.options.find((opt) => opt.name === optionName) ||
          property.multi_select?.options.find((opt) => opt.name === optionName)

        if (newOption) {
          if (property.type === "select") {
            updateFormData(propertyKey, newOption.id)
          } else if (property.type === "multi_select") {
            const currentValues = Array.isArray(formData[propertyKey]) ? formData[propertyKey] : []
            updateFormData(propertyKey, [...currentValues, newOption.id])
          }
        }

        toast({
          title: "Option added",
          description: `"${optionName}" has been added and selected`,
        })
      } else {
        throw new Error("Failed to add option")
      }
    } catch (error) {
      toast({
        title: "Failed to add option",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Row" : "Add New Row"}</DialogTitle>
          <DialogDescription>
            {isEditing ? "Update the row properties below" : "Fill in the properties for the new row"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {properties.map(([key, property]) => (
            <div key={key} className="space-y-2">
              <Label htmlFor={key}>{property.name}</Label>
              <PropertyInput
                property={property}
                propertyKey={key}
                value={formData[key]}
                onChange={(value) => updateFormData(key, value)}
                onAddNewOption={(optionName) => handleAddNewOption(key, property.id, optionName)}
              />
            </div>
          ))}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : isEditing ? "Update" : "Create"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function PropertyInput({
  property,
  // propertyKey,
  value,
  onChange,
  onAddNewOption,
}: {
  property: NotionProperty
  propertyKey: string
  value: any
  onChange: (value: any) => void
  onAddNewOption: (optionName: string) => Promise<void>
}) {
  switch (property.type) {
    case "title":
    case "rich_text":
      return (
        <Textarea
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder={`Enter ${property.name.toLowerCase()}...`}
          rows={2}
        />
      )

    case "select":
      return (
        <SearchableSelect
          options={property.select?.options || []}
          value={value || ""}
          onValueChange={onChange}
          onAddOption={onAddNewOption}
          placeholder={`Select ${property.name.toLowerCase()}...`}
          multiple={false}
        />
      )

    case "multi_select":
      return (
        <SearchableSelect
          options={property.multi_select?.options || []}
          value={Array.isArray(value) ? value : []}
          onValueChange={onChange}
          onAddOption={onAddNewOption}
          placeholder={`Select ${property.name.toLowerCase()}...`}
          multiple={true}
        />
      )

    case "checkbox":
      return (
        <div className="flex items-center space-x-2">
          <Checkbox checked={value || false} onCheckedChange={onChange} />
          <span className="text-sm">Checked</span>
        </div>
      )

    case "number":
      return (
        <Input
          type="number"
          value={value || ""}
          onChange={(e) => onChange(e.target.value ? Number.parseFloat(e.target.value) : null)}
          placeholder="Enter number..."
        />
      )

    case "date":
      return <Input type="date" value={value || ""} onChange={(e) => onChange(e.target.value)} />

    case "url":
      return (
        <Input type="url" value={value || ""} onChange={(e) => onChange(e.target.value)} placeholder="https://..." />
      )

    case "email":
      return (
        <Input
          type="email"
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder="email@example.com"
        />
      )

    default:
      return (
        <Input
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder={`Enter ${property.name.toLowerCase()}...`}
        />
      )
  }
}

function getFormValue(value: any): any {
  if (!value || !value.type) return ""

  switch (value.type) {
    case "title":
      return value.title?.[0]?.plain_text || ""
    case "rich_text":
      return value.rich_text?.[0]?.plain_text || ""
    case "select":
      return value.select?.id || ""
    case "multi_select":
      return value.multi_select?.map((o: any) => o.id) || []
    case "checkbox":
      return value.checkbox || false
    case "number":
      return value.number
    case "date":
      return value.date?.start || ""
    case "url":
      return value.url || ""
    case "email":
      return value.email || ""
    default:
      return ""
  }
}

function formatPropertyValue(property: NotionProperty, value: any): any {
  switch (property.type) {
    case "title":
      return {
        title: [{ text: { content: value } }],
      }
    case "rich_text":
      return {
        rich_text: [{ text: { content: value } }],
      }
    case "select":
      return value ? { select: { id: value } } : { select: null }
    case "multi_select":
      return {
        multi_select: Array.isArray(value) ? value.map((id) => ({ id })) : [],
      }
    case "checkbox":
      return { checkbox: Boolean(value) }
    case "number":
      return { number: value }
    case "date":
      return value ? { date: { start: value } } : { date: null }
    case "url":
      return { url: value || null }
    case "email":
      return { email: value || null }
    default:
      return {}
  }
}
