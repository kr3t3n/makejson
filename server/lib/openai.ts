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
          content: "You are a data structuring assistant. Your task is to analyze the document content and convert it into a structured JSON format. Follow these rules:\n1. Focus on the actual content/text of the document, ignore metadata or file information\n2. Extract key information like title, sections, paragraphs, and lists\n3. Create a hierarchical structure that preserves the document's organization\n4. Use descriptive keys that reflect the content (e.g., 'title', 'sections', 'paragraphs')\n5. Ensure all text is properly escaped and JSON is valid\n6. If the content has clear sections, use them as main JSON keys",
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
