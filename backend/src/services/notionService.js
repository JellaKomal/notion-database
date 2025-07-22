import { makeRequest } from '../utils/httpClient.js';
import { NOTION_API_BASE, NOTION_VERSION } from '../config/constants.js';

/**
 * Service class for Notion API interactions
 */
export class NotionService {
  /**
   * Make a request to the Notion API
   * @param {string} endpoint - API endpoint
   * @param {string} token - Notion integration token
   * @param {Object} options - Request options
   * @returns {Promise<Object>} API response
   */
  static async makeNotionRequest(endpoint, token, options = {}) {
    const url = `${NOTION_API_BASE}${endpoint}`;
    const requestOptions = {
      method: options.method || 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        "Notion-Version": NOTION_VERSION,
        "Content-Type": "application/json",
        ...options.headers,
      },
      body: options.body
    };

    const response = await makeRequest(url, requestOptions);
    
    if (response.status >= 400) {
      throw new Error(response.data.message || `HTTP ${response.status}`);
    }
    
    return response.data;
  }

  /**
   * Test connection to Notion API
   * @param {string} token - Notion integration token
   * @param {string} databaseId - Database ID
   * @returns {Promise<Object>} Connection test result
   */
  static async testConnection(token, databaseId) {
    try {
      const database = await this.makeNotionRequest(`/databases/${databaseId}`, token);
      return {
        isConnected: true,
        databaseInfo: {
          id: database.id,
          title: database.title[0]?.plain_text || "Untitled",
          properties: Object.keys(database.properties).length,
        },
      };
    } catch (error) {
      return {
        isConnected: false,
        error: error.message || "Connection failed",
      };
    }
  }

  /**
   * Get database structure
   * @param {string} token - Notion integration token
   * @param {string} databaseId - Database ID
   * @returns {Promise<Object>} Database structure
   */
  static async getDatabase(token, databaseId) {
    const result = await this.makeNotionRequest(`/databases/${databaseId}`, token);
    return {
      id: result.id,
      title: result.title,
      properties: result.properties,
      created_time: result.created_time,
      last_edited_time: result.last_edited_time,
    };
  }

  /**
   * Query database pages
   * @param {string} token - Notion integration token
   * @param {string} databaseId - Database ID
   * @param {Object} filter - Query filter
   * @param {Array} sorts - Sort options
   * @returns {Promise<Array>} Database pages
   */
  static async queryPages(token, databaseId, filter, sorts) {
    const result = await this.makeNotionRequest(`/databases/${databaseId}/query`, token, {
      method: "POST",
      body: JSON.stringify({
        page_size: 100,
        filter,
        sorts,
      }),
    });
    return result.results;
  }

  /**
   * Create a new page
   * @param {string} token - Notion integration token
   * @param {string} databaseId - Database ID
   * @param {Object} properties - Page properties
   * @returns {Promise<Object>} Created page
   */
  static async createPage(token, databaseId, properties) {
    return await this.makeNotionRequest("/pages", token, {
      method: "POST",
      body: JSON.stringify({
        parent: { database_id: databaseId },
        properties,
      }),
    });
  }

  /**
   * Update an existing page
   * @param {string} token - Notion integration token
   * @param {string} pageId - Page ID
   * @param {Object} properties - Updated properties
   * @returns {Promise<Object>} Updated page
   */
  static async updatePage(token, pageId, properties) {
    return await this.makeNotionRequest(`/pages/${pageId}`, token, {
      method: "PATCH",
      body: JSON.stringify({
        properties,
      }),
    });
  }

  /**
   * Delete a page (archive it)
   * @param {string} token - Notion integration token
   * @param {string} pageId - Page ID
   * @returns {Promise<boolean>} Success status
   */
  static async deletePage(token, pageId) {
    await this.makeNotionRequest(`/pages/${pageId}`, token, {
      method: "PATCH",
      body: JSON.stringify({
        archived: true,
      }),
    });
    return true;
  }

  /**
   * Create a new property
   * @param {string} token - Notion integration token
   * @param {string} databaseId - Database ID
   * @param {Object} propertyData - Property configuration
   * @returns {Promise<Object>} Updated database
   */
  static async createProperty(token, databaseId, propertyData) {
    const propertyConfig = {
      [propertyData.name]: {
        type: propertyData.type,
      },
    };

    // Add select options if it's a select or multi_select type
    if (propertyData.type === "select" || propertyData.type === "multi_select") {
      propertyConfig[propertyData.name][propertyData.type] = {
        options: propertyData.selectOptions?.map((opt) => ({
          name: opt.name,
          color: opt.color || "default",
        })) || [],
      };
    }

    return await this.makeNotionRequest(`/databases/${databaseId}`, token, {
      method: "PATCH",
      body: JSON.stringify({
        properties: propertyConfig,
      }),
    });
  }

  /**
   * Delete a property
   * @param {string} token - Notion integration token
   * @param {string} databaseId - Database ID
   * @param {string} propertyName - Property name
   * @returns {Promise<Object>} Updated database
   */
  static async deleteProperty(token, databaseId, propertyName) {
    const deleteConfig = {
      [propertyName]: null,
    };

    return await this.makeNotionRequest(`/databases/${databaseId}`, token, {
      method: "PATCH",
      body: JSON.stringify({
        properties: deleteConfig,
      }),
    });
  }

  /**
   * Add option to select property
   * @param {string} token - Notion integration token
   * @param {string} databaseId - Database ID
   * @param {string} propertyName - Property name
   * @param {string} optionName - Option name
   * @param {string} color - Option color
   * @returns {Promise<Object>} Updated database
   */
  static async addSelectOption(token, databaseId, propertyName, optionName, color = "default") {
    // First get the current database to get existing options
    const currentDb = await this.getDatabase(token, databaseId);
    const property = currentDb.properties[propertyName];
    
    if (!property) {
      throw new Error("Property not found");
    }

    const existingOptions = property.select?.options || property.multi_select?.options || [];

    // Check if option already exists
    if (existingOptions.some((opt) => opt.name === optionName)) {
      throw new Error("Option already exists");
    }

    const newOptions = [
      ...existingOptions,
      {
        name: optionName,
        color,
      },
    ];

    const updateConfig = {
      [propertyName]: {
        type: property.type,
        [property.type]: {
          options: newOptions,
        },
      },
    };

    return await this.makeNotionRequest(`/databases/${databaseId}`, token, {
      method: "PATCH",
      body: JSON.stringify({
        properties: updateConfig,
      }),
    });
  }
} 