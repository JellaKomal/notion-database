"use client"

import { useState, useMemo } from "react"
import { useApp } from "../context/app-context"
import { Button } from "./ui/button"
import { Checkbox } from "./ui/checkbox"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table"
import { Badge } from "./ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"
import { RowEditor } from "./row-editor"
import type { NotionRow, NotionProperty, NotionPropertyValue } from "../types/notion"
import { Plus, Edit, Trash2, ChevronLeft, ChevronRight } from "lucide-react"
import { useToast } from "../hooks/use-toast"
import { notionService } from "../lib/notion"
import { cn } from "../lib/utils"

const colorMap = {
  default: "bg-gray-100 text-gray-800 border-gray-200",
  gray: "bg-gray-100 text-gray-800 border-gray-300",
  brown: "bg-amber-100 text-amber-800 border-amber-200",
  orange: "bg-orange-100 text-orange-800 border-orange-200",
  yellow: "bg-yellow-100 text-yellow-800 border-yellow-200",
  green: "bg-green-100 text-green-800 border-green-200",
  blue: "bg-blue-100 text-blue-800 border-blue-200",
  purple: "bg-purple-100 text-purple-800 border-purple-200",
  pink: "bg-pink-100 text-pink-800 border-pink-200",
  red: "bg-red-100 text-red-800 border-red-200",
}

const pageSizeOptions = [10, 25, 50, 100]

export function TableView() {
  const { state, dispatch } = useApp()
  const { toast } = useToast()
  const [editingRow, setEditingRow] = useState<NotionRow | null>(null)
  const [showNewRow, setShowNewRow] = useState(false)

  const properties = Object.entries(state.database?.properties || {})
  const visibleProperties = properties.filter(([key]) => !state.uiPreferences.hiddenColumns.includes(key))

  const filteredAndSortedRows = useMemo(() => {
    let filteredRows = state.rows

    // Apply search filter
    if (state.uiPreferences.searchQuery) {
      const query = state.uiPreferences.searchQuery.toLowerCase()
      filteredRows = filteredRows.filter((row) =>
        Object.values(row.properties).some((prop) => {
          const text = getPropertyDisplayValue(prop).toLowerCase()
          return text.includes(query)
        }),
      )
    }

    // Apply sorting
    if (state.uiPreferences.sortBy) {
      const { property, direction } = state.uiPreferences.sortBy
      filteredRows = [...filteredRows].sort((a, b) => {
        const aValue = getPropertyDisplayValue(a.properties[property] || {})
        const bValue = getPropertyDisplayValue(b.properties[property] || {})

        const comparison = aValue.localeCompare(bValue)
        return direction === "asc" ? comparison : -comparison
      })
    }

    return filteredRows
  }, [state.rows, state.uiPreferences.searchQuery, state.uiPreferences.sortBy])

  const totalRows = filteredAndSortedRows.length
  const totalPages = Math.ceil(totalRows / state.uiPreferences.pageSize)
  const startIndex = (state.uiPreferences.currentPage - 1) * state.uiPreferences.pageSize
  const endIndex = startIndex + state.uiPreferences.pageSize
  const paginatedRows = filteredAndSortedRows.slice(startIndex, endIndex)

  const handlePageSizeChange = (newPageSize: string) => {
    dispatch({
      type: "UPDATE_UI_PREFERENCES",
      payload: {
        pageSize: Number.parseInt(newPageSize),
        currentPage: 1, // Reset to first page
      },
    })
  }

  const handlePageChange = (newPage: number) => {
    dispatch({
      type: "UPDATE_UI_PREFERENCES",
      payload: { currentPage: newPage },
    })
  }

  const handleDeleteRow = async (rowId: string) => {
    if (!confirm("Are you sure you want to delete this row?")) return

    try {
      // Initialize the service with current config
      notionService.initialize({
        token: state.token,
        databaseId: state.databaseId,
      })

      const success = await notionService.deletePage(rowId)
      if (!success) throw new Error("Failed to delete row")

      dispatch({ type: "DELETE_ROW", payload: rowId })
      toast({
        title: "Row deleted",
        description: "The row has been successfully deleted",
      })
    } catch (error) {
      toast({
        title: "Delete failed",
        description: error instanceof Error ? error.message : "Failed to delete row",
        variant: "destructive",
      })
    }
  }

  if (!state.database || state.loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading database...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header with Add Row Button and Stats */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <p className="text-sm text-muted-foreground">
            {totalRows} row{totalRows !== 1 ? "s" : ""} total
            {totalRows > state.uiPreferences.pageSize &&
              ` • Showing ${startIndex + 1}-${Math.min(endIndex, totalRows)} of ${totalRows}`}
          </p>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Rows per page:</span>
            <Select value={state.uiPreferences.pageSize.toString()} onValueChange={handlePageSizeChange}>
              <SelectTrigger className="w-20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {pageSizeOptions.map((size) => (
                  <SelectItem key={size} value={size.toString()}>
                    {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <Button onClick={() => setShowNewRow(true)} size={state.uiPreferences.compactMode ? "sm" : "default"}>
          <Plus className="w-4 h-4 mr-2" />
          Add Row
        </Button>
      </div>

      {/* Table */}
      <div className="border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                {visibleProperties.map(([key, property]) => (
                  <TableHead key={key} className={state.uiPreferences.compactMode ? "py-2 px-3 text-xs" : ""}>
                    {property.name}
                  </TableHead>
                ))}
                <TableHead className={state.uiPreferences.compactMode ? "py-2 px-3" : ""}>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedRows.map((row) => (
                <TableRow key={row.id}>
                  {visibleProperties.map(([key, property]) => (
                    <TableCell key={key} className={state.uiPreferences.compactMode ? "py-1 px-3 text-sm" : ""}>
                      <PropertyCell property={property} value={row.properties[key]} />
                    </TableCell>
                  ))}
                  <TableCell className={state.uiPreferences.compactMode ? "py-1 px-3" : ""}>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm" onClick={() => setEditingRow(row)}>
                        <Edit className="w-3 h-3" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDeleteRow(row.id)}>
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Page {state.uiPreferences.currentPage} of {totalPages}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(state.uiPreferences.currentPage - 1)}
              disabled={state.uiPreferences.currentPage === 1}
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </Button>
            <div className="flex gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const pageNum = i + 1
                return (
                  <Button
                    key={pageNum}
                    variant={state.uiPreferences.currentPage === pageNum ? "default" : "outline"}
                    size="sm"
                    onClick={() => handlePageChange(pageNum)}
                    className="w-8 h-8 p-0"
                  >
                    {pageNum}
                  </Button>
                )
              })}
              {totalPages > 5 && (
                <>
                  <span className="px-2 py-1 text-sm text-muted-foreground">...</span>
                  <Button
                    variant={state.uiPreferences.currentPage === totalPages ? "default" : "outline"}
                    size="sm"
                    onClick={() => handlePageChange(totalPages)}
                    className="w-8 h-8 p-0"
                  >
                    {totalPages}
                  </Button>
                </>
              )}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(state.uiPreferences.currentPage + 1)}
              disabled={state.uiPreferences.currentPage === totalPages}
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {filteredAndSortedRows.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No rows found</p>
        </div>
      )}

      {/* Row Editor */}
      <RowEditor row={editingRow} open={!!editingRow} onOpenChange={(open) => !open && setEditingRow(null)} />

      <RowEditor row={null} open={showNewRow} onOpenChange={setShowNewRow} />
    </div>
  )
}

