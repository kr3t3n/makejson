/**
 * Direct browser calls to the three supported AI providers.
 *
 * All three allow cross-origin requests from a browser, so there is no server
 * in the middle: the user's key goes straight from their tab to the provider
 * and is never seen by makejson.online.
 */

export type AiModel = "openai" | "anthropic" | "gemini";

export const MODEL_IDS: Record<AiModel, string> = {
  openai: "gpt-4o-mini",
  anthropic: "claude-3-5-haiku-latest",
  gemini: "gemini-2.0-flash",
};

const SYSTEM_PROMPT = `You are a data structuring assistant that ALWAYS responds with valid JSON. Your task is to analyze document content and convert it to a structured JSON format. IMPORTANT: Your entire response must be a single valid JSON object, with no additional text or explanation.

Rules for JSON structure:
1. Focus on actual content/text, ignore metadata
2. Extract key information like title, sections, paragraphs
3. Create a hierarchical structure preserving document organization
4. Use descriptive keys (e.g., 'title', 'sections', 'paragraphs')
5. All text must be properly escaped
6. Use section titles as main JSON keys when present

Remember: Your ENTIRE response must be a valid JSON object. Do not include any other text.`;

/** Strip control characters that would break JSON encoding on the way out. */
function clean(text: string): string {
  return text.replace(/[\x00-\x1F\x7F-\x9F]/g, " ");
}

/** Pull the first balanced JSON object out of a model response. */
function parseJson(content: string, provider: string): any {
  const trimmed = content.trim();
  try {
    return JSON.parse(trimmed);
  } catch {
    // Some models wrap JSON in prose or a ```json fence.
    const match = trimmed.match(/\{[\s\S]*\}/);
    if (!match) {
      throw new Error(`${provider} did not return JSON. Response began: ${trimmed.slice(0, 120)}`);
    }
    try {
      return JSON.parse(match[0]);
    } catch {
      throw new Error(`${provider} returned malformed JSON that could not be parsed.`);
    }
  }
}

async function failOn(response: Response, provider: string): Promise<never> {
  const body = await response.text();
  let detail = body.slice(0, 300);
  try {
    const parsed = JSON.parse(body);
    detail = parsed.error?.message ?? parsed.message ?? detail;
  } catch {
    /* keep the raw snippet */
  }
  if (response.status === 401 || response.status === 403) {
    throw new Error(`${provider} rejected the API key (${response.status}). ${detail}`);
  }
  if (response.status === 429) {
    throw new Error(`${provider} rate limit or quota reached. ${detail}`);
  }
  throw new Error(`${provider} error ${response.status}: ${detail}`);
}

async function callOpenAI(text: string, apiKey: string): Promise<any> {
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: MODEL_IDS.openai,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: clean(text) },
      ],
      response_format: { type: "json_object" },
    }),
  });

  if (!response.ok) await failOn(response, "OpenAI");
  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;
  if (!content) throw new Error("No content returned from OpenAI");
  return parseJson(content, "OpenAI");
}

async function callAnthropic(text: string, apiKey: string): Promise<any> {
  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      // Required for Anthropic to serve CORS requests straight from a browser.
      "anthropic-dangerous-direct-browser-access": "true",
    },
    body: JSON.stringify({
      model: MODEL_IDS.anthropic,
      max_tokens: 4096,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: `Please convert the following text into a structured JSON format:\n\n${clean(text)}`,
        },
      ],
    }),
  });

  if (!response.ok) await failOn(response, "Anthropic");
  const data = await response.json();
  const content = data.content?.[0]?.text;
  if (!content) throw new Error("No content returned from Anthropic");
  return parseJson(content, "Anthropic");
}

async function callGemini(text: string, apiKey: string): Promise<any> {
  const url =
    `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_IDS.gemini}:generateContent` +
    `?key=${encodeURIComponent(apiKey)}`;

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
      contents: [
        {
          role: "user",
          parts: [
            {
              text: `Please convert the following text into a structured JSON format:\n\n${clean(text)}`,
            },
          ],
        },
      ],
      generationConfig: {
        temperature: 0.1,
        maxOutputTokens: 4096,
        responseMimeType: "application/json",
      },
    }),
  });

  if (!response.ok) await failOn(response, "Gemini");
  const data = await response.json();
  const content = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!content) throw new Error("No content returned from Gemini");
  return parseJson(content, "Gemini");
}

export async function processText(
  text: string,
  model: AiModel,
  apiKey: string,
): Promise<any> {
  switch (model) {
    case "openai":
      return callOpenAI(text, apiKey);
    case "anthropic":
      return callAnthropic(text, apiKey);
    case "gemini":
      return callGemini(text, apiKey);
    default:
      throw new Error(`Unsupported AI model: ${model}`);
  }
}
