import { NotionController } from '../controllers/notionController.js';
import { CORS_HEADERS } from '../config/constants.js';

/**
 * Route handler for Notion API endpoints
 * @param {Object} req - HTTP request object
 * @param {Object} res - HTTP response object
 */
export function handleNotionRoutes(req, res) {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const path = url.pathname;

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(200, CORS_HEADERS);
    res.end();
    return;
  }

  // Set CORS headers for all responses
  Object.entries(CORS_HEADERS).forEach(([key, value]) => {
    res.setHeader(key, value);
  });

  // Route mapping
  const routes = {
    '/api/test-connection': {
      POST: NotionController.testConnection
    },
    '/api/get-database': {
      POST: NotionController.getDatabase
    },
    '/api/query-pages': {
      POST: NotionController.queryPages
    },
    '/api/create-page': {
      POST: NotionController.createPage
    },
    '/api/update-page': {
      POST: NotionController.updatePage
    },
    '/api/delete-page': {
      POST: NotionController.deletePage
    },
    '/api/create-property': {
      POST: NotionController.createProperty
    },
    '/api/delete-property': {
      POST: NotionController.deleteProperty
    },
    '/api/add-select-option': {
      POST: NotionController.addSelectOption
    }
  };

  // Find matching route
  const route = routes[path];
  if (route && route[req.method]) {
    route[req.method](req, res);
  } else {
    // Handle 404
    res.writeHead(404, CORS_HEADERS);
    res.end(JSON.stringify({ 
      error: "Endpoint not found",
      availableEndpoints: Object.keys(routes)
    }));
  }
} 