import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function processTextWithAI(text: string): Promise<any> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a data structuring assistant. Convert the input text into a well-structured JSON format that captures all the important information. The structure should be logical and hierarchical.",
        },
        {
          role: "user",
          content: text,
        },
      ],
      response_format: { type: "json_object" },
    });

    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error('No content returned from OpenAI');
    }
    return JSON.parse(content);
  } catch (error: any) {
    console.error('OpenAI API error:', error);
    throw new Error('Failed to process text with AI: ' + error.message);
  }
}
