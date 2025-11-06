import { PDFDocument, PageSizes, rgb } from "pdf-lib";

export interface PDFOptions {
  pageSize: "A4" | "A3" | "Letter" | "Legal";
  orientation: "portrait" | "landscape";
  margin: number;
}

export async function createPDFFromImages(
  images: { file: File; name: string }[],
  options: PDFOptions = {
    pageSize: "A4",
    orientation: "portrait",
    margin: 50,
  }
): Promise<Blob> {
  const pdfDoc = await PDFDocument.create();

  // Get page dimensions based on size and orientation
  let pageSize = PageSizes.A4;
  switch (options.pageSize) {
    case "A3":
      pageSize = PageSizes.A3;
      break;
    case "Letter":
      pageSize = PageSizes.Letter;
      break;
    case "Legal":
      pageSize = PageSizes.Legal;
      break;
    default:
      pageSize = PageSizes.A4;
  }

  const [baseWidth, baseHeight] = pageSize;
  const pageWidth =
    options.orientation === "landscape" ? baseHeight : baseWidth;
  const pageHeight =
    options.orientation === "landscape" ? baseWidth : baseHeight;

  for (const imageData of images) {
    try {
      // Convert image file to array buffer
      const imageBytes = await imageData.file.arrayBuffer();

      // Embed image in PDF
      let image;
      const fileType = imageData.file.type.toLowerCase();

      if (fileType.includes("png")) {
        image = await pdfDoc.embedPng(imageBytes);
      } else if (fileType.includes("jpg") || fileType.includes("jpeg")) {
        image = await pdfDoc.embedJpg(imageBytes);
      } else {
        // For other formats, we'll skip or convert to JPEG
        console.warn(`Unsupported image format: ${fileType}`);
        continue;
      }

      // Create a new page
      const page = pdfDoc.addPage([pageWidth, pageHeight]);

      // Calculate image dimensions to fit page with margin
      const maxWidth = pageWidth - options.margin * 2;
      const maxHeight = pageHeight - options.margin * 2;

      const imageAspectRatio = image.width / image.height;
      const maxAspectRatio = maxWidth / maxHeight;

      let drawWidth, drawHeight;

      if (imageAspectRatio > maxAspectRatio) {
        // Image is wider, fit to width
        drawWidth = maxWidth;
        drawHeight = maxWidth / imageAspectRatio;
      } else {
        // Image is taller, fit to height
        drawHeight = maxHeight;
        drawWidth = maxHeight * imageAspectRatio;
      }

      // Center the image on the page
      const x = (pageWidth - drawWidth) / 2;
      const y = (pageHeight - drawHeight) / 2;

      // Draw the image
      page.drawImage(image, {
        x,
        y,
        width: drawWidth,
        height: drawHeight,
      });
    } catch (error) {
      console.error(`Error processing image ${imageData.name}:`, error);
    }
  }

  // Serialize the PDF
  const pdfBytes = await pdfDoc.save();
  return new Blob([pdfBytes as BlobPart], { type: "application/pdf" });
}

export async function mergePDFs(pdfFiles: File[]): Promise<Blob> {
  const mergedPdf = await PDFDocument.create();

  for (const file of pdfFiles) {
    try {
      const pdfBytes = await file.arrayBuffer();
      const pdf = await PDFDocument.load(pdfBytes);
      const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());

      copiedPages.forEach((page) => {
        mergedPdf.addPage(page);
      });
    } catch (error) {
      console.error(`Error processing PDF ${file.name}:`, error);
    }
  }

  const pdfBytes = await mergedPdf.save();
  return new Blob([pdfBytes as BlobPart], { type: "application/pdf" });
}

export async function createTextPDF(
  content: string,
  title: string = "Document"
): Promise<Blob> {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage(PageSizes.A4);
  const { width, height } = page.getSize();

  // Add title
  page.drawText(title, {
    x: 50,
    y: height - 50,
    size: 20,
    color: rgb(0, 0, 0),
  });

  // Add content (simple text wrapping)
  const lines = content.split("\n");
  let yPosition = height - 100;
  const lineHeight = 14;
  const maxWidth = width - 100;

  for (const line of lines) {
    if (yPosition < 50) {
      // Add new page if needed
      const newPage = pdfDoc.addPage(PageSizes.A4);
      yPosition = newPage.getSize().height - 50;
    }

    // Simple word wrapping
    const words = line.split(" ");
    let currentLine = "";

    for (const word of words) {
      const testLine = currentLine + (currentLine ? " " : "") + word;
      const textWidth = testLine.length * 6; // Rough estimate

      if (textWidth > maxWidth && currentLine) {
        page.drawText(currentLine, {
          x: 50,
          y: yPosition,
          size: 12,
          color: rgb(0, 0, 0),
        });
        yPosition -= lineHeight;
        currentLine = word;
      } else {
        currentLine = testLine;
      }
    }

    if (currentLine) {
      page.drawText(currentLine, {
        x: 50,
        y: yPosition,
        size: 12,
        color: rgb(0, 0, 0),
      });
      yPosition -= lineHeight;
    }
  }

  const pdfBytes = await pdfDoc.save();
  return new Blob([pdfBytes as BlobPart], { type: "application/pdf" });
}
