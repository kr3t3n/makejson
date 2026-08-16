import { extractFile } from "./extract";
import { processText, type AiModel } from "./providers";

/** Roughly the amount of text we hand to a model in one request. */
const CHUNK_SIZE = 100_000;

/** Split on paragraph boundaries where possible so chunks stay readable. */
function chunk(text: string): string[] {
  if (text.length <= CHUNK_SIZE) return [text];

  const chunks: string[] = [];
  let start = 0;

  while (start < text.length) {
    let end = Math.min(start + CHUNK_SIZE, text.length);
    if (end < text.length) {
      const paragraph = text.indexOf("\n\n", end);
      const sentence = text.indexOf(". ", end);
      if (paragraph !== -1 && paragraph - end < 1000) {
        end = paragraph;
      } else if (sentence !== -1 && sentence - end < 1000) {
        end = sentence + 1;
      }
    }
    chunks.push(text.slice(start, end));
    start = end;
  }
  return chunks;
}

/**
 * Extract text from a file and convert it to JSON with the selected provider.
 *
 * Runs entirely in the browser: the file is parsed locally and only the
 * extracted text is sent to the provider, using the user's own key.
 */
export async function processFile(
  file: File,
  model: AiModel,
  apiKey: string,
): Promise<any> {
  const extracted = await extractFile(file);

  const results = await Promise.all(
    extracted.map(async ({ filename, content }) => {
      const parts = chunk(content);

      // Single chunk is the common case — keep its shape unchanged.
      if (parts.length === 1) {
        return { filename, content: await processText(parts[0], model, apiKey) };
      }

      const processed = await Promise.all(
        parts.map((part) => processText(part, model, apiKey)),
      );
      return {
        filename,
        content: {
          type: "chunked_document",
          total_chunks: parts.length,
          chunks: processed,
        },
      };
    }),
  );

  if (results.length === 1) {
    return results[0].content;
  }

  return { type: "multi_file", files: results };
}

export type { AiModel };
