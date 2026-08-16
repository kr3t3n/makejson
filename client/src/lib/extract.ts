/**
 * Browser-side text extraction.
 *
 * Everything here used to run on an Express server. It now runs in the tab,
 * so file bytes never leave the machine — only the extracted text is sent to
 * whichever AI provider the user picked, with the user's own API key.
 */

export type ExtractedFile = {
  filename: string;
  content: string;
};

const CODE_EXTENSIONS = [
  "js", "jsx", "ts", "tsx", "css", "html", "htm", "php",
  "sql", "py", "json", "xml", "md", "markdown", "csv", "txt",
];

/** Extensions we can pull text out of when found inside a ZIP. */
const ZIP_READABLE = [...CODE_EXTENSIONS, "pdf", "docx", "xlsx"];

function extensionOf(name: string): string {
  return name.split(".").pop()?.toLowerCase() ?? "";
}

/**
 * pdf.js needs its worker wired up explicitly under Vite. `?worker` lets Vite
 * bundle it and hand back a Worker constructor, which works the same in dev and
 * in a production build served from any base path.
 */
let pdfjsReady: Promise<typeof import("pdfjs-dist")> | null = null;

function loadPdfjs() {
  if (!pdfjsReady) {
    pdfjsReady = (async () => {
      const pdfjs = await import("pdfjs-dist");
      const PdfWorker = (await import("pdfjs-dist/build/pdf.worker.min.mjs?worker")).default;
      pdfjs.GlobalWorkerOptions.workerPort = new PdfWorker();
      return pdfjs;
    })();
  }
  return pdfjsReady;
}

async function extractPdf(data: ArrayBuffer): Promise<string> {
  const pdfjs = await loadPdfjs();

  const doc = await pdfjs.getDocument({ data }).promise;
  const pages: string[] = [];

  for (let i = 1; i <= doc.numPages; i++) {
    const page = await doc.getPage(i);
    const content = await page.getTextContent();
    const text = content.items
      .map((item: any) => ("str" in item ? item.str : ""))
      .join(" ");
    pages.push(text);
  }

  await doc.destroy();
  return pages.join("\n\n");
}

async function extractDocx(data: ArrayBuffer): Promise<string> {
  const mammoth = await import("mammoth/mammoth.browser.js");
  const result = await (mammoth as any).extractRawText({ arrayBuffer: data });
  return result.value;
}

async function extractXlsx(data: ArrayBuffer): Promise<string> {
  const XLSX = await import("xlsx");
  const workbook = XLSX.read(data, { type: "array" });
  return workbook.SheetNames.map((name) => {
    const sheet = workbook.Sheets[name];
    return `Sheet: ${name}\n${XLSX.utils.sheet_to_csv(sheet)}`;
  }).join("\n\n");
}

function decodeText(data: ArrayBuffer, ext: string): string {
  const text = new TextDecoder("utf-8").decode(data);
  return CODE_EXTENSIONS.includes(ext) && ext !== "txt"
    ? `File type: ${ext.toUpperCase()}\n\n${text}`
    : text;
}

/** Extract text from a single blob of bytes, dispatching on file extension. */
async function extractBytes(
  data: ArrayBuffer,
  filename: string,
): Promise<string> {
  const ext = extensionOf(filename);
  try {
    if (ext === "pdf") return await extractPdf(data);
    if (ext === "docx") return await extractDocx(data);
    if (ext === "xlsx") return await extractXlsx(data);
    return decodeText(data, ext);
  } catch (error: any) {
    throw new Error(
      `Failed to read ${ext ? ext.toUpperCase() : "file"} "${filename}": ${error.message}`,
    );
  }
}

async function extractZip(data: ArrayBuffer): Promise<ExtractedFile[]> {
  const JSZip = (await import("jszip")).default;
  const zip = await JSZip.loadAsync(data);
  const out: ExtractedFile[] = [];

  for (const entry of Object.values(zip.files)) {
    if (entry.dir) continue;
    // Skip macOS and editor cruft that would otherwise burn tokens.
    if (entry.name.startsWith("__MACOSX/") || entry.name.endsWith(".DS_Store")) {
      continue;
    }
    if (!ZIP_READABLE.includes(extensionOf(entry.name))) continue;

    const bytes = await entry.async("arraybuffer");
    try {
      out.push({ filename: entry.name, content: await extractBytes(bytes, entry.name) });
    } catch (error: any) {
      out.push({ filename: entry.name, content: `Error: ${error.message}` });
    }
  }

  if (out.length === 0) {
    throw new Error(
      "No readable files found in the archive. Supported types inside a ZIP: " +
        ZIP_READABLE.join(", "),
    );
  }
  return out;
}

/**
 * Turn an uploaded File into one or more named text blobs.
 * A ZIP fans out into one entry per readable file it contains.
 */
export async function extractFile(file: File): Promise<ExtractedFile[]> {
  const data = await file.arrayBuffer();

  if (extensionOf(file.name) === "zip") {
    return extractZip(data);
  }

  return [{ filename: file.name, content: await extractBytes(data, file.name) }];
}
