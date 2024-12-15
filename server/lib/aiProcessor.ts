import { processTextWithOpenAI } from './openai';
import { processTextWithAnthropic } from './anthropic';
import { processTextWithGemini } from './gemini';

type AiModel = 'openai' | 'anthropic' | 'gemini';

export async function processText(text: string, model: AiModel, apiKey: string): Promise<any> {
  switch (model) {
    case 'openai':
      return processTextWithOpenAI(text, apiKey);
    case 'anthropic':
      return processTextWithAnthropic(text, apiKey);
    case 'gemini':
      return processTextWithGemini(text, apiKey);
    default:
      throw new Error('Unsupported AI model');
  }
}
