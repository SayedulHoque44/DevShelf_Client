import { Document, Packer, Paragraph, TextRun, HeadingLevel } from "docx";
import { saveAs } from "file-saver";

export interface ConversionOptions {
  format: "docx" | "doc" | "rtf" | "txt";
  preserveFormatting: boolean;
}

export class DocumentConverter {
  /**
   * Creates a proper Word document from text content
   */
  static async createWordDocument(
    content: string,
    title: string,
    options: ConversionOptions
  ): Promise<Blob> {
    if (options.format === "docx") {
      return this.createDocxDocument(content, title);
    } else if (options.format === "rtf") {
      return this.createRtfDocument(content, title);
    } else if (options.format === "txt") {
      return this.createTextDocument(content);
    } else {
      // For DOC format, we'll create RTF as it's more compatible
      return this.createRtfDocument(content, title);
    }
  }

  /**
   * Creates a proper DOCX document using the docx library
   */
  private static async createDocxDocument(
    content: string,
    title: string
  ): Promise<Blob> {
    const paragraphs = content
      .split("\n")
      .filter((line) => line.trim().length > 0);

    const doc = new Document({
      sections: [
        {
          properties: {},
          children: [
            // Title
            new Paragraph({
              children: [
                new TextRun({
                  text: title,
                  bold: true,
                  size: 32, // 16pt
                }),
              ],
              heading: HeadingLevel.TITLE,
              spacing: {
                after: 400,
              },
            }),
            // Content paragraphs
            ...paragraphs.map(
              (paragraph) =>
                new Paragraph({
                  children: [
                    new TextRun({
                      text: paragraph,
                      size: 24, // 12pt
                    }),
                  ],
                  spacing: {
                    after: 200,
                  },
                })
            ),
          ],
        },
      ],
    });

    const buffer = await Packer.toBuffer(doc);
    return new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    });
  }

  /**
   * Creates a proper RTF document
   */
  private static createRtfDocument(
    content: string,
    title: string
  ): Promise<Blob> {
    const paragraphs = content
      .split("\n")
      .filter((line) => line.trim().length > 0);

    // Create proper RTF content
    let rtfContent = "{\\rtf1\\ansi\\deff0";

    // Font table
    rtfContent +=
      "{\\fonttbl{\\f0\\fswiss\\fcharset0 Arial;}{\\f1\\froman\\fcharset0 Times New Roman;}}";

    // Color table
    rtfContent += "{\\colortbl;\\red0\\green0\\blue0;\\red255\\green0\\blue0;}";

    // Document content
    rtfContent += "\\f1\\fs24"; // Times New Roman, 12pt

    // Title
    rtfContent += `\\b\\fs32 ${this.escapeRtf(title)}\\b0\\fs24\\par\\par`;

    // Content
    paragraphs.forEach((paragraph) => {
      rtfContent += `${this.escapeRtf(paragraph)}\\par\\par`;
    });

    rtfContent += "}";

    return Promise.resolve(new Blob([rtfContent], { type: "application/rtf" }));
  }

  /**
   * Creates a simple text document
   */
  private static createTextDocument(content: string): Promise<Blob> {
    return Promise.resolve(new Blob([content], { type: "text/plain" }));
  }

  /**
   * Escapes special characters for RTF format
   */
  private static escapeRtf(text: string): string {
    return text
      .replace(/\\/g, "\\\\")
      .replace(/\{/g, "\\{")
      .replace(/\}/g, "\\}")
      .replace(/\n/g, "\\par ")
      .replace(/\r/g, "");
  }

  /**
   * Simulates PDF text extraction (in a real app, use pdf-parse or similar)
   */
  static async extractTextFromPDF(file: File): Promise<string> {
    // In a real implementation, you would use a library like pdf-parse
    // For now, we'll create realistic sample content based on the file name

    const fileName = file.name.replace(".pdf", "");
    const fileSize = (file.size / 1024 / 1024).toFixed(2);

    return `Document: ${fileName}

This is a converted document from your PDF file. In a production environment, this would contain the actual text extracted from your PDF document.

The conversion process preserves the original structure and formatting as much as possible. Here's some sample content that demonstrates the conversion capabilities:

INTRODUCTION

This document demonstrates the PDF to Word conversion functionality. The original PDF file "${
      file.name
    }" (${fileSize} MB) has been processed and converted to an editable Word document format.

KEY FEATURES

• High-quality text extraction
• Preservation of document structure
• Support for multiple output formats
• Batch processing capabilities
• Secure local processing

TECHNICAL DETAILS

File Information:
- Original filename: ${file.name}
- File size: ${fileSize} MB
- Conversion date: ${new Date().toLocaleString()}
- Processing method: Advanced OCR and text extraction

The conversion process analyzes the PDF structure, extracts text content, and recreates it in the target format while maintaining readability and structure.

CONCLUSION

This converted document maintains the essential content and structure of the original PDF while providing full editing capabilities in your preferred word processing application.

For best results, ensure your PDF files contain selectable text rather than scanned images. Image-based PDFs may require OCR processing for optimal conversion quality.

Thank you for using our PDF to Word conversion service!`;
  }

  /**
   * Downloads a document with the specified filename
   */
  static downloadDocument(blob: Blob, filename: string): void {
    saveAs(blob, filename);
  }
}
