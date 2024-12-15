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
import ThemeToggle from "@/components/ThemeToggle";

type ProcessingFile = {
  id: string;
  name: string;
  status: 'processing' | 'complete' | 'error';
  result?: any;
  error?: string;
};

interface HomeProps {
  selectedModel: AiModel;
  onModelSelect: (model: AiModel) => void;
}

export default function Home({ selectedModel, onModelSelect }: HomeProps) {
  const [files, setFiles] = useState<Array<ProcessingFile & { file?: File }>>([]);
  const [selectedResult, setSelectedResult] = useState<any>(null);
  const { toast } = useToast();

  const handleFilesUploaded = (newFiles: File[]) => {
    const fileUpdates = newFiles.map(file => ({
      id: crypto.randomUUID(),
      name: file.name,
      file,
      status: 'unprocessed' as 'processing' | 'complete' | 'error',
      result: undefined,
      error: undefined
    }));
    
    setFiles(prev => [...prev, ...fileUpdates]);
  };

  const handleProcess = async (fileId: string) => {
    const fileToProcess = files.find(f => f.id === fileId);
    if (!fileToProcess || !('file' in fileToProcess)) return;

    const apiKey = getApiKey(selectedModel);
    if (!apiKey) {
      toast({
        variant: "destructive",
        title: "API Key Required",
        description: `Please set your ${selectedModel.toUpperCase()} API key first`
      });
      return;
    }

    setFiles(prev => prev.map(f => 
      f.id === fileId ? { ...f, status: 'processing' } : f
    ));

    const formData = new FormData();
    formData.append('file', fileToProcess.file);
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
        f.id === fileId 
          ? { ...f, status: 'complete', result }
          : f
      ));

      toast({
        title: "File processed successfully",
        description: fileToProcess.name
      });
    } catch (error: any) {
      setFiles(prev => prev.map(f => 
        f.id === fileId 
          ? { ...f, status: 'error', error: error.message }
          : f
      ));

      toast({
        variant: "destructive",
        title: "Error processing file",
        description: error.message
      });
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="container py-4">
        <div className="max-w-3xl mx-auto">
          <ApiKeyManager
            selectedModel={selectedModel}
            onModelSelect={onModelSelect}
          />
        </div>
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
                  onProcess={handleProcess}
                />
              </CardContent>
            </Card>
          </aside>

          {/* Main Content - JSON Preview */}
          <main>
            <Card className="shadow-sm h-[calc(100vh-8rem)] md:h-[calc(100vh-9rem)] flex flex-col border-muted bg-card">
              <CardHeader className="pb-2 border-b border-muted">
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
