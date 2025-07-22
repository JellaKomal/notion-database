"use client"

import { useState } from "react"
import { Button } from "./ui/button"
import { Badge } from "./ui/badge"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "./ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover"
import { Check, ChevronDown, Plus, X } from "lucide-react"
import { cn } from "../lib/utils"

interface Option {
  id: string
  name: string
  color: string
}

interface SearchableSelectProps {
  options: Option[]
  value?: string | string[]
  onValueChange: (value: string | string[]) => void
  onAddOption?: (name: string) => Promise<void>
  placeholder?: string
  multiple?: boolean
  disabled?: boolean
}

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

export function SearchableSelect({
  options,
  value,
  onValueChange,
  onAddOption,
  placeholder = "Select option...",
  multiple = false,
  disabled = false,
}: SearchableSelectProps) {
  const [open, setOpen] = useState(false)
  const [searchValue, setSearchValue] = useState("")
  const [isAdding, setIsAdding] = useState(false)

  const selectedValues = multiple ? (Array.isArray(value) ? value : []) : []
  const selectedValue = !multiple ? (typeof value === "string" ? value : "") : ""

  const filteredOptions = options.filter((option) => option.name.toLowerCase().includes(searchValue.toLowerCase()))

  const canAddNew =
    searchValue.trim() && !options.some((opt) => opt.name.toLowerCase() === searchValue.toLowerCase()) && onAddOption

  const handleSelect = (optionId: string) => {
    if (multiple) {
      const newValues = selectedValues.includes(optionId)
        ? selectedValues.filter((id) => id !== optionId)
        : [...selectedValues, optionId]
      onValueChange(newValues)
    } else {
      onValueChange(optionId === selectedValue ? "" : optionId)
      setOpen(false)
    }
  }

  const handleAddNew = async () => {
    if (!canAddNew || !onAddOption) return

    setIsAdding(true)
    try {
      await onAddOption(searchValue.trim())
      setSearchValue("")
    } catch (error) {
      console.error("Failed to add option:", error)
    } finally {
      setIsAdding(false)
    }
  }

  const getSelectedOptions = () => {
    if (multiple) {
      return options.filter((opt) => selectedValues.includes(opt.id))
    } else {
      return selectedValue ? options.filter((opt) => opt.id === selectedValue) : []
    }
  }

  const removeOption = (optionId: string) => {
    if (multiple) {
      onValueChange(selectedValues.filter((id) => id !== optionId))
    } else {
      onValueChange("")
    }
  }

  return (
    <div className="space-y-2">
      {/* Selected Options Display */}
      {getSelectedOptions().length > 0 && (
        <div className="flex flex-wrap gap-1">
          {getSelectedOptions().map((option) => (
            <Badge
              key={option.id}
              variant="secondary"
              className={cn("text-xs border", colorMap[option.color as keyof typeof colorMap] || colorMap.default)}
            >
              {option.name}
              <button onClick={() => removeOption(option.id)} className="ml-1 hover:bg-black/10 rounded-full p-0.5">
                <X className="w-2 h-2" />
              </button>
            </Badge>
          ))}
        </div>
      )}

      {/* Searchable Select */}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between bg-transparent"
            disabled={disabled}
          >
            <span className="truncate">
              {getSelectedOptions().length > 0
                ? multiple
                  ? `${getSelectedOptions().length} selected`
                  : getSelectedOptions()[0].name
                : placeholder}
            </span>
            <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0" align="start">
          <Command>
            <CommandInput placeholder="Search or type to add..." value={searchValue} onValueChange={setSearchValue} />
            <CommandList>
              <CommandEmpty>
                {canAddNew ? (
                  <div className="p-2">
                    <Button onClick={handleAddNew} disabled={isAdding} size="sm" className="w-full">
                      {isAdding ? (
                        <div className="w-4 h-4 animate-spin border-2 border-current border-t-transparent rounded-full mr-2" />
                      ) : (
                        <Plus className="w-4 h-4 mr-2" />
                      )}
                      Add "{searchValue}"
                    </Button>
                  </div>
                ) : (
                  "No options found"
                )}
              </CommandEmpty>
              <CommandGroup>
                {filteredOptions.map((option) => (
                  <CommandItem key={option.id} value={option.id} onSelect={() => handleSelect(option.id)}>
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        (multiple ? selectedValues.includes(option.id) : selectedValue === option.id)
                          ? "opacity-100"
                          : "opacity-0",
                      )}
                    />
                    <Badge
                      variant="secondary"
                      className={cn(
                        "text-xs border mr-2",
                        colorMap[option.color as keyof typeof colorMap] || colorMap.default,
                      )}
                    >
                      {option.name}
                    </Badge>
                  </CommandItem>
                ))}
              </CommandGroup>
              {canAddNew && filteredOptions.length > 0 && (
                <CommandGroup>
                  <CommandItem onSelect={handleAddNew}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add "{searchValue}"
                  </CommandItem>
                </CommandGroup>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  )
}
