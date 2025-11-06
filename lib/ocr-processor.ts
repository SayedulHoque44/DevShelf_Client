import Tesseract from "tesseract.js";
import * as pdfjsLib from "pdfjs-dist";

// Configure PDF.js worker
if (typeof window !== "undefined") {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/4.0.379/pdf.worker.min.js`;
}

export interface OCRProgress {
  stage: "loading" | "processing" | "recognizing" | "complete";
  progress: number;
  currentPage?: number;
  totalPages?: number;
  message: string;
}

export interface OCRResult {
  text: string;
  confidence: number;
  pages: Array<{
    pageNumber: number;
    text: string;
    confidence: number;
    hasText: boolean;
  }>;
}

export class OCRProcessor {
  private static worker: Tesseract.Worker | null = null;

  /**
   * Initialize Tesseract worker
   */
  private static async initializeWorker(): Promise<Tesseract.Worker> {
    if (!this.worker) {
      this.worker = await Tesseract.createWorker("eng", 1, {
        logger: (m: any) => {
          // Optional: log OCR progress
          if (m.status === "recognizing text") {
            console.log(`OCR Progress: ${Math.round(m.progress * 100)}%`);
          }
        },
      });
    }
    return this.worker;
  }

  /**
   * Extract text from PDF using OCR
   */
  static async extractTextFromPDF(
    file: File,
    onProgress?: (progress: OCRProgress) => void
  ): Promise<OCRResult> {
    try {
      onProgress?.({
        stage: "loading",
        progress: 0,
        message: "Loading PDF document...",
      });

      // Load PDF document
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      const totalPages = pdf.numPages;

      onProgress?.({
        stage: "processing",
        progress: 10,
        totalPages,
        message: `Processing ${totalPages} pages...`,
      });

      const pages: OCRResult["pages"] = [];
      let combinedText = "";
      let totalConfidence = 0;

      // Initialize OCR worker
      const worker = await this.initializeWorker();

      // Process each page
      for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
        onProgress?.({
          stage: "recognizing",
          progress: 10 + (pageNum - 1) * (80 / totalPages),
          currentPage: pageNum,
          totalPages,
          message: `Processing page ${pageNum} of ${totalPages}...`,
        });

        const page = await pdf.getPage(pageNum);

        // Try to extract text directly first
        const textContent = await page.getTextContent();
        const directText = textContent.items
          .map((item: any) => item.str)
          .join(" ")
          .trim();

        let pageText = "";
        let confidence = 0;
        let hasText = false;

        if (directText && directText.length > 10) {
          // Page has selectable text
          pageText = directText;
          confidence = 95; // High confidence for direct text extraction
          hasText = true;
        } else {
          // Page needs OCR - render to canvas and extract text
          const viewport = page.getViewport({ scale: 2.0 });
          const canvas = document.createElement("canvas");
          const context = canvas.getContext("2d")!;
          canvas.height = viewport.height;
          canvas.width = viewport.width;

          await page.render({
            canvasContext: context,
            viewport: viewport,
            canvas: canvas,
          }).promise;

          // Convert canvas to image data for OCR
          const imageData = canvas.toDataURL("image/png");

          // Perform OCR on the image
          const ocrResult = await worker.recognize(imageData);
          pageText = ocrResult.data.text.trim();
          confidence = ocrResult.data.confidence;
          hasText = pageText.length > 0;
        }

        pages.push({
          pageNumber: pageNum,
          text: pageText,
          confidence,
          hasText,
        });

        if (pageText) {
          combinedText += pageText + "\n\n";
          totalConfidence += confidence;
        }
      }

      onProgress?.({
        stage: "complete",
        progress: 100,
        message: "OCR processing complete!",
      });

      const avgConfidence =
        pages.length > 0 ? totalConfidence / pages.length : 0;

      return {
        text: combinedText.trim(),
        confidence: avgConfidence,
        pages,
      };
    } catch (error) {
      console.error("OCR processing error:", error);
      throw new Error(
        `OCR processing failed: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  /**
   * Extract text from image file using OCR
   */
  static async extractTextFromImage(
    file: File,
    onProgress?: (progress: OCRProgress) => void
  ): Promise<OCRResult> {
    try {
      onProgress?.({
        stage: "loading",
        progress: 0,
        message: "Loading image...",
      });

      const worker = await this.initializeWorker();

      onProgress?.({
        stage: "recognizing",
        progress: 20,
        message: "Recognizing text in image...",
      });

      const result = await worker.recognize(file);

      onProgress?.({
        stage: "complete",
        progress: 100,
        message: "Text recognition complete!",
      });

      return {
        text: result.data.text,
        confidence: result.data.confidence,
        pages: [
          {
            pageNumber: 1,
            text: result.data.text,
            confidence: result.data.confidence,
            hasText: result.data.text.trim().length > 0,
          },
        ],
      };
    } catch (error) {
      console.error("Image OCR error:", error);
      throw new Error(
        `Image OCR failed: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  /**
   * Cleanup worker resources
   */
  static async cleanup(): Promise<void> {
    if (this.worker) {
      await this.worker.terminate();
      this.worker = null;
    }
  }

  /**
   * Check if a PDF likely needs OCR
   */
  static async needsOCR(file: File): Promise<boolean> {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

      // Check first few pages for text content
      const pagesToCheck = Math.min(3, pdf.numPages);
      let hasSelectableText = false;

      for (let i = 1; i <= pagesToCheck; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const text = textContent.items
          .map((item: any) => item.str)
          .join(" ")
          .trim();

        if (text.length > 50) {
          hasSelectableText = true;
          break;
        }
      }

      return !hasSelectableText;
    } catch (error) {
      console.error("Error checking PDF text content:", error);
      return true; // Assume OCR is needed if we can't check
    }
  }
}
