import http from 'http';
import { handleNotionRoutes } from './routes/notionRoutes.js';
import { errorHandler } from './middleware/errorHandler.js';
import { PORT } from './config/constants.js';

/**
 * Main server application
 */
class Server {
  constructor() {
    this.server = http.createServer(this.handleRequest.bind(this));
  }

  /**
   * Handle incoming HTTP requests
   * @param {Object} req - HTTP request object
   * @param {Object} res - HTTP response object
   */
  async handleRequest(req, res) {
    try {
      // Handle Notion API routes
      handleNotionRoutes(req, res);
    } catch (error) {
      // Use error handler middleware
      errorHandler(error, req, res, () => {});
    }
  }

  /**
   * Start the server
   */
  start() {
    this.server.listen(PORT, () => {
      console.log(`🚀 Backend server running on port ${PORT}`);
      console.log(`📋 API endpoints:`);
      console.log(`   POST /api/test-connection`);
      console.log(`   POST /api/get-database`);
      console.log(`   POST /api/query-pages`);
      console.log(`   POST /api/create-page`);
      console.log(`   POST /api/update-page`);
      console.log(`   POST /api/delete-page`);
      console.log(`   POST /api/create-property`);
      console.log(`   POST /api/delete-property`);
      console.log(`   POST /api/add-select-option`);
      console.log(`\n🌐 Server ready to handle requests!`);
    });

    // Handle graceful shutdown
    process.on('SIGINT', () => {
      console.log('\n🛑 Shutting down server...');
      this.server.close(() => {
        console.log('✅ Server closed');
        process.exit(0);
      });
    });

    process.on('SIGTERM', () => {
      console.log('\n🛑 Shutting down server...');
      this.server.close(() => {
        console.log('✅ Server closed');
        process.exit(0);
      });
    });
  }
}

// Start the server
const server = new Server();
server.start(); 