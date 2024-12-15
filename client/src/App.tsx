import { Switch, Route, useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";
import { ThemeProvider } from "@/hooks/use-theme";
import ThemeToggle from "@/components/ThemeToggle";
import Footer from "@/components/Footer";
import Home from "@/pages/Home";
import Terms from "@/pages/Terms";
import Privacy from "@/pages/Privacy";
import Contact from "@/pages/Contact";
import ApiKeyManager from "@/components/ApiKeyManager";
import { useState } from "react";
import type { AiModel } from "@/components/ApiKeyManager";

function App() {
  const [selectedModel, setSelectedModel] = useState<AiModel>("openai");
  return (
    <ThemeProvider>
      <div className="min-h-screen flex flex-col bg-background text-foreground">
        <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container flex h-16 items-center justify-between px-4">
            <div className="flex items-center gap-4">
              <a href="/" className="flex-shrink-0">
                <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-primary/90 to-primary/70 dark:from-primary/90 dark:to-primary/80 bg-clip-text text-transparent dark:text-primary-foreground">
                  makejson.online
                </h1>
                <p className="text-xs text-muted-foreground/90 mt-0.5">
                  Convert your documents to structured JSON using AI
                </p>
              </a>
              <ThemeToggle />
            </div>
            {useLocation()[0] === "/" && (
              <div className="hidden md:block flex-1 max-w-3xl ml-8">
                <ApiKeyManager
                  selectedModel={selectedModel}
                  onModelSelect={setSelectedModel}
                />
              </div>
            )}
          </div>
        </header>

        <div className="flex-1">
          <Switch>
            <Route path="/">
              <Home selectedModel={selectedModel} onModelSelect={setSelectedModel} />
            </Route>
            <Route path="/terms" component={Terms} />
            <Route path="/privacy" component={Privacy} />
            <Route path="/contact" component={Contact} />
            <Route component={NotFound} />
          </Switch>
        </div>
        <Footer />
      </div>
    </ThemeProvider>
  );
}

// fallback 404 not found page
function NotFound() {
  return (
    <div className="flex-1 w-full flex items-center justify-center">
      <Card className="w-full max-w-md mx-4">
        <CardContent className="pt-6">
          <div className="flex mb-4 gap-2">
            <AlertCircle className="h-8 w-8 text-destructive" />
            <h1 className="text-2xl font-bold">404 Page Not Found</h1>
          </div>

          <p className="mt-4 text-sm text-muted-foreground">
            The page you're looking for doesn't exist.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

export default App;