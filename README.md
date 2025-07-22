# Notion App with Backend Proxy

This application allows you to interact with Notion databases through a web interface. The backend proxy server handles CORS issues by acting as an intermediary between your frontend and the Notion API.

## 🚀 Quick Start

### **Option 1: One-Command Start (Recommended)**

Simply run this command to start both frontend and backend servers:

```bash
node start.js
```

This will:
- Start the backend server on port 3001
- Start the frontend server on port 5173
- Open both servers automatically

### **Option 2: Manual Start**

If you prefer to start servers separately:

**Terminal 1 - Backend Server:**
```bash
cd backend
npm install
npm start
```

**Terminal 2 - Frontend Server:**
```bash
npm run dev
```

## 📋 Prerequisites

Before using the application, you need:

1. **Node.js** (version 18 or higher)
2. **A Notion Integration Token**
3. **A Notion Database ID**

## 🔧 Setup Notion Integration

### Step 1: Create Notion Integration

1. Go to [Notion Integrations](https://www.notion.so/my-integrations)
2. Click "New integration"
3. Give it a name (e.g., "My Notion App")
4. Select the workspace where your database is located
5. Click "Submit"
6. Copy the "Internal Integration Token" (starts with `secret_`)

### Step 2: Share Database with Integration

1. Open your Notion database
2. Click the "Share" button in the top right
3. Click "Invite" and search for your integration name
4. Select your integration and click "Invite"
5. Make sure it has "Can edit" permissions

### Step 3: Get Database ID

1. Open your Notion database in the browser
2. Look at the URL: `https://www.notion.so/workspace/DATABASE_ID?v=...`
3. Copy the `DATABASE_ID` part (32 characters, no dashes)

## 🌐 Using the Application

### Step 1: Start the Application

```bash
node start-easy.js
```

You should see:
```
🚀 Starting Notion App with Simple Backend...

🔧 Starting backend server on port 3001...
🚀 Backend server running on port 3001
📋 API endpoints:
   POST /api/test-connection
   POST /api/get-database
   POST /api/query-pages

🌐 Starting frontend server on port 5173...
✅ Both servers are starting!
📋 Access your app at: http://localhost:5173
🔧 Backend API at: http://localhost:3001
```

### Step 2: Access the Application

1. Open your browser and go to `http://localhost:5173` (or the port shown in the terminal)
2. You'll see the Notion App interface

### Step 3: Connect to Notion

1. **Enter your Notion Integration Token** (starts with `secret_`)
2. **Enter your Database ID** (32 characters, no dashes)
3. **Click "Connect"** to test the connection
4. If successful, you'll see your database structure

### Step 4: Use the Application

Once connected, you can:

- **View Database Structure**: See all properties and their types
- **Browse Rows**: View all entries in your database
- **Add New Rows**: Create new entries with the form
- **Edit Rows**: Click on any cell to edit values
- **Delete Rows**: Remove entries from your database
- **Filter and Sort**: Organize your data as needed

## 🔍 Troubleshooting

### Common Issues

**1. "Connection Refused" Error**
- Make sure both servers are running
- Check that the backend is on port 3001
- Verify the frontend is running on the correct port

**2. "Invalid Token" Error**
- Verify your Notion integration token is correct
- Make sure the token starts with `secret_`
- Check that the integration is active

**3. "Database Not Found" Error**
- Verify your database ID is correct (32 characters, no dashes)
- Make sure the integration has access to the database
- Check that you've shared the database with your integration

**4. "CORS Error"**
- The backend proxy should handle this automatically
- If you still see CORS errors, restart both servers

### Port Conflicts

If port 3001 is already in use:
```bash
# Set a different port
PORT=3002 node server-simple.js
```

Then update the API_BASE in `src/lib/notion.ts`:
```typescript
const API_BASE = "http://localhost:3002/api"
```

## 🏗️ Architecture

### How It Works

```
Frontend (localhost:5173) → Backend Proxy (localhost:3001) → Notion API
```

1. **Frontend** makes requests to the local backend
2. **Backend** forwards requests to Notion API with your token
3. **Notion API** returns data to the backend
4. **Backend** sends data back to the frontend

### API Endpoints

The backend provides these endpoints:

- `POST /api/test-connection` - Test connection to Notion
- `POST /api/get-database` - Get database structure
- `POST /api/query-pages` - Query database pages

### Files Structure

```
notion/
├── backend/                  # Backend server
│   ├── src/
│   │   ├── config/          # Configuration constants
│   │   ├── controllers/     # Request/response handlers
│   │   ├── middleware/      # Error handling
│   │   ├── routes/          # API route definitions
│   │   ├── services/        # Business logic layer
│   │   ├── utils/           # Utility functions
│   │   └── server.js        # Main server file
│   ├── package.json         # Backend dependencies
│   └── README.md            # Backend documentation
├── src/                     # Frontend React application
│   ├── lib/
│   │   └── notion.ts        # Frontend API client
│   ├── components/          # React components
│   ├── context/             # React context providers
│   ├── hooks/               # Custom React hooks
│   ├── types/               # TypeScript type definitions
│   └── ...
├── public/                  # Static assets
├── start.js                 # Main start script
├── package.json             # Frontend dependencies
├── vite.config.ts           # Vite configuration
├── tailwind.config.ts       # Tailwind CSS configuration
└── README.md                # Project documentation
```

## 🔒 Security

- Your Notion token is only sent to the local backend server
- No data is stored on external servers
- All communication between frontend and backend is local
- The backend server runs only on your machine

## 🚀 Production Deployment

For production use, you would need to:

1. **Deploy the backend** to a hosting service (Heroku, Vercel, etc.)
2. **Update the API_BASE URL** in the frontend to point to your deployed backend
3. **Configure CORS** for your production domain
4. **Use environment variables** for sensitive configuration

## 📝 Features

- ✅ **Real-time Database Viewing**
- ✅ **Add/Edit/Delete Rows**
- ✅ **Property Management**
- ✅ **Filtering and Sorting**
- ✅ **Search Functionality**
- ✅ **Responsive Design**
- ✅ **Dark/Light Mode**
- ✅ **Well-Organized Backend** (modular structure with proper separation of concerns)
- ✅ **Clean Project Structure** (organized folders and files)

## 🤝 Contributing

Feel free to contribute to this project by:
- Reporting bugs
- Suggesting new features
- Submitting pull requests

## 📄 License

This project is open source and available under the MIT License. 