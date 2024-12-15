import Anthropic from '@anthropic-ai/sdk';

// the newest Anthropic model is "claude-3-5-sonnet-20241022" which was released October 22, 2024. do not change this unless explicitly requested by the user
export async function processTextWithAnthropic(text: string, apiKey: string): Promise<any> {
  try {
    const anthropic = new Anthropic({
      apiKey,
    });

    // Clean the text content - remove control characters
    const cleanedText = text.replace(/[\x00-\x1F\x7F-\x9F]/g, ' ');

    const response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 4096,
      system: "You are a data structuring assistant. Your task is to analyze the document content and convert it into a structured JSON format. Follow these rules:\n1. Focus on the actual content/text of the document, ignore metadata or file information\n2. Extract key information like title, sections, paragraphs, and lists\n3. Create a hierarchical structure that preserves the document's organization\n4. Use descriptive keys that reflect the content (e.g., 'title', 'sections', 'paragraphs')\n5. Ensure all text is properly escaped and JSON is valid\n6. If the content has clear sections, use them as main JSON keys\n7. The output must be a valid JSON object.",
      messages: [
        { 
          role: 'user', 
          content: [
            {
              type: 'text',
              text: `Please convert the following text into a structured JSON format:\n\n${cleanedText}`
            }
          ]
        }
      ],
    });

    const content = response.content[0].text;
    if (!content) {
      throw new Error('No content returned from Anthropic');
    }

    // Extract JSON from the response - Claude might add some explanatory text
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No valid JSON found in the response');
    }

    try {
      return JSON.parse(jsonMatch[0]);
    } catch (parseError) {
      console.error('JSON parsing error:', content);
      throw new Error('Failed to parse AI response as JSON. The response might contain invalid characters.');
    }
  } catch (error: any) {
    console.error('Anthropic API error:', error);
    throw new Error('Failed to process text with Anthropic: ' + error.message);
  }
}
