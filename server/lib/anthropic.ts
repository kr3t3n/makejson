import Anthropic from '@anthropic-ai/sdk';

// the newest Anthropic model is "claude-3-5-sonnet-20241022" which was released October 22, 2024. do not change this unless explicitly requested by the user
export async function processTextWithAnthropic(text: string, apiKey: string): Promise<any> {
  try {
    const anthropic = new Anthropic({
      apiKey,
    });

    const response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 4096,
      system: "You are a data structuring assistant. Convert the input text into a well-structured JSON format that captures all the important information. The structure should be logical and hierarchical.",
      messages: [
        { role: 'user', content: text }
      ],
    });

    const content = response.content[0].text;
    if (!content) {
      throw new Error('No content returned from Anthropic');
    }

    return JSON.parse(content);
  } catch (error: any) {
    console.error('Anthropic API error:', error);
    throw new Error('Failed to process text with Anthropic: ' + error.message);
  }
}
