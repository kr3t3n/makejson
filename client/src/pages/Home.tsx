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
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between py-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">AI Data Structuring</h1>
            <p className="text-sm text-muted-foreground">Convert your documents to structured JSON using AI</p>
          </div>
          <div className="hidden md:block w-[400px]">
            <ApiKeyManager
              selectedModel={selectedModel}
              onModelSelect={setSelectedModel}
            />
          </div>
        </div>
      </header>

      {/* Mobile API Config */}
      <div className="md:hidden p-4">
        <Card>
          <CardHeader>
            <CardTitle>API Configuration</CardTitle>
          </CardHeader>
          <CardContent>
            <ApiKeyManager
              selectedModel={selectedModel}
              onModelSelect={setSelectedModel}
            />
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="flex-1 container py-6 gap-6 md:grid md:grid-cols-[300px_1fr]">
        {/* Sidebar */}
        <aside className="flex flex-col gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Upload Files</CardTitle>
            </CardHeader>
            <CardContent>
              <FileUpload onFilesUploaded={handleFilesUploaded} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Processing Status</CardTitle>
            </CardHeader>
            <CardContent>
              <ProcessingStatus 
                files={files}
                onSelectResult={(result) => setSelectedResult(result)}
              />
            </CardContent>
          </Card>
        </aside>

        {/* Main Content - JSON Preview */}
        <main>
          <Card className="h-[calc(100vh-10rem)] flex flex-col">
            <CardHeader>
              <CardTitle>JSON Preview</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 min-h-0">
              {selectedResult ? (
                <JSONPreview data={selectedResult} />
              ) : (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Select a processed file to view its JSON structure
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}
