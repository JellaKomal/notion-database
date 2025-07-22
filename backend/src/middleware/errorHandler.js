import { CORS_HEADERS } from '../config/constants.js';

/**
 * Global error handler middleware
 * @param {Error} error - Error object
 * @param {Object} req - HTTP request object
 * @param {Object} res - HTTP response object
 * @param {Function} next - Next middleware function
 */
export function errorHandler(error, req, res, next) {
  console.error('Error:', error);

  // Set CORS headers
  Object.entries(CORS_HEADERS).forEach(([key, value]) => {
    res.setHeader(key, value);
  });

  // Handle different types of errors
  if (error.name === 'ValidationError') {
    res.writeHead(400, CORS_HEADERS);
    res.end(JSON.stringify({ 
      error: 'Validation Error', 
      message: error.message 
    }));
  } else if (error.name === 'UnauthorizedError') {
    res.writeHead(401, CORS_HEADERS);
    res.end(JSON.stringify({ 
      error: 'Unauthorized', 
      message: error.message 
    }));
  } else if (error.name === 'NotFoundError') {
    res.writeHead(404, CORS_HEADERS);
    res.end(JSON.stringify({ 
      error: 'Not Found', 
      message: error.message 
    }));
  } else {
    // Default error
    res.writeHead(500, CORS_HEADERS);
    res.end(JSON.stringify({ 
      error: 'Internal Server Error', 
      message: error.message || 'Something went wrong' 
    }));
  }
}

/**
 * Async error wrapper to catch async errors
 * @param {Function} fn - Async function to wrap
 * @returns {Function} Wrapped function with error handling
 */
export function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
} 