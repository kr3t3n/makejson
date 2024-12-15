import type { Express, Request } from "express";
import { createServer, type Server } from "http";
import multer from "multer";
import type { Multer } from "multer";
import { processText } from "./lib/aiProcessor";

const upload = multer({
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  }
});

interface FileRequest extends Request {
  file?: Express.Multer.File;
}

export function registerRoutes(app: Express): Server {
  // Process file and convert to JSON
  app.post('/api/process', upload.single('file'), async (req: FileRequest, res) => {
    try {
      if (!req.file) {
        return res.status(400).send('No file uploaded');
      }

      // Extract content based on file type
      let fileContent: string;
      const fileType = req.file.originalname.split('.').pop()?.toLowerCase();

      try {
        if (fileType === 'docx') {
          const mammoth = await import('mammoth');
          try {
            const result = await mammoth.extractRawText({ buffer: req.file.buffer });
            fileContent = result.value;
          } catch (docxError) {
            throw new Error(`Invalid DOCX file format: ${docxError.message}`);
          }
        } else if (fileType === 'pdf') {
          const { default: pdfParse } = await import('pdf-parse/lib/pdf-parse.js');
          try {
            const data = await pdfParse(req.file.buffer);
            fileContent = data.text;
          } catch (pdfError) {
            throw new Error(`Invalid PDF file format: ${pdfError.message}`);
          }
        } else {
          // For text files, read directly
          fileContent = req.file.buffer.toString('utf-8');
        }

        // Split content into chunks if it's too large (roughly 100k characters per chunk)
        const CHUNK_SIZE = 100000;
        if (fileContent.length > CHUNK_SIZE) {
          // Find a good breaking point (end of paragraph or sentence)
          const chunks = [];
          let start = 0;
          while (start < fileContent.length) {
            let end = start + CHUNK_SIZE;
            if (end < fileContent.length) {
              // Try to find a paragraph break
              const nextParagraph = fileContent.indexOf('\n\n', end);
              const nextSentence = fileContent.indexOf('. ', end);
              if (nextParagraph !== -1 && nextParagraph - end < 1000) {
                end = nextParagraph;
              } else if (nextSentence !== -1 && nextSentence - end < 1000) {
                end = nextSentence + 1;
              }
            }
            chunks.push(fileContent.slice(start, end));
            start = end;
          }
          fileContent = chunks[0]; // Process only the first chunk for now
          // TODO: Implement full chunk processing in future iterations
        }
      } catch (error) {
        console.error('Error extracting text:', error);
        throw new Error(`Failed to extract text from ${fileType.toUpperCase()} file: ${error.message}`);
      }
      
      // Process with OpenAI
      const model = req.body.model || 'openai';
      const apiKey = req.body.apiKey;
      
      if (!apiKey) {
        return res.status(400).send('API key is required');
      }

      const result = await processText(fileContent, model, apiKey);
      
      res.json(result);
    } catch (error: any) {
      console.error('Error processing file:', error);
      res.status(500).send(error.message);
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}