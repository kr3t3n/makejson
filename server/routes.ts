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

      // Read file content as text
      const fileContent = req.file.buffer.toString('utf-8');
      
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
