import type { Express, Request } from "express";
import { createServer, type Server } from "http";
import multer from "multer";
import type { Multer } from "multer";
import { processText } from "./lib/aiProcessor";
import AdmZip from "adm-zip";
import nodemailer from "nodemailer";

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

      // Initialize contents array to store file data
      let contents: { filename: string; content: string }[] = [];
      
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
        } else if (fileType === 'xlsx') {
          const XLSX = await import('xlsx');
          try {
            const workbook = XLSX.read(req.file.buffer);
            const sheetNames = workbook.SheetNames;
            let allText = '';
            sheetNames.forEach(name => {
              const sheet = workbook.Sheets[name];
              allText += `Sheet: ${name}\n${XLSX.utils.sheet_to_csv(sheet)}\n\n`;
            });
            fileContent = allText;
          } catch (xlsxError) {
            throw new Error(`Invalid Excel file format: ${xlsxError.message}`);
          }
        } else {
          // For text and code files, read directly
          try {
            fileContent = req.file.buffer.toString('utf-8');
            // For code files, add file type context
            if (['js', 'jsx', 'ts', 'tsx', 'css', 'html', 'php', 'sql', 'py', 'json', 'xml'].includes(fileType)) {
              fileContent = `File type: ${fileType.toUpperCase()}\n\n${fileContent}`;
            }
          } catch (error) {
            throw new Error(`Failed to read file: ${error.message}`);
          }
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

        // Handle zip files
        if (fileType === 'zip') {
          try {
            const zip = new AdmZip(req.file.buffer);
            const zipEntries = zip.getEntries();

            for (const entry of zipEntries) {
              if (entry.isDirectory) continue;
              
              const fileType = entry.entryName.split('.').pop()?.toLowerCase();
              const buffer = entry.getData();
              let content: string;

              try {
                if (fileType === 'docx') {
                  const mammoth = await import('mammoth');
                  const result = await mammoth.extractRawText({ buffer });
                  content = result.value;
                } else if (fileType === 'pdf') {
                  const { default: pdfParse } = await import('pdf-parse/lib/pdf-parse.js');
                  const data = await pdfParse(buffer);
                  content = data.text;
                } else {
                  // For text files, read as UTF-8
                  content = buffer.toString('utf8');
                }

                contents.push({
                  filename: entry.entryName,
                  content
                });
              } catch (error) {
                console.error(`Error processing ${entry.entryName}:`, error);
                contents.push({
                  filename: entry.entryName,
                  content: `Error: Failed to process ${fileType} file: ${error.message}`
                });
              }
            }
          } catch (zipError) {
            throw new Error(`Failed to extract zip file: ${zipError.message}`);
          }
        } else {
          contents.push({
            filename: req.file.originalname,
            content: fileContent
          });
        }
      } catch (error) {
        console.error('Error extracting text:', error);
        throw new Error(`Failed to extract text from ${fileType.toUpperCase()} file: ${error.message}`);
      }
      

      // Process with AI
      const model = req.body.model || 'openai';
      const apiKey = req.body.apiKey;
      
      if (!apiKey) {
        return res.status(400).send('API key is required');
      }

      // Process all contents and combine results
      const results = await Promise.all(
        contents.map(async ({ filename, content }) => {
          const processedContent = await processText(content, model, apiKey);
          return {
            filename,
            content: processedContent
          };
        })
      );

      // If there's only one file, return its content directly
      // Otherwise, return an object with all processed files
      const result = results.length === 1 
        ? results[0].content
        : {
            type: 'multi_file',
            files: results
          };
      
      res.json(result);
    } catch (error: any) {
      console.error('Error processing file:', error);
      res.status(500).send(error.message);
    }
  });

  const httpServer = createServer(app);
  // Contact form submission endpoint
  app.post('/api/contact', async (req, res) => {
    try {
      const { name, email, message } = req.body;

      if (!process.env.SMTP_HOST || !process.env.SMTP_PORT || !process.env.SMTP_USER || !process.env.SMTP_PASS || !process.env.CONTACT_EMAIL) {
        throw new Error('SMTP configuration is missing');
      }

      // Validate input
      if (!name || !email || !message) {
        return res.status(400).json({ error: 'Name, email and message are required' });
      }

      // Create transporter with more detailed error handling
      // Try to connect with more permissive settings
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT),
        secure: false, // Try without SSL first
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
        requireTLS: true,
        tls: {
          rejectUnauthorized: false,
          minVersion: 'TLSv1'
        }
      });

      // Verify connection configuration
      try {
        await transporter.verify();
      } catch (verifyError: any) {
        console.error('SMTP Verification Error:', verifyError);
        throw new Error(`Failed to connect to SMTP server: ${verifyError.message}`);
      }

      await transporter.sendMail({
        from: process.env.SMTP_USER,
        to: process.env.CONTACT_EMAIL,
        subject: `Contact Form: Message from ${name}`,
        text: `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`,
        html: `
          <h2>New Contact Form Submission</h2>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <h3>Message:</h3>
          <p>${message.replace(/\n/g, '<br>')}</p>
        `,
      });

      res.json({ message: 'Message sent successfully' });
    } catch (error: any) {
      console.error('Error sending email:', error);
      res.status(500).json({ error: 'Failed to send message' });
    }
  });

  return httpServer;
}