function PropertyCell({ property, value }: { property: NotionProperty; value?: NotionPropertyValue }) {
  if (!value) return <span className="text-muted-foreground">—</span>

  switch (property.type) {
    case "title":
      return <span className="font-medium">{value.title?.[0]?.plain_text || ""}</span>

    case "rich_text":
      return <span>{value.rich_text?.[0]?.plain_text || ""}</span>

    case "select":
      return value.select ? (
        <Badge
          variant="secondary"
          className={cn("text-xs border", colorMap[value.select.color as keyof typeof colorMap] || colorMap.default)}
        >
          {value.select.name}
        </Badge>
      ) : null

    case "multi_select":
      return (
        <div className="flex flex-wrap gap-1">
          {value.multi_select?.map((option) => (
            <Badge
              key={option.id}
              variant="secondary"
              className={cn("text-xs border", colorMap[option.color as keyof typeof colorMap] || colorMap.default)}
            >
              {option.name}
            </Badge>
          ))}
        </div>
      )

    case "checkbox":
      return <Checkbox checked={value.checkbox || false} disabled />

    case "number":
      return <span>{value.number ?? ""}</span>

    case "date":
      return <span>{value.date?.start || ""}</span>

    case "url":
      return value.url ? (
        <a href={value.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
          {value.url}
        </a>
      ) : null

    case "email":
      return value.email ? (
        <a href={`mailto:${value.email}`} className="text-blue-600 hover:underline">
          {value.email}
        </a>
      ) : null

    default:
      return <span className="text-muted-foreground">—</span>
  }
}

function getPropertyDisplayValue(value: NotionPropertyValue | {}): string {
  if (!value || !("type" in value)) return ""

  const prop = value as NotionPropertyValue

  switch (prop.type) {
    case "title":
      return prop.title?.[0]?.plain_text || ""
    case "rich_text":
      return prop.rich_text?.[0]?.plain_text || ""
    case "select":
      return prop.select?.name || ""
    case "multi_select":
      return prop.multi_select?.map((o) => o.name).join(", ") || ""
    case "checkbox":
      return prop.checkbox ? "Yes" : "No"
    case "number":
      return prop.number?.toString() || ""
    case "date":
      return prop.date?.start || ""
    case "url":
      return prop.url || ""
    case "email":
      return prop.email || ""
    default:
      return ""
  }
}
