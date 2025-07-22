import { NotionService } from '../services/notionService.js';
import { parseBody } from '../utils/httpClient.js';
import { CORS_HEADERS } from '../config/constants.js';

/**
 * Controller for Notion API endpoints
 */
export class NotionController {
  /**
   * Test connection to Notion
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  static async testConnection(req, res) {
    try {
      const { token, databaseId } = await parseBody(req);
      
      if (!token || !databaseId) {
        res.writeHead(400, CORS_HEADERS);
        res.end(JSON.stringify({ 
          isConnected: false, 
          error: "Token and database ID are required" 
        }));
        return;
      }

      const result = await NotionService.testConnection(token, databaseId);
      res.writeHead(200, CORS_HEADERS);
      res.end(JSON.stringify(result));
    } catch (error) {
      res.writeHead(500, CORS_HEADERS);
      res.end(JSON.stringify({
        isConnected: false,
        error: error.message || "Connection failed",
      }));
    }
  }

  /**
   * Get database structure
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  static async getDatabase(req, res) {
    try {
      const { token, databaseId } = await parseBody(req);
      
      if (!token || !databaseId) {
        res.writeHead(400, CORS_HEADERS);
        res.end(JSON.stringify({ error: "Token and database ID are required" }));
        return;
      }

      const result = await NotionService.getDatabase(token, databaseId);
      res.writeHead(200, CORS_HEADERS);
      res.end(JSON.stringify(result));
    } catch (error) {
      res.writeHead(500, CORS_HEADERS);
      res.end(JSON.stringify({ error: error.message || "Failed to fetch database" }));
    }
  }

  /**
   * Query database pages
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  static async queryPages(req, res) {
    try {
      const { token, databaseId, filter, sorts } = await parseBody(req);
      
      if (!token || !databaseId) {
        res.writeHead(400, CORS_HEADERS);
        res.end(JSON.stringify({ error: "Token and database ID are required" }));
        return;
      }

      const result = await NotionService.queryPages(token, databaseId, filter, sorts);
      res.writeHead(200, CORS_HEADERS);
      res.end(JSON.stringify(result));
    } catch (error) {
      res.writeHead(500, CORS_HEADERS);
      res.end(JSON.stringify({ error: error.message || "Failed to query pages" }));
    }
  }

  /**
   * Create a new page
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  static async createPage(req, res) {
    try {
      const { token, databaseId, properties } = await parseBody(req);
      
      if (!token || !databaseId || !properties) {
        res.writeHead(400, CORS_HEADERS);
        res.end(JSON.stringify({ error: "Token, database ID, and properties are required" }));
        return;
      }

      const result = await NotionService.createPage(token, databaseId, properties);
      res.writeHead(200, CORS_HEADERS);
      res.end(JSON.stringify(result));
    } catch (error) {
      res.writeHead(500, CORS_HEADERS);
      res.end(JSON.stringify({ error: error.message || "Failed to create page" }));
    }
  }

  /**
   * Update an existing page
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  static async updatePage(req, res) {
    try {
      const { token, pageId, properties } = await parseBody(req);
      
      if (!token || !pageId || !properties) {
        res.writeHead(400, CORS_HEADERS);
        res.end(JSON.stringify({ error: "Token, page ID, and properties are required" }));
        return;
      }

      const result = await NotionService.updatePage(token, pageId, properties);
      res.writeHead(200, CORS_HEADERS);
      res.end(JSON.stringify(result));
    } catch (error) {
      res.writeHead(500, CORS_HEADERS);
      res.end(JSON.stringify({ error: error.message || "Failed to update page" }));
    }
  }

  /**
   * Delete a page
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  static async deletePage(req, res) {
    try {
      const { token, pageId } = await parseBody(req);
      
      if (!token || !pageId) {
        res.writeHead(400, CORS_HEADERS);
        res.end(JSON.stringify({ error: "Token and page ID are required" }));
        return;
      }

      await NotionService.deletePage(token, pageId);
      res.writeHead(200, CORS_HEADERS);
      res.end(JSON.stringify({ success: true }));
    } catch (error) {
      res.writeHead(500, CORS_HEADERS);
      res.end(JSON.stringify({ error: error.message || "Failed to delete page" }));
    }
  }

  /**
   * Create a new property
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  static async createProperty(req, res) {
    try {
      const { token, databaseId, propertyData } = await parseBody(req);
      
      if (!token || !databaseId || !propertyData) {
        res.writeHead(400, CORS_HEADERS);
        res.end(JSON.stringify({ error: "Token, database ID, and property data are required" }));
        return;
      }

      const result = await NotionService.createProperty(token, databaseId, propertyData);
      res.writeHead(200, CORS_HEADERS);
      res.end(JSON.stringify(result));
    } catch (error) {
      res.writeHead(500, CORS_HEADERS);
      res.end(JSON.stringify({ error: error.message || "Failed to create property" }));
    }
  }

  /**
   * Delete a property
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  static async deleteProperty(req, res) {
    try {
      const { token, databaseId, propertyName } = await parseBody(req);
      
      if (!token || !databaseId || !propertyName) {
        res.writeHead(400, CORS_HEADERS);
        res.end(JSON.stringify({ error: "Token, database ID, and property name are required" }));
        return;
      }

      const result = await NotionService.deleteProperty(token, databaseId, propertyName);
      res.writeHead(200, CORS_HEADERS);
      res.end(JSON.stringify(result));
    } catch (error) {
      res.writeHead(500, CORS_HEADERS);
      res.end(JSON.stringify({ error: error.message || "Failed to delete property" }));
    }
  }

  /**
   * Add option to select property
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  static async addSelectOption(req, res) {
    try {
      const { token, databaseId, propertyName, optionName, color } = await parseBody(req);
      
      if (!token || !databaseId || !propertyName || !optionName) {
        res.writeHead(400, CORS_HEADERS);
        res.end(JSON.stringify({ error: "Token, database ID, property name, and option name are required" }));
        return;
      }

      const result = await NotionService.addSelectOption(token, databaseId, propertyName, optionName, color);
      res.writeHead(200, CORS_HEADERS);
      res.end(JSON.stringify(result));
    } catch (error) {
      res.writeHead(500, CORS_HEADERS);
      res.end(JSON.stringify({ error: error.message || "Failed to add select option" }));
    }
  }
} 