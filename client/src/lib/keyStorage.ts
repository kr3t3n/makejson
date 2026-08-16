type ApiKeys = {
  openai?: string;
  anthropic?: string;
  gemini?: string;
  openrouter?: string;
};

const OPENROUTER_MODEL_KEY = 'openrouter_model';

// Store API keys in session storage for security
export function storeApiKey(provider: keyof ApiKeys, key: string) {
  sessionStorage.setItem(`apiKey_${provider}`, key);
}

export function getApiKey(provider: keyof ApiKeys): string | null {
  return sessionStorage.getItem(`apiKey_${provider}`);
}

export function hasApiKey(provider: keyof ApiKeys): boolean {
  return !!getApiKey(provider);
}

export function clearApiKey(provider: keyof ApiKeys) {
  sessionStorage.removeItem(`apiKey_${provider}`);
}


export function storeOpenRouterModel(model: string) {
  sessionStorage.setItem(OPENROUTER_MODEL_KEY, model);
}

export function getOpenRouterModel(): string | null {
  return sessionStorage.getItem(OPENROUTER_MODEL_KEY);
}
