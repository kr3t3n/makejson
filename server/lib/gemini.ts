import { GoogleGenerativeAI } from "@google/generative-ai";

export async function processTextWithGemini(
  text: string,
  apiKey: string,
): Promise<any> {
  try {
    const genai = new GoogleGenerativeAI(apiKey);
    const model = genai.getGenerativeModel({ model: "gemini-2.0-flash-exp" });

    // Clean the text content - remove control characters
    const cleanedText = text.replace(/[\x00-\x1F\x7F-\x9F]/g, " ");

    const result = await model.generateContent({
      contents: [
        {
          role: "user",
          parts: [
            {
              text: `Please convert the following text into a structured JSON format:\n\n${cleanedText}`,
            },
          ],
        },
      ],
      generationConfig: {
        temperature: 0.1,
        maxOutputTokens: 4096,
      },
    });

    const response = await result.response;
    const content = response.text();

    if (!content) {
      throw new Error("No content returned from Gemini");
    }

    // Extract JSON from the response - Gemini might add some explanatory text
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("No valid JSON found in the response");
    }

    try {
      return JSON.parse(jsonMatch[0]);
    } catch (parseError) {
      console.error("JSON parsing error:", content);
      throw new Error(
        "Failed to parse AI response as JSON. The response might contain invalid characters.",
      );
    }
  } catch (error: any) {
    console.error("Gemini API error:", error);
    throw new Error("Failed to process text with Gemini: " + error.message);
  }
}
