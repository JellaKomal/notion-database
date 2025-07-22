# Notion App Backend

A well-structured backend server that acts as a proxy between the frontend and Notion API to handle CORS issues.

## 🏗️ Project Structure

```
backend/
├── src/
│   ├── config/
│   │   └── constants.js          # Configuration constants
│   ├── controllers/
│   │   └── notionController.js   # Request/response handlers
│   ├── middleware/
│   │   └── errorHandler.js       # Error handling middleware
│   ├── routes/
│   │   └── notionRoutes.js       # Route definitions
│   ├── services/
│   │   └── notionService.js      # Business logic layer
│   ├── utils/
│   │   └── httpClient.js         # HTTP utility functions
│   └── server.js                 # Main server file
├── package.json                  # Dependencies and scripts
└── README.md                     # This file
```

## 🚀 Quick Start

### Install Dependencies
```bash
cd backend
npm install
```

### Start Development Server
```bash
npm run dev
```

### Start Production Server
```bash
npm start
```

## 📋 API Endpoints

All endpoints accept POST requests with JSON body containing `token` and `databaseId`.

### Core Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/test-connection` | POST | Test connection to Notion |
| `/api/get-database` | POST | Get database structure |
| `/api/query-pages` | POST | Query database pages |

### Page Management

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/create-page` | POST | Create a new page |
| `/api/update-page` | POST | Update an existing page |
| `/api/delete-page` | POST | Delete a page (archive) |

### Property Management

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/create-property` | POST | Create a new property |
| `/api/delete-property` | POST | Delete a property |
| `/api/add-select-option` | POST | Add option to select property |

## 🏛️ Architecture

### Layers

1. **Routes Layer** (`/routes`)
   - Defines API endpoints
   - Handles CORS preflight
   - Routes requests to controllers

2. **Controllers Layer** (`/controllers`)
   - Handles HTTP requests/responses
   - Validates input data
   - Calls service methods

3. **Services Layer** (`/services`)
   - Contains business logic
   - Interacts with external APIs
   - Data transformation

4. **Utils Layer** (`/utils`)
   - Reusable utility functions
   - HTTP client implementation
   - Helper functions

5. **Config Layer** (`/config`)
   - Application constants
   - Environment variables
   - Configuration settings

6. **Middleware Layer** (`/middleware`)
   - Error handling
   - Request/response processing
   - Cross-cutting concerns

### Request Flow

```
Client Request → Routes → Controller → Service → Notion API
                ↓
            Response ← Controller ← Service ← Notion API
```

## 🔧 Configuration

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `3001` | Server port |

### Constants

Key constants are defined in `src/config/constants.js`:

- `NOTION_API_BASE`: Notion API base URL
- `NOTION_VERSION`: Notion API version
- `CORS_HEADERS`: CORS configuration

## 🛡️ Error Handling

The application includes comprehensive error handling:

- **Validation Errors**: 400 Bad Request
- **Authentication Errors**: 401 Unauthorized
- **Not Found Errors**: 404 Not Found
- **Server Errors**: 500 Internal Server Error

All errors include CORS headers and structured JSON responses.

## 🔒 Security Features

- **CORS Protection**: Properly configured CORS headers
- **Input Validation**: Request body validation
- **Error Sanitization**: Safe error messages
- **Token Security**: Tokens only sent to Notion API

## 📝 Development

### Adding New Endpoints

1. Add method to `NotionService`
2. Add controller method in `NotionController`
3. Add route in `notionRoutes.js`
4. Update documentation

### Code Style

- Use ES6+ features
- JSDoc comments for functions
- Consistent error handling
- Proper separation of concerns

## 🧪 Testing

To add tests (recommended):

```bash
npm install --save-dev jest supertest
```

Create test files in a `tests/` directory.

## 🚀 Production Deployment

### Docker (Recommended)

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY src/ ./src/
EXPOSE 3001
CMD ["npm", "start"]
```

### Environment Variables

Set production environment variables:

```bash
PORT=3001
NODE_ENV=production
```

## 📊 Monitoring

The server includes:

- Request logging
- Error logging
- Graceful shutdown handling
- Health check endpoint (can be added)

## 🤝 Contributing

1. Follow the existing code structure
2. Add JSDoc comments
3. Include error handling
4. Update documentation
5. Test thoroughly

## 📄 License

MIT License - see main project README for details. 