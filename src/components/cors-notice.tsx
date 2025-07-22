"use client"

import { Button } from "./ui/button"
import { Alert, AlertDescription, AlertTitle } from "./ui/alert"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "./ui/dialog"
import { ExternalLink, AlertTriangle, Chrome, ChromeIcon as Firefox } from "lucide-react"

interface CorsNoticeProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CorsNotice({ open, onOpenChange }: CorsNoticeProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
            CORS Setup Required
          </DialogTitle>
          <DialogDescription>
            To use this app directly with Notion's API, you need to bypass CORS restrictions
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Why is this needed?</AlertTitle>
            <AlertDescription>
              Browsers block direct API calls to external services like Notion for security reasons. You need to
              temporarily disable this protection.
            </AlertDescription>
          </Alert>

          <div className="space-y-4">
            <h3 className="font-semibold">Option 1: Browser Extensions (Recommended)</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="border rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Chrome className="w-5 h-5" />
                  <span className="font-medium">Chrome</span>
                </div>
                <p className="text-sm text-muted-foreground mb-3">Install "CORS Unblock" or "Disable CORS" extension</p>
                <Button variant="outline" size="sm" asChild>
                  <a href="https://chrome.google.com/webstore/search/cors" target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Chrome Store
                  </a>
                </Button>
              </div>

              <div className="border rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Firefox className="w-5 h-5" />
                  <span className="font-medium">Firefox</span>
                </div>
                <p className="text-sm text-muted-foreground mb-3">Install "CORS Everywhere" extension</p>
                <Button variant="outline" size="sm" asChild>
                  <a
                    href="https://addons.mozilla.org/en-US/firefox/search/?q=cors"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Firefox Add-ons
                  </a>
                </Button>
              </div>
            </div>

            <div className="border-t pt-4">
              <h3 className="font-semibold mb-2">Option 2: Chrome with Disabled Security</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Launch Chrome with disabled web security (use a separate Chrome profile):
              </p>
              <div className="bg-muted p-3 rounded-lg font-mono text-sm">
                chrome --disable-web-security --disable-features=VizDisplayCompositor --user-data-dir=/tmp/chrome_dev
              </div>
            </div>

            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Security Note</AlertTitle>
              <AlertDescription>
                Only disable CORS while using this app. Re-enable it for normal browsing to maintain security.
              </AlertDescription>
            </Alert>
          </div>
        </div>

        <div className="flex justify-end">
          <Button onClick={() => onOpenChange(false)}>Got it!</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
