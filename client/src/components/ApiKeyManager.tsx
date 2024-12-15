import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { storeApiKey, hasApiKey, clearApiKey } from "@/lib/keyStorage";
import { KeyRound, Eye, EyeOff, Trash } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

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

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <KeyRound className="h-5 w-5" />
          API Configuration
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Select AI Model</label>
          <Select value={selectedModel} onValueChange={onModelSelect}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="openai">OpenAI GPT-4o-mini</SelectItem>
              <SelectItem value="anthropic">Anthropic Claude 3.5 Haiku</SelectItem>
              <SelectItem value="gemini">Google Gemini 2 Flash</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">
            {hasKey ? "Update API Key" : "Enter API Key"}
          </label>
          <div className="flex space-x-2">
            <div className="relative flex-1">
              <Input
                type={showKey ? "text" : "password"}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder={hasKey ? "Enter new API key" : "Enter API key"}
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
          <p className="text-sm text-muted-foreground">
            Please enter your {selectedModel.toUpperCase()} API key to start processing files
          </p>
        )}
      </CardContent>
    </Card>
  );
}
