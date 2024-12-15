import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
export async function processTextWithOpenAI(text: string, apiKey: string): Promise<any> {
  const openai = new OpenAI({ apiKey });
  try {
    // Clean the text content - remove control characters
    const cleanedText = text.replace(/[\x00-\x1F\x7F-\x9F]/g, ' ');

    // Function to split text into chunks
    function splitIntoChunks(text: string, maxChunkSize: number = 60000): string[] {
      const chunks: string[] = [];
      let currentChunk = '';
      
      // Split by paragraphs first
      const paragraphs = text.split(/\n\s*\n/);
      
      for (const paragraph of paragraphs) {
        if ((currentChunk + paragraph).length > maxChunkSize) {
          if (currentChunk) {
            chunks.push(currentChunk);
            currentChunk = '';
          }
          
          // If a single paragraph is too large, split by sentences
          if (paragraph.length > maxChunkSize) {
            const sentences = paragraph.split(/(?<=[.!?])\s+/);
            for (const sentence of sentences) {
              if (currentChunk.length + sentence.length > maxChunkSize) {
                if (currentChunk) {
                  chunks.push(currentChunk);
                  currentChunk = '';
                }
              }
              currentChunk += (currentChunk ? ' ' : '') + sentence;
            }
          } else {
            currentChunk = paragraph;
          }
        } else {
          currentChunk += (currentChunk ? '\n\n' : '') + paragraph;
        }
      }
      
      if (currentChunk) {
        chunks.push(currentChunk);
      }
      
      return chunks;
    }

    // Split text into manageable chunks
    const chunks = splitIntoChunks(cleanedText);
    const results = await Promise.all(chunks.map(async (chunk, index) => {
      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: `You are a data structuring assistant. Your task is to analyze part ${index + 1} of ${chunks.length} of the document and convert it into a structured JSON format. Follow these rules:
1. Focus on the actual content/text of the document, ignore metadata
2. Extract key information like title, sections, paragraphs, and lists
3. Create a hierarchical structure that preserves the document's organization
4. Use descriptive keys that reflect the content (e.g., 'title', 'sections', 'paragraphs')
5. Ensure all text is properly escaped and JSON is valid
6. If the content has clear sections, use them as main JSON keys
7. Add a '_chunk_index' field with value ${index} to help with reassembly`,
          },
          {
            role: "user",
            content: chunk,
          },
        ],
        response_format: { type: "json_object" },
      });

      const content = response.choices[0].message.content;
      if (!content) {
        throw new Error('No content returned from OpenAI');
      }

      return JSON.parse(content);
    }));

    // Combine results
    if (results.length === 1) {
      return results[0];
    }

    // Merge multiple chunks into a coherent structure
    return {
      type: "chunked_document",
      total_chunks: chunks.length,
      merged_content: results.reduce((acc: any, chunk: any) => {
        // Remove the chunk index from the final output
        const { _chunk_index, ...content } = chunk;
        
        // Merge sections and content
        Object.entries(content).forEach(([key, value]) => {
          if (!acc[key]) {
            acc[key] = value;
          } else if (Array.isArray(acc[key])) {
            acc[key] = [...acc[key], ...(Array.isArray(value) ? value : [value])];
          } else if (typeof acc[key] === 'object' && typeof value === 'object') {
            acc[key] = { ...acc[key], ...value };
          } else {
            acc[key] = acc[key] + '\n' + value;
          }
        });
        
        return acc;
      }, {}),
    };

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
