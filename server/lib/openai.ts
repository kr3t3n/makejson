import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
export async function processTextWithOpenAI(text: string, apiKey: string): Promise<any> {
  const openai = new OpenAI({ apiKey });
  try {
    // Clean the text content - remove control characters
    const cleanedText = text.replace(/[\x00-\x1F\x7F-\x9F]/g, ' ');

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a data structuring assistant. Your task is to convert the input text into a clean, valid JSON format. Follow these rules:\n1. Extract key information and organize it hierarchically\n2. Use simple data types (strings, numbers, arrays)\n3. Ensure all text is properly escaped\n4. Remove any control characters or invalid JSON characters",
        },
        {
          role: "user",
          content: cleanedText,
        },
      ],
      response_format: { type: "json_object" },
    });

    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error('No content returned from OpenAI');
    }

    try {
      return JSON.parse(content);
    } catch (parseError) {
      console.error('JSON parsing error:', content);
      throw new Error('Failed to parse AI response as JSON. The response might contain invalid characters.');
    }
  } catch (error: any) {
    console.error('OpenAI API error:', error);
    throw new Error('Failed to process text with OpenAI: ' + error.message);
  }
}
