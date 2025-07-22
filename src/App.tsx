import { AppProvider } from "./context/app-context"
import { NotionApp } from "./components/notion-app"
import { Toaster } from "./components/ui/toaster"

function App() {
  return (
    <AppProvider>
      <div className="min-h-screen bg-background">
        <NotionApp />
        <Toaster />
      </div>
    </AppProvider>
  )
}

export default App
