import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import FileUpload from "../components/FileUpload";
import JSONPreview from "../components/JSONPreview";
import ProcessingStatus from "../components/ProcessingStatus";
import { AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import ApiKeyManager, { type AiModel } from "../components/ApiKeyManager";
import { getApiKey } from "@/lib/keyStorage";

type ProcessingFile = {
  id: string;
  name: string;
  status: 'processing' | 'complete' | 'error';
  result?: any;
  error?: string;
};

export default function Home() {
  const [files, setFiles] = useState<ProcessingFile[]>([]);
  const [selectedResult, setSelectedResult] = useState<any>(null);
  const [selectedModel, setSelectedModel] = useState<AiModel>("openai");
  const { toast } = useToast();

  const handleFilesUploaded = async (newFiles: File[]) => {
    const fileUpdates = newFiles.map(file => ({
      id: crypto.randomUUID(),
      name: file.name,
      status: 'processing' as const
    }));
    
    setFiles(prev => [...prev, ...fileUpdates]);

    for (let i = 0; i < newFiles.length; i++) {
      const file = newFiles[i];
      const fileUpdate = fileUpdates[i];

      const apiKey = getApiKey(selectedModel);
      if (!apiKey) {
        toast({
          variant: "destructive",
          title: "API Key Required",
          description: `Please set your ${selectedModel.toUpperCase()} API key first`
        });
        return;
      }

      const formData = new FormData();
      formData.append('file', file);
      formData.append('model', selectedModel);
      formData.append('apiKey', apiKey);

      try {
        const response = await fetch('/api/process', {
          method: 'POST',
          body: formData
        });

        if (!response.ok) {
          throw new Error(await response.text());
        }

        const result = await response.json();

        setFiles(prev => prev.map(f => 
          f.id === fileUpdate.id 
            ? { ...f, status: 'complete', result }
            : f
        ));

        toast({
          title: "File processed successfully",
          description: file.name
        });
      } catch (error) {
        setFiles(prev => prev.map(f => 
          f.id === fileUpdate.id 
            ? { ...f, status: 'error', error: error.message }
            : f
        ));

        toast({
          variant: "destructive",
          title: "Error processing file",
          description: error.message
        });
      }
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 md:h-20 items-center justify-between px-4 md:px-8">
          <div className="flex-shrink-0">
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              AI Data Structuring
            </h1>
            <p className="text-xs md:text-sm text-muted-foreground mt-0.5 md:mt-1">
              Convert your documents to structured JSON using AI
            </p>
          </div>
          <div className="hidden md:block flex-1 max-w-3xl ml-8">
            <ApiKeyManager
              selectedModel={selectedModel}
              onModelSelect={setSelectedModel}
            />
          </div>
        </div>
      </header>

      {/* Mobile API Config */}
      <div className="md:hidden px-4">
        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">API Configuration</CardTitle>
          </CardHeader>
          <CardContent className="px-2 pb-3">
            <ApiKeyManager
              selectedModel={selectedModel}
              onModelSelect={setSelectedModel}
            />
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="flex-1 container py-4 md:py-8">
        <div className="grid md:grid-cols-[320px_1fr] gap-4 md:gap-8 px-4 md:px-8">
          {/* Sidebar */}
          <aside className="space-y-4 md:space-y-6">
            <Card className="shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Upload Files</CardTitle>
              </CardHeader>
              <CardContent className="px-2 pb-3">
                <FileUpload onFilesUploaded={handleFilesUploaded} />
              </CardContent>
            </Card>

            <Card className="shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Processing Status</CardTitle>
              </CardHeader>
              <CardContent className="px-2 pb-3">
                <ProcessingStatus 
                  files={files}
                  onSelectResult={(result) => setSelectedResult(result)}
                />
              </CardContent>
            </Card>
          </aside>

          {/* Main Content - JSON Preview */}
          <main>
            <Card className="shadow-sm h-[calc(100vh-8rem)] md:h-[calc(100vh-9rem)] flex flex-col">
              <CardHeader className="pb-2 border-b">
                <CardTitle className="text-lg">JSON Preview</CardTitle>
              </CardHeader>
              <CardContent className="flex-1 min-h-0 p-0">
                {selectedResult ? (
                  <JSONPreview data={selectedResult} />
                ) : (
                  <div className="h-full flex items-center justify-center p-6">
                    <Alert className="max-w-md">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        Select a processed file to view its JSON structure
                      </AlertDescription>
                    </Alert>
                  </div>
                )}
              </CardContent>
            </Card>
          </main>
        </div>
      </div>
    </div>
  );
}
