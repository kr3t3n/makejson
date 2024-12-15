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
    { id: "openai", name: "GPT-4o-mini", icon: "/img/openai.svg" },
    { id: "anthropic", name: "3.5 Haiku", icon: "/img/anthropic.svg" },
    { id: "gemini", name: "2.0 Flash", icon: "/img/gemini.svg" },
  ] as const;

  return (
    <Card className="border-0 shadow-none bg-transparent">
      <CardContent className="p-0">
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-4">
          <div className="grid grid-cols-3 md:flex gap-2">
            {models.map((model) => (
              <Button
                key={model.id}
                variant={selectedModel === model.id ? "default" : "outline"}
                className={cn(
                  "h-10 px-2 md:px-3 text-sm md:text-base",
                  selectedModel === model.id && "shadow-sm bg-primary/90 hover:bg-primary/100 text-primary-foreground dark:bg-white/90 dark:text-background dark:hover:bg-white",
                  "flex items-center justify-center"
                )}
                onClick={() => onModelSelect(model.id as AiModel)}
              >
                <img
                  src={model.icon}
                  alt={model.name}
                  className="h-4 w-4 md:h-5 md:w-5 mr-1.5 md:mr-2"
                  loading="eager"
                  style={{ display: 'inline-block' }}
                />
                <span className="text-xs md:text-sm whitespace-nowrap">{model.name}</span>
              </Button>
            ))}
          </div>

          <div className="flex gap-2 mt-2 md:mt-0 md:flex-1">
            <div className="relative flex-1">
              <Input
                type={showKey ? "text" : "password"}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder={hasKey ? "Enter new API key" : "Enter API key"}
                className="pr-10 text-sm"
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
            <Button onClick={handleSaveKey} className="whitespace-nowrap bg-primary dark:bg-white/90 dark:text-background dark:hover:bg-white">Save</Button>
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
