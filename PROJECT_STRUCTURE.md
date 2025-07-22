# Notion App - Project Structure

## 📁 Complete Project Overview

```
notion-app/
├── 📁 backend/                    # Backend Server
│   ├── 📁 src/
│   │   ├── 📁 config/
│   │   │   └── constants.js       # Configuration constants
│   │   ├── 📁 controllers/
│   │   │   └── notionController.js # Request/response handlers
│   │   ├── 📁 middleware/
│   │   │   └── errorHandler.js    # Error handling middleware
│   │   ├── 📁 routes/
│   │   │   └── notionRoutes.js    # API route definitions
│   │   ├── 📁 services/
│   │   │   └── notionService.js   # Business logic layer
│   │   ├── 📁 utils/
│   │   │   └── httpClient.js      # HTTP utility functions
│   │   └── server.js              # Main server file
│   ├── package.json               # Backend dependencies
│   └── README.md                  # Backend documentation
│
├── 📁 src/                        # Frontend React Application
│   ├── 📁 components/
│   │   ├── 📁 ui/                 # Reusable UI components
│   │   ├── notion-app.tsx         # Main app component
│   │   ├── table-view.tsx         # Database table view
│   │   ├── row-editor.tsx         # Row editing component
│   │   ├── settings-panel.tsx     # Settings panel
│   │   ├── toolbar.tsx            # Toolbar component
│   │   └── ...
│   ├── 📁 context/
│   │   └── app-context.tsx        # React context provider
│   ├── 📁 hooks/
│   │   ├── use-mobile.tsx         # Mobile detection hook
│   │   └── use-toast.ts           # Toast notification hook
│   ├── 📁 lib/
│   │   ├── notion.ts              # Frontend API client
│   │   ├── storage.ts             # Local storage utilities
│   │   └── utils.ts               # Utility functions
│   ├── 📁 types/
│   │   └── notion.d.ts            # TypeScript definitions
│   ├── App.tsx                    # Main app component
│   ├── main.tsx                   # App entry point
│   └── index.css                  # Global styles
│
├── 📁 public/                     # Static Assets
│   ├── placeholder-logo.png
│   ├── placeholder-logo.svg
│   ├── placeholder-user.jpg
│   └── ...
│
├── 📄 Configuration Files
│   ├── package.json               # Frontend dependencies
│   ├── vite.config.ts             # Vite build configuration
│   ├── tailwind.config.ts         # Tailwind CSS configuration
│   ├── tsconfig.json              # TypeScript configuration
│   ├── tsconfig.node.json         # Node.js TypeScript config
│   ├── .eslintrc.ts               # ESLint configuration
│   ├── components.json            # UI components configuration
│   ├── postcss.config.js          # PostCSS configuration
│   └── .gitignore                 # Git ignore rules
│
├── 📄 Start Scripts
│   └── start.js                   # Main start script
│
└── 📄 Documentation
    ├── README.md                  # Main project documentation
    └── PROJECT_STRUCTURE.md       # This file
```

## 🏗️ Architecture Overview

### Backend Architecture (MVC Pattern)

```
Request → Routes → Controller → Service → Notion API
   ↓
Response ← Controller ← Service ← Notion API
```

**Layers:**
1. **Routes Layer**: API endpoint definitions and CORS handling
2. **Controllers Layer**: HTTP request/response handling and validation
3. **Services Layer**: Business logic and external API interactions
4. **Utils Layer**: Reusable utility functions
5. **Config Layer**: Application constants and configuration
6. **Middleware Layer**: Error handling and cross-cutting concerns

### Frontend Architecture (React + TypeScript)

```
App → Context → Components → Hooks → API Client
  ↓
UI ← Components ← Context ← API Client
```

**Layers:**
1. **Components Layer**: React components and UI logic
2. **Context Layer**: State management and data flow
3. **Hooks Layer**: Custom React hooks and utilities
4. **Lib Layer**: API client and utility functions
5. **Types Layer**: TypeScript type definitions

## 🚀 Quick Start Commands

### One-Command Start
```bash
node start.js
```

### Manual Start
```bash
# Terminal 1 - Backend
cd backend
npm install
npm start

# Terminal 2 - Frontend
npm run dev
```

## 📋 Key Features

### Backend Features
- ✅ **Modular Architecture**: Clean separation of concerns
- ✅ **Error Handling**: Comprehensive error management
- ✅ **CORS Support**: Proper CORS configuration
- ✅ **API Documentation**: Well-documented endpoints
- ✅ **Graceful Shutdown**: Proper server termination

### Frontend Features
- ✅ **React 19**: Latest React features
- ✅ **TypeScript**: Type-safe development
- ✅ **Tailwind CSS**: Utility-first styling
- ✅ **Responsive Design**: Mobile-friendly interface
- ✅ **Dark/Light Mode**: Theme switching
- ✅ **Real-time Updates**: Live data synchronization

## 🔧 Development Workflow

### Adding New Backend Endpoints
1. Add method to `NotionService`
2. Add controller method in `NotionController`
3. Add route in `notionRoutes.js`
4. Update documentation

### Adding New Frontend Features
1. Create component in `src/components/`
2. Add types in `src/types/`
3. Update context if needed
4. Add to main app component

## 📊 File Count Summary

- **Backend Files**: 8 files across 6 directories
- **Frontend Files**: 40+ files across 5 directories
- **Configuration Files**: 8 files
- **Documentation Files**: 2 files
- **Total**: ~60 files

## 🎯 Project Goals

1. **Maintainability**: Clean, organized code structure
2. **Scalability**: Modular architecture for easy expansion
3. **Performance**: Efficient API calls and state management
4. **User Experience**: Intuitive, responsive interface
5. **Developer Experience**: Clear documentation and easy setup

## 🔒 Security Considerations

- Backend acts as secure proxy for Notion API
- CORS properly configured
- Input validation on all endpoints
- Error messages sanitized
- No sensitive data stored locally

This structure provides a solid foundation for a production-ready Notion database management application. 