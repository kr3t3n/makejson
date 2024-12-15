import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { storeApiKey, hasApiKey, clearApiKey } from "@/lib/keyStorage";
import { Eye, EyeOff, Trash } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

export type AiModel = "openai" | "anthropic" | "gemini";

interface ApiKeyManagerProps {
  onModelSelect: (model: AiModel) => void;
  selectedModel: AiModel;
}

export default function ApiKeyManager({ onModelSelect, selectedModel }: ApiKeyManagerProps) {
  const [showKey, setShowKey] = useState(false);
  const [apiKey, setApiKey] = useState("");
  const { toast } = useToast();

  const handleSaveKey = () => {
    if (!apiKey.trim()) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please enter an API key",
      });
      return;
    }

    storeApiKey(selectedModel, apiKey);
    setApiKey("");
    toast({
      title: "API Key Saved",
      description: `${selectedModel.toUpperCase()} API key has been saved securely`,
    });
  };

  const handleClearKey = () => {
    clearApiKey(selectedModel);
    setApiKey("");
    toast({
      title: "API Key Cleared",
      description: `${selectedModel.toUpperCase()} API key has been removed`,
    });
  };

  const hasKey = hasApiKey(selectedModel);

  const models = [
    { id: "openai", name: "OpenAI", icon: "/img/openai.svg" },
    { id: "anthropic", name: "Anthropic", icon: "/img/anthropic.svg" },
    { id: "gemini", name: "Gemini", icon: "/img/gemini.svg" },
  ] as const;

  return (
    <Card className="border-0 shadow-none bg-transparent">
      <CardContent className="p-0">
        <div className="flex items-center gap-4">
          <div className="flex gap-2">
            {models.map((model) => (
              <Button
                key={model.id}
                variant={selectedModel === model.id ? "default" : "outline"}
                className={cn(
                  "h-10 px-3",
                  selectedModel === model.id && "shadow-sm"
                )}
                onClick={() => onModelSelect(model.id as AiModel)}
              >
                <img
                  src={model.icon}
                  alt={model.name}
                  className="h-5 w-5 mr-2"
                />
                <span>{model.name}</span>
              </Button>
            ))}
          </div>

          <div className="flex-1 flex gap-2">
            <div className="relative flex-1">
              <Input
                type={showKey ? "text" : "password"}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder={hasKey ? "Enter new API key" : "Enter API key"}
                className="pr-10"
              />
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-2 top-1/2 -translate-y-1/2"
                onClick={() => setShowKey(!showKey)}
              >
                {showKey ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>
            <Button onClick={handleSaveKey}>Save</Button>
            {hasKey && (
              <Button variant="destructive" size="icon" onClick={handleClearKey}>
                <Trash className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        {!hasKey && (
          <p className="text-sm text-muted-foreground mt-2">
            Please enter your {selectedModel.toUpperCase()} API key to start processing files
          </p>
        )}
      </CardContent>
    </Card>
  );
}
