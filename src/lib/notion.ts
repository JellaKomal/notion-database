import type { NotionDatabase, NotionRow, NotionConfig, CreatePropertyRequest } from "../types/notion"

const API_BASE = "http://localhost:3001/api"

class NotionService {
  private config: NotionConfig | null = null

  initialize(config: NotionConfig) {
    this.config = config
  }

  private async makeRequest(endpoint: string, data: any = {}) {
    if (!this.config) {
      throw new Error("Notion client not initialized")
    }

    const response = await fetch(`${API_BASE}${endpoint}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        token: this.config.token,
        databaseId: this.config.databaseId,
        ...data,
      }),
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: "Unknown error" }))
      throw new Error(error.message || `HTTP ${response.status}`)
    }

    return response.json()
  }

  async testConnection(): Promise<{ isConnected: boolean; error?: string; databaseInfo?: any }> {
    if (!this.config) {
      return {
        isConnected: false,
        error: "Notion client not initialized",
      }
    }

    try {
      const result = await this.makeRequest("/test-connection")
      return result
    } catch (error) {
      return {
        isConnected: false,
        error: error instanceof Error ? error.message : "Connection failed",
      }
    }
  }

  async getDatabase(): Promise<NotionDatabase | null> {
    if (!this.config) return null

    try {
      const result = await this.makeRequest("/get-database")
      return result
    } catch (error) {
      console.error("Error fetching database:", error)
      return null
    }
  }

  async queryPages(filter?: any, sorts?: any[]): Promise<NotionRow[]> {
    if (!this.config) return []

    try {
      const result = await this.makeRequest("/query-pages", { filter, sorts })
      return result
    } catch (error) {
      console.error("Error querying pages:", error)
      return []
    }
  }

  async createPage(properties: Record<string, any>): Promise<NotionRow | null> {
    if (!this.config) return null

    try {
      const result = await this.makeRequest("/create-page", { properties })
      return result
    } catch (error) {
      console.error("Error creating page:", error)
      return null
    }
  }

  async updatePage(pageId: string, properties: Record<string, any>): Promise<NotionRow | null> {
    try {
      const result = await this.makeRequest("/update-page", { pageId, properties })
      return result
    } catch (error) {
      console.error("Error updating page:", error)
      return null
    }
  }

  async deletePage(pageId: string): Promise<boolean> {
    try {
      await this.makeRequest("/delete-page", { pageId })
      return true
    } catch (error) {
      console.error("Error deleting page:", error)
      return false
    }
  }

  async createProperty(propertyData: CreatePropertyRequest): Promise<NotionDatabase | null> {
    if (!this.config) return null

    try {
      const result = await this.makeRequest("/create-property", { propertyData })
      return result
    } catch (error) {
      console.error("Error creating property:", error)
      return null
    }
  }

  async deleteProperty(propertyId: string): Promise<NotionDatabase | null> {
    if (!this.config) return null

    try {
      // First get the current database to find the property name
      const currentDb = await this.getDatabase()
      if (!currentDb) throw new Error("Could not fetch current database")

      const propertyEntry = Object.entries(currentDb.properties).find(([_, prop]) => prop.id === propertyId)
      if (!propertyEntry) throw new Error("Property not found")

      const propertyName = propertyEntry[0]

      const result = await this.makeRequest("/delete-property", { propertyName })
      return result
    } catch (error) {
      console.error("Error deleting property:", error)
      return null
    }
  }

  async addSelectOption(propertyId: string, optionName: string, color = "default"): Promise<NotionDatabase | null> {
    if (!this.config) return null

    try {
      // First get the current database to get existing options
      const currentDb = await this.getDatabase()
      if (!currentDb) throw new Error("Could not fetch current database")

      const propertyEntry = Object.entries(currentDb.properties).find(([_, prop]) => prop.id === propertyId)
      if (!propertyEntry) throw new Error("Property not found")

      const [propertyName, property] = propertyEntry
      const existingOptions = property.select?.options || property.multi_select?.options || []

      // Check if option already exists
      if (existingOptions.some((opt) => opt.name === optionName)) {
        throw new Error("Option already exists")
      }

      const result = await this.makeRequest("/add-select-option", { 
        propertyName, 
        optionName, 
        color 
      })
      return result
    } catch (error) {
      console.error("Error adding select option:", error)
      return null
    }
  }
}

const notionService = new NotionService()

export { notionService }
