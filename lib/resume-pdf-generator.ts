import { PDFDocument, PageSizes, rgb, StandardFonts } from "pdf-lib";

export interface ResumeData {
  personalInfo: {
    fullName: string;
    email: string;
    phone: string;
    location: string;
    linkedIn: string;
    website: string;
  };
  summary: string;
  experience: Array<{
    id?: string;
    position: string;
    company: string;
    startDate: string;
    endDate: string;
    current: boolean;
    description: string;
  }>;
  education: Array<{
    id?: string;
    degree: string;
    institution: string;
    year: string;
    grade: string;
  }>;
  skills: string[];
}

export type ResumeDesign =
  | "classic"
  | "modern"
  | "modern-sidebar"
  | "modern-two-column"
  | "modern-minimal";

/**
 * Format date string (YYYY-MM format) to "MMM YYYY" format
 * Matches the preview formatDate function
 */
function formatDate(dateString: string): string {
  if (!dateString) return "";
  try {
    const date = new Date(dateString + "-01");
    return date.toLocaleDateString("en-US", {
      month: "short",
      year: "numeric",
    });
  } catch {
    return dateString;
  }
}

/**
 * Generates a PDF resume with the specified design template
 */
export async function generateResumePDF(
  data: ResumeData,
  design: ResumeDesign = "modern"
): Promise<Blob> {
  const pdfDoc = await PDFDocument.create();
  // A4 size: 210mm x 297mm = 595.28pt x 841.89pt
  const page = pdfDoc.addPage(PageSizes.A4);
  const { width, height } = page.getSize();

  // Verify A4 dimensions (should be ~595.28 x 841.89)
  // PageSizes.A4 already provides correct dimensions

  // Load fonts
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  if (design === "classic") {
    await generateClassicResume(
      pdfDoc,
      page,
      data,
      font,
      boldFont,
      width,
      height
    );
  } else if (design === "modern-sidebar" || design === "modern") {
    await generateModernSidebarPDF(
      pdfDoc,
      page,
      data,
      font,
      boldFont,
      width,
      height
    );
  } else if (design === "modern-two-column") {
    await generateModernTwoColumnPDF(
      pdfDoc,
      page,
      data,
      font,
      boldFont,
      width,
      height
    );
  } else if (design === "modern-minimal") {
    await generateModernMinimalPDF(
      pdfDoc,
      page,
      data,
      font,
      boldFont,
      width,
      height
    );
  } else {
    await generateModernSidebarPDF(
      pdfDoc,
      page,
      data,
      font,
      boldFont,
      width,
      height
    );
  }

  const pdfBytes = await pdfDoc.save();
  // A4 size verification: PageSizes.A4 = [595.28, 841.89] points (210mm x 297mm)
  // Ensure PDF is properly sized
  return new Blob([pdfBytes as BlobPart], { type: "application/pdf" });
}

/**
 * Modern design: Clean, minimal with accent colors
 */
async function generateModernResume(
  pdfDoc: PDFDocument,
  page: any,
  data: ResumeData,
  font: any,
  boldFont: any,
  width: number,
  height: number
) {
  const margin = 50;
  const contentWidth = width - margin * 2;
  let yPosition = height - margin;

  // Header with accent bar
  const headerHeight = 80;
  page.drawRectangle({
    x: 0,
    y: height - headerHeight,
    width: width,
    height: headerHeight,
    color: rgb(0.2, 0.4, 0.6), // Modern blue accent
  });

  // Name in header (professional size)
  page.drawText(data.personalInfo.fullName || "Your Name", {
    x: margin,
    y: height - 40,
    size: 16,
    font: boldFont,
    color: rgb(1, 1, 1),
  });

  // Contact info below name
  const contactInfo: string[] = [];
  if (data.personalInfo.email) contactInfo.push(data.personalInfo.email);
  if (data.personalInfo.phone) contactInfo.push(data.personalInfo.phone);
  if (data.personalInfo.location) contactInfo.push(data.personalInfo.location);

  yPosition = height - headerHeight - 30;
  page.drawText(contactInfo.join(" • "), {
    x: margin,
    y: yPosition,
    size: 10,
    font: font,
    color: rgb(0.3, 0.3, 0.3),
  });

  // LinkedIn and Website
  const links: string[] = [];
  if (data.personalInfo.linkedIn)
    links.push(`LinkedIn: ${data.personalInfo.linkedIn}`);
  if (data.personalInfo.website)
    links.push(`Website: ${data.personalInfo.website}`);

  if (links.length > 0) {
    yPosition -= 15;
    page.drawText(links.join(" • "), {
      x: margin,
      y: yPosition,
      size: 9,
      font: font,
      color: rgb(0.2, 0.4, 0.6),
    });
  }

  yPosition -= 30;

  // Professional Summary
  if (data.summary) {
    yPosition = addSection(
      page,
      "PROFESSIONAL SUMMARY",
      data.summary,
      yPosition,
      margin,
      contentWidth,
      font,
      boldFont,
      rgb(0.2, 0.4, 0.6),
      10,
      9
    );
    yPosition -= 15;
  }

  // Experience
  if (data.experience.length > 0) {
    yPosition = addSection(
      page,
      "PROFESSIONAL EXPERIENCE",
      "",
      yPosition,
      margin,
      contentWidth,
      font,
      boldFont,
      rgb(0.2, 0.4, 0.6),
      10,
      9
    );
    yPosition -= 10;

    for (const exp of data.experience) {
      if (yPosition < 100) {
        const newPage = pdfDoc.addPage(PageSizes.A4);
        yPosition = height - margin;
      }

      // Position and Company (professional size)
      page.drawText(exp.position || "Position", {
        x: margin,
        y: yPosition,
        size: 10,
        font: boldFont,
        color: rgb(0, 0, 0),
      });

      const dateRange = `${formatDate(exp.startDate) || "Start"} - ${
        exp.current ? "Present" : formatDate(exp.endDate) || "End"
      }`;
      const companyText = `${exp.company || "Company"} | ${dateRange}`;
      yPosition -= 14;
      page.drawText(companyText, {
        x: margin,
        y: yPosition,
        size: 9,
        font: font,
        color: rgb(0.4, 0.4, 0.4),
      });

      // Description
      if (exp.description) {
        yPosition -= 12;
        const descLines = wrapText(exp.description, contentWidth, 9);
        for (const line of descLines) {
          if (yPosition < 80) {
            const newPage = pdfDoc.addPage(PageSizes.A4);
            yPosition = height - margin;
            page = newPage;
          }
          page.drawText(line, {
            x: margin + 10,
            y: yPosition,
            size: 9,
            font: font,
            color: rgb(0.2, 0.2, 0.2),
          });
          yPosition -= 10;
        }
      }

      yPosition -= 15;
    }
  }

  // Education
  if (data.education.length > 0) {
    if (yPosition < 150) {
      const newPage = pdfDoc.addPage(PageSizes.A4);
      yPosition = height - margin;
      page = newPage;
    }

    yPosition = addSection(
      page,
      "EDUCATION",
      "",
      yPosition,
      margin,
      contentWidth,
      font,
      boldFont,
      rgb(0.2, 0.4, 0.6),
      10,
      9
    );
    yPosition -= 8;

    for (const edu of data.education) {
      if (yPosition < 80) {
        const newPage = pdfDoc.addPage(PageSizes.A4);
        yPosition = height - margin;
        page = newPage;
      }

      page.drawText(edu.degree || "Degree", {
        x: margin,
        y: yPosition,
        size: 10,
        font: boldFont,
        color: rgb(0, 0, 0),
      });

      const eduDetails = `${edu.institution || "Institution"}${
        edu.year ? ` • ${edu.year}` : ""
      }${edu.grade ? ` • ${edu.grade}` : ""}`;
      yPosition -= 12;
      page.drawText(eduDetails, {
        x: margin,
        y: yPosition,
        size: 9,
        font: font,
        color: rgb(0.4, 0.4, 0.4),
      });

      yPosition -= 15;
    }
  }

  // Skills
  if (data.skills.length > 0) {
    if (yPosition < 100) {
      const newPage = pdfDoc.addPage(PageSizes.A4);
      yPosition = height - margin;
      page = newPage;
    }

    yPosition = addSection(
      page,
      "SKILLS",
      "",
      yPosition,
      margin,
      contentWidth,
      font,
      boldFont,
      rgb(0.2, 0.4, 0.6),
      10,
      9
    );
    yPosition -= 8;

    const skillsText = data.skills.join(" • ");
    const skillsLines = wrapText(skillsText, contentWidth, 9);
    for (const line of skillsLines) {
      if (yPosition < 80) {
        const newPage = pdfDoc.addPage(PageSizes.A4);
        yPosition = height - margin;
        page = newPage;
      }
      page.drawText(line, {
        x: margin,
        y: yPosition,
        size: 9,
        font: font,
        color: rgb(0.2, 0.2, 0.2),
      });
      yPosition -= 10;
    }
  }
}

/**
 * Modern Sidebar PDF: Two-column layout with colored sidebar
 */
async function generateModernSidebarPDF(
  pdfDoc: PDFDocument,
  page: any,
  data: ResumeData,
  font: any,
  boldFont: any,
  width: number,
  height: number
) {
  const sidebarWidth = width * 0.33; // 33% for sidebar
  const contentWidth = width * 0.67; // 67% for main content
  const margin = 20;
  const sidebarPadding = 15;
  const contentPadding = 15;

  // Draw sidebar background
  page.drawRectangle({
    x: 0,
    y: 0,
    width: sidebarWidth,
    height: height,
    color: rgb(0.25, 0.25, 0.3), // Dark gray
  });

  let sidebarY = height - sidebarPadding;
  let contentY = height - contentPadding;

  // Name in sidebar
  page.drawText(data.personalInfo.fullName || "Your Name", {
    x: sidebarPadding,
    y: sidebarY,
    size: 14,
    font: boldFont,
    color: rgb(1, 1, 1),
  });

  if (data.personalInfo.email) {
    sidebarY -= 14;
    page.drawText(data.personalInfo.email, {
      x: sidebarPadding,
      y: sidebarY,
      size: 8,
      font: font,
      color: rgb(0.8, 0.8, 0.8),
    });
  }

  sidebarY -= 20;

  // Contact section in sidebar
  if (
    data.personalInfo.phone ||
    data.personalInfo.location ||
    data.personalInfo.linkedIn ||
    data.personalInfo.website
  ) {
    page.drawText("CONTACT", {
      x: sidebarPadding,
      y: sidebarY,
      size: 8,
      font: boldFont,
      color: rgb(1, 1, 1),
    });
    sidebarY -= 12;

    // Draw line
    page.drawLine({
      start: { x: sidebarPadding, y: sidebarY },
      end: { x: sidebarWidth - sidebarPadding, y: sidebarY },
      thickness: 0.5,
      color: rgb(0.6, 0.6, 0.6),
    });
    sidebarY -= 10;

    if (data.personalInfo.phone) {
      page.drawText(`Phone: ${data.personalInfo.phone}`, {
        x: sidebarPadding,
        y: sidebarY,
        size: 8,
        font: font,
        color: rgb(0.9, 0.9, 0.9),
      });
      sidebarY -= 10;
    }

    if (data.personalInfo.location) {
      page.drawText(`Location: ${data.personalInfo.location}`, {
        x: sidebarPadding,
        y: sidebarY,
        size: 8,
        font: font,
        color: rgb(0.9, 0.9, 0.9),
      });
      sidebarY -= 10;
    }

    if (data.personalInfo.linkedIn) {
      const linkedInText = `LinkedIn: ${data.personalInfo.linkedIn}`;
      const linkedInLines = wrapText(
        linkedInText,
        sidebarWidth - sidebarPadding * 2,
        8
      );
      for (const line of linkedInLines) {
        page.drawText(line, {
          x: sidebarPadding,
          y: sidebarY,
          size: 8,
          font: font,
          color: rgb(0.9, 0.9, 0.9),
        });
        sidebarY -= 10;
      }
    }

    if (data.personalInfo.website) {
      const websiteText = `Website: ${data.personalInfo.website}`;
      const websiteLines = wrapText(
        websiteText,
        sidebarWidth - sidebarPadding * 2,
        8
      );
      for (const line of websiteLines) {
        page.drawText(line, {
          x: sidebarPadding,
          y: sidebarY,
          size: 8,
          font: font,
          color: rgb(0.9, 0.9, 0.9),
        });
        sidebarY -= 10;
      }
    }
    sidebarY -= 10;
  }

  // Education in sidebar
  if (data.education.length > 0) {
    page.drawText("EDUCATION", {
      x: sidebarPadding,
      y: sidebarY,
      size: 8,
      font: boldFont,
      color: rgb(1, 1, 1),
    });
    sidebarY -= 12;

    page.drawLine({
      start: { x: sidebarPadding, y: sidebarY },
      end: { x: sidebarWidth - sidebarPadding, y: sidebarY },
      thickness: 0.5,
      color: rgb(0.6, 0.6, 0.6),
    });
    sidebarY -= 10;

    for (const edu of data.education) {
      if (sidebarY < 50) break; // Skip if no space

      page.drawText(edu.degree || "Degree", {
        x: sidebarPadding,
        y: sidebarY,
        size: 9,
        font: boldFont,
        color: rgb(1, 1, 1),
      });
      sidebarY -= 10;

      if (edu.institution) {
        page.drawText(edu.institution, {
          x: sidebarPadding,
          y: sidebarY,
          size: 8,
          font: font,
          color: rgb(0.8, 0.8, 0.8),
        });
        sidebarY -= 9;
      }

      if (edu.year) {
        page.drawText(edu.year, {
          x: sidebarPadding,
          y: sidebarY,
          size: 7,
          font: font,
          color: rgb(0.7, 0.7, 0.7),
        });
        sidebarY -= 9;
      }

      sidebarY -= 5;
    }
    sidebarY -= 5;
  }

  // Skills in sidebar
  if (data.skills.length > 0) {
    page.drawText("SKILLS", {
      x: sidebarPadding,
      y: sidebarY,
      size: 8,
      font: boldFont,
      color: rgb(1, 1, 1),
    });
    sidebarY -= 12;

    page.drawLine({
      start: { x: sidebarPadding, y: sidebarY },
      end: { x: sidebarWidth - sidebarPadding, y: sidebarY },
      thickness: 0.5,
      color: rgb(0.6, 0.6, 0.6),
    });
    sidebarY -= 10;

    for (const skill of data.skills) {
      if (sidebarY < 50) break;
      page.drawText(`• ${skill}`, {
        x: sidebarPadding,
        y: sidebarY,
        size: 8,
        font: font,
        color: rgb(0.9, 0.9, 0.9),
      });
      sidebarY -= 9;
    }
  }

  // Main content area (right side)
  const contentX = sidebarWidth + contentPadding;
  let currentContentY = height - contentPadding;

  // Profile/Summary
  if (data.summary) {
    page.drawText("PROFILE", {
      x: contentX,
      y: currentContentY,
      size: 9,
      font: boldFont,
      color: rgb(0, 0, 0),
    });
    currentContentY -= 12;

    page.drawLine({
      start: { x: contentX, y: currentContentY },
      end: { x: width - contentPadding, y: currentContentY },
      thickness: 1,
      color: rgb(0, 0, 0),
    });
    currentContentY -= 10;

    const summaryLines = wrapText(
      data.summary,
      contentWidth - contentPadding * 2,
      9
    );
    for (const line of summaryLines) {
      if (currentContentY < 50) {
        const newPage = pdfDoc.addPage(PageSizes.A4);
        page = newPage;
        // Redraw sidebar on new page
        page.drawRectangle({
          x: 0,
          y: 0,
          width: sidebarWidth,
          height: height,
          color: rgb(0.25, 0.25, 0.3),
        });
        currentContentY = height - contentPadding;
      }
      page.drawText(line, {
        x: contentX,
        y: currentContentY,
        size: 9,
        font: font,
        color: rgb(0.2, 0.2, 0.2),
      });
      currentContentY -= 10;
    }
    currentContentY -= 10;
  }

  // Professional Experience
  if (data.experience.length > 0) {
    page.drawText("PROFESSIONAL EXPERIENCE", {
      x: contentX,
      y: currentContentY,
      size: 9,
      font: boldFont,
      color: rgb(0, 0, 0),
    });
    currentContentY -= 12;

    page.drawLine({
      start: { x: contentX, y: currentContentY },
      end: { x: width - contentPadding, y: currentContentY },
      thickness: 1,
      color: rgb(0, 0, 0),
    });
    currentContentY -= 10;

    for (const exp of data.experience) {
      if (currentContentY < 80) {
        const newPage = pdfDoc.addPage(PageSizes.A4);
        page = newPage;
        // Redraw sidebar
        page.drawRectangle({
          x: 0,
          y: 0,
          width: sidebarWidth,
          height: height,
          color: rgb(0.25, 0.25, 0.3),
        });
        currentContentY = height - contentPadding;
      }

      // Position
      page.drawText(exp.position || "Position", {
        x: contentX,
        y: currentContentY,
        size: 10,
        font: boldFont,
        color: rgb(0, 0, 0),
      });

      // Company on left
      page.drawText(exp.company || "Company", {
        x: contentX,
        y: currentContentY - 12,
        size: 8,
        font: font,
        color: rgb(0.4, 0.4, 0.4),
      });

      // Dates on right
      const dateRange = `${formatDate(exp.startDate) || "Start"} - ${
        exp.current ? "Present" : formatDate(exp.endDate) || "End"
      }`;
      // Approximate text width (8pt font, ~0.6 width factor)
      const dateWidth = dateRange.length * 8 * 0.6;
      page.drawText(dateRange, {
        x: Math.max(contentX, width - contentPadding - dateWidth),
        y: currentContentY - 12,
        size: 8,
        font: font,
        color: rgb(0.4, 0.4, 0.4),
      });

      currentContentY -= 18;

      // Description
      if (exp.description) {
        const sentences = exp.description
          .split(/[.!?]+/)
          .filter((s) => s.trim())
          .slice(0, 4);
        for (const sentence of sentences) {
          if (currentContentY < 50) {
            const newPage = pdfDoc.addPage(PageSizes.A4);
            page = newPage;
            page.drawRectangle({
              x: 0,
              y: 0,
              width: sidebarWidth,
              height: height,
              color: rgb(0.25, 0.25, 0.3),
            });
            currentContentY = height - contentPadding;
          }
          const bulletText = `• ${sentence.trim()}`;
          const descLines = wrapText(
            bulletText,
            contentWidth - contentPadding * 2 - 10,
            8
          );
          for (const line of descLines) {
            page.drawText(line, {
              x: contentX + 8,
              y: currentContentY,
              size: 8,
              font: font,
              color: rgb(0.2, 0.2, 0.2),
            });
            currentContentY -= 9;
          }
        }
      }

      currentContentY -= 8;
    }
  }
}

/**
 * Modern Two-Column PDF: Full width header, two columns below
 */
async function generateModernTwoColumnPDF(
  pdfDoc: PDFDocument,
  page: any,
  data: ResumeData,
  font: any,
  boldFont: any,
  width: number,
  height: number
) {
  const margin = 20;
  const headerHeight = 50;
  let yPosition = height - margin;

  // Header bar
  page.drawRectangle({
    x: 0,
    y: height - headerHeight,
    width: width,
    height: headerHeight,
    color: rgb(0.2, 0.2, 0.2),
  });

  // Name in header
  page.drawText(data.personalInfo.fullName || "Your Name", {
    x: margin,
    y: height - 25,
    size: 14,
    font: boldFont,
    color: rgb(1, 1, 1),
  });

  // Contact in header
  const contactParts: string[] = [];
  if (data.personalInfo.email) contactParts.push(data.personalInfo.email);
  if (data.personalInfo.phone) contactParts.push(data.personalInfo.phone);
  if (data.personalInfo.location) contactParts.push(data.personalInfo.location);

  if (contactParts.length > 0) {
    page.drawText(contactParts.join(" • "), {
      x: margin,
      y: height - 40,
      size: 8,
      font: font,
      color: rgb(0.8, 0.8, 0.8),
    });
  }

  yPosition = height - headerHeight - 20;

  // Summary
  if (data.summary) {
    page.drawText("PROFESSIONAL SUMMARY", {
      x: margin,
      y: yPosition,
      size: 9,
      font: boldFont,
      color: rgb(0.3, 0.3, 0.3),
    });
    yPosition -= 12;

    const summaryLines = wrapText(data.summary, width - margin * 2, 9);
    for (const line of summaryLines) {
      page.drawText(line, {
        x: margin,
        y: yPosition,
        size: 9,
        font: font,
        color: rgb(0.2, 0.2, 0.2),
      });
      yPosition -= 10;
    }
    yPosition -= 10;
  }

  // Two columns
  const leftColX = margin;
  const rightColX = width / 2 + margin / 2;
  const colWidth = (width - margin * 3) / 2;
  let leftY = yPosition;
  let rightY = yPosition;

  // Left column - Experience
  if (data.experience.length > 0) {
    page.drawText("WORK EXPERIENCE", {
      x: leftColX,
      y: leftY,
      size: 9,
      font: boldFont,
      color: rgb(0.3, 0.3, 0.3),
    });
    leftY -= 12;

    page.drawLine({
      start: { x: leftColX, y: leftY },
      end: { x: leftColX + colWidth, y: leftY },
      thickness: 0.5,
      color: rgb(0.7, 0.7, 0.7),
    });
    leftY -= 10;

    for (const exp of data.experience) {
      if (leftY < 50) {
        const newPage = pdfDoc.addPage(PageSizes.A4);
        page = newPage;
        // Redraw header
        page.drawRectangle({
          x: 0,
          y: height - headerHeight,
          width: width,
          height: headerHeight,
          color: rgb(0.2, 0.2, 0.2),
        });
        page.drawText(data.personalInfo.fullName || "Your Name", {
          x: margin,
          y: height - 25,
          size: 14,
          font: boldFont,
          color: rgb(1, 1, 1),
        });
        leftY = height - headerHeight - 20;
      }

      // Timeline dot and line
      page.drawCircle({
        x: leftColX + 8,
        y: leftY,
        size: 2,
        color: rgb(0.2, 0.2, 0.2),
      });
      page.drawLine({
        start: { x: leftColX + 8, y: leftY + 5 },
        end: { x: leftColX + 8, y: leftY - 30 },
        thickness: 1,
        color: rgb(0.7, 0.7, 0.7),
      });

      page.drawText(exp.position || "Position", {
        x: leftColX + 15,
        y: leftY,
        size: 9,
        font: boldFont,
        color: rgb(0, 0, 0),
      });
      leftY -= 10;

      page.drawText(exp.company || "Company", {
        x: leftColX + 15,
        y: leftY,
        size: 8,
        font: font,
        color: rgb(0.4, 0.4, 0.4),
      });
      leftY -= 9;

      const dateText = `${formatDate(exp.startDate) || "Start"} - ${
        exp.current ? "Present" : formatDate(exp.endDate) || "End"
      }`;
      page.drawText(dateText, {
        x: leftColX + 15,
        y: leftY,
        size: 7,
        font: font,
        color: rgb(0.5, 0.5, 0.5),
      });
      leftY -= 9;

      if (exp.description) {
        const descLines = wrapText(exp.description, colWidth - 20, 8);
        for (const line of descLines) {
          page.drawText(line, {
            x: leftColX + 15,
            y: leftY,
            size: 8,
            font: font,
            color: rgb(0.2, 0.2, 0.2),
          });
          leftY -= 9;
        }
      }

      leftY -= 8;
    }
  }

  // Right column - Education & Skills
  if (data.education.length > 0) {
    page.drawText("EDUCATION", {
      x: rightColX,
      y: rightY,
      size: 9,
      font: boldFont,
      color: rgb(0.3, 0.3, 0.3),
    });
    rightY -= 12;

    page.drawLine({
      start: { x: rightColX, y: rightY },
      end: { x: rightColX + colWidth, y: rightY },
      thickness: 0.5,
      color: rgb(0.7, 0.7, 0.7),
    });
    rightY -= 10;

    for (const edu of data.education) {
      if (rightY < 50) break;

      page.drawText(edu.degree || "Degree", {
        x: rightColX,
        y: rightY,
        size: 9,
        font: boldFont,
        color: rgb(0, 0, 0),
      });
      rightY -= 10;

      if (edu.institution) {
        page.drawText(edu.institution, {
          x: rightColX,
          y: rightY,
          size: 8,
          font: font,
          color: rgb(0.4, 0.4, 0.4),
        });
        rightY -= 9;
      }

      if (edu.year || edu.grade) {
        const detailText = `${edu.year || ""}${
          edu.year && edu.grade ? " • " : ""
        }${edu.grade || ""}`;
        page.drawText(detailText, {
          x: rightColX,
          y: rightY,
          size: 7,
          font: font,
          color: rgb(0.5, 0.5, 0.5),
        });
        rightY -= 9;
      }

      rightY -= 5;
    }
    rightY -= 5;
  }

  // Skills in right column
  if (data.skills.length > 0) {
    page.drawText("SKILLS", {
      x: rightColX,
      y: rightY,
      size: 9,
      font: boldFont,
      color: rgb(0.3, 0.3, 0.3),
    });
    rightY -= 12;

    page.drawLine({
      start: { x: rightColX, y: rightY },
      end: { x: rightColX + colWidth, y: rightY },
      thickness: 0.5,
      color: rgb(0.7, 0.7, 0.7),
    });
    rightY -= 10;

    const skillsPerRow = 2;
    let xOffset = rightColX;
    let skillsInRow = 0;

    for (const skill of data.skills) {
      if (rightY < 50) break;

      const skillText = skill;
      const textWidth = skillText.length * 7 * 0.6; // Approximate width
      if (
        xOffset + textWidth + 10 > rightColX + colWidth ||
        skillsInRow >= skillsPerRow
      ) {
        skillsInRow = 0;
        xOffset = rightColX;
        rightY -= 10;
      }

      if (rightY < 50) break;

      // Draw skill badge background
      page.drawRectangle({
        x: xOffset,
        y: rightY - 6,
        width: textWidth + 4,
        height: 8,
        color: rgb(0.95, 0.95, 0.95),
        borderColor: rgb(0.8, 0.8, 0.8),
        borderWidth: 0.5,
      });

      page.drawText(skillText, {
        x: xOffset + 2,
        y: rightY,
        size: 7,
        font: font,
        color: rgb(0.2, 0.2, 0.2),
      });

      xOffset += textWidth + 8;
      skillsInRow++;
    }
  }
}

/**
 * Modern Minimal PDF: Beige color scheme
 */
async function generateModernMinimalPDF(
  pdfDoc: PDFDocument,
  page: any,
  data: ResumeData,
  font: any,
  boldFont: any,
  width: number,
  height: number
) {
  const sidebarWidth = width * 0.35;
  const contentWidth = width * 0.65;
  const margin = 15;
  const sidebarPadding = 15;
  const contentPadding = 15;

  // Sidebar background (beige)
  page.drawRectangle({
    x: 0,
    y: 0,
    width: sidebarWidth,
    height: height,
    color: rgb(0.91, 0.87, 0.83), // #e8ddd4
  });

  // Main background (lighter beige)
  page.drawRectangle({
    x: sidebarWidth,
    y: 0,
    width: contentWidth,
    height: height,
    color: rgb(0.96, 0.95, 0.92), // #f5f1eb
  });

  let sidebarY = height - sidebarPadding;
  let contentY = height - contentPadding;

  // Profile picture placeholder (circle)
  const circleCenterX = sidebarWidth / 2;
  const circleY = sidebarY;
  page.drawCircle({
    x: circleCenterX,
    y: circleY,
    size: 25,
    borderColor: rgb(0.96, 0.95, 0.92),
    borderWidth: 3,
    color: rgb(1, 1, 1),
  });
  page.drawText("Photo", {
    x: circleCenterX - 10,
    y: circleY - 3,
    size: 7,
    font: font,
    color: rgb(0.6, 0.6, 0.6),
  });

  sidebarY -= 60;

  // Name in sidebar
  const nameParts = (data.personalInfo.fullName || "Your Name").split(" ");
  if (nameParts.length > 0) {
    const firstNameWidth = nameParts[0].length * 12 * 0.6; // Approximate width
    page.drawText(nameParts[0], {
      x: sidebarWidth / 2 - firstNameWidth / 2,
      y: sidebarY,
      size: 12,
      font: boldFont,
      color: rgb(0.1, 0.1, 0.1),
    });
    sidebarY -= 14;
  }
  if (nameParts.length > 1) {
    const lastNameText = nameParts.slice(1).join(" ");
    const lastNameWidth = lastNameText.length * 12 * 0.6;
    page.drawText(lastNameText, {
      x: sidebarWidth / 2 - lastNameWidth / 2,
      y: sidebarY,
      size: 12,
      font: boldFont,
      color: rgb(0.1, 0.1, 0.1),
    });
    sidebarY -= 14;
  }

  if (data.personalInfo.email) {
    const emailWidth = data.personalInfo.email.length * 8 * 0.6;
    page.drawText(data.personalInfo.email, {
      x: sidebarWidth / 2 - emailWidth / 2,
      y: sidebarY,
      size: 8,
      font: font,
      color: rgb(0.3, 0.3, 0.3),
    });
    sidebarY -= 12;
  }

  sidebarY -= 10;

  // Contact in sidebar
  page.drawText("CONTACT", {
    x: sidebarPadding,
    y: sidebarY,
    size: 8,
    font: boldFont,
    color: rgb(0.2, 0.2, 0.2),
  });
  sidebarY -= 10;

  page.drawLine({
    start: { x: sidebarPadding, y: sidebarY },
    end: { x: sidebarWidth - sidebarPadding, y: sidebarY },
    thickness: 0.5,
    color: rgb(0.6, 0.6, 0.6),
  });
  sidebarY -= 8;

  if (data.personalInfo.phone) {
    page.drawText(`☎ ${data.personalInfo.phone}`, {
      x: sidebarPadding,
      y: sidebarY,
      size: 8,
      font: font,
      color: rgb(0.3, 0.3, 0.3),
    });
    sidebarY -= 9;
  }

  if (data.personalInfo.email) {
    page.drawText(`✉ ${data.personalInfo.email}`, {
      x: sidebarPadding,
      y: sidebarY,
      size: 8,
      font: font,
      color: rgb(0.3, 0.3, 0.3),
    });
    sidebarY -= 9;
  }

  if (data.personalInfo.location) {
    page.drawText(`📍 ${data.personalInfo.location}`, {
      x: sidebarPadding,
      y: sidebarY,
      size: 8,
      font: font,
      color: rgb(0.3, 0.3, 0.3),
    });
    sidebarY -= 9;
  }

  if (data.personalInfo.website) {
    const websiteText = `🌐 ${data.personalInfo.website}`;
    const websiteLines = wrapText(
      websiteText,
      sidebarWidth - sidebarPadding * 2,
      8
    );
    for (const line of websiteLines) {
      page.drawText(line, {
        x: sidebarPadding,
        y: sidebarY,
        size: 8,
        font: font,
        color: rgb(0.3, 0.3, 0.3),
      });
      sidebarY -= 9;
    }
  }

  sidebarY -= 10;

  // Education in sidebar
  if (data.education.length > 0) {
    page.drawText("EDUCATION", {
      x: sidebarPadding,
      y: sidebarY,
      size: 8,
      font: boldFont,
      color: rgb(0.2, 0.2, 0.2),
    });
    sidebarY -= 10;

    page.drawLine({
      start: { x: sidebarPadding, y: sidebarY },
      end: { x: sidebarWidth - sidebarPadding, y: sidebarY },
      thickness: 0.5,
      color: rgb(0.6, 0.6, 0.6),
    });
    sidebarY -= 8;

    for (const edu of data.education) {
      if (sidebarY < 50) break;

      page.drawText(edu.degree || "Degree", {
        x: sidebarPadding,
        y: sidebarY,
        size: 9,
        font: boldFont,
        color: rgb(0.1, 0.1, 0.1),
      });
      sidebarY -= 10;

      if (edu.year) {
        page.drawText(`(${edu.year})`, {
          x: sidebarPadding,
          y: sidebarY,
          size: 8,
          font: font,
          color: rgb(0.4, 0.4, 0.4),
        });
        sidebarY -= 9;
      }

      if (edu.institution) {
        page.drawText(edu.institution, {
          x: sidebarPadding,
          y: sidebarY,
          size: 8,
          font: font,
          color: rgb(0.3, 0.3, 0.3),
        });
        sidebarY -= 9;
      }

      if (edu.grade) {
        page.drawText(`GPA: ${edu.grade}`, {
          x: sidebarPadding,
          y: sidebarY,
          size: 7,
          font: font,
          color: rgb(0.4, 0.4, 0.4),
        });
        sidebarY -= 8;
      }

      sidebarY -= 5;
    }
    sidebarY -= 5;
  }

  // Skills in sidebar
  if (data.skills.length > 0) {
    page.drawText("SKILL", {
      x: sidebarPadding,
      y: sidebarY,
      size: 8,
      font: boldFont,
      color: rgb(0.2, 0.2, 0.2),
    });
    sidebarY -= 10;

    page.drawLine({
      start: { x: sidebarPadding, y: sidebarY },
      end: { x: sidebarWidth - sidebarPadding, y: sidebarY },
      thickness: 0.5,
      color: rgb(0.6, 0.6, 0.6),
    });
    sidebarY -= 8;

    for (const skill of data.skills) {
      if (sidebarY < 50) break;
      page.drawText(`• ${skill}`, {
        x: sidebarPadding,
        y: sidebarY,
        size: 8,
        font: font,
        color: rgb(0.3, 0.3, 0.3),
      });
      sidebarY -= 9;
    }
  }

  // Main content (right side)
  const contentX = sidebarWidth + contentPadding;

  // Profile
  if (data.summary) {
    page.drawCircle({
      x: contentX + 3,
      y: contentY,
      size: 1.5,
      color: rgb(0.2, 0.2, 0.2),
    });
    page.drawText("PROFILE", {
      x: contentX + 8,
      y: contentY,
      size: 9,
      font: boldFont,
      color: rgb(0.2, 0.2, 0.2),
    });
    contentY -= 12;

    // Dashed line (simulated with dots)
    for (let x = contentX; x < width - contentPadding; x += 3) {
      page.drawCircle({
        x: x,
        y: contentY,
        size: 0.3,
        color: rgb(0.6, 0.6, 0.6),
      });
    }
    contentY -= 10;

    const summaryLines = wrapText(
      data.summary,
      contentWidth - contentPadding * 2,
      8
    );
    for (const line of summaryLines) {
      if (contentY < 50) {
        const newPage = pdfDoc.addPage(PageSizes.A4);
        page = newPage;
        page.drawRectangle({
          x: 0,
          y: 0,
          width: sidebarWidth,
          height: height,
          color: rgb(0.91, 0.87, 0.83),
        });
        page.drawRectangle({
          x: sidebarWidth,
          y: 0,
          width: contentWidth,
          height: height,
          color: rgb(0.96, 0.95, 0.92),
        });
        contentY = height - contentPadding;
      }
      page.drawText(line, {
        x: contentX,
        y: contentY,
        size: 8,
        font: font,
        color: rgb(0.2, 0.2, 0.2),
      });
      contentY -= 9;
    }
    contentY -= 8;
  }

  // Work Experience
  if (data.experience.length > 0) {
    page.drawCircle({
      x: contentX + 3,
      y: contentY,
      size: 1.5,
      color: rgb(0.2, 0.2, 0.2),
    });
    page.drawText("WORK EXPERIENCE", {
      x: contentX + 8,
      y: contentY,
      size: 9,
      font: boldFont,
      color: rgb(0.2, 0.2, 0.2),
    });
    contentY -= 12;

    // Dashed line
    for (let x = contentX; x < width - contentPadding; x += 3) {
      page.drawCircle({
        x: x,
        y: contentY,
        size: 0.3,
        color: rgb(0.6, 0.6, 0.6),
      });
    }
    contentY -= 10;

    for (const exp of data.experience) {
      if (contentY < 80) {
        const newPage = pdfDoc.addPage(PageSizes.A4);
        page = newPage;
        page.drawRectangle({
          x: 0,
          y: 0,
          width: sidebarWidth,
          height: height,
          color: rgb(0.91, 0.87, 0.83),
        });
        page.drawRectangle({
          x: sidebarWidth,
          y: 0,
          width: contentWidth,
          height: height,
          color: rgb(0.96, 0.95, 0.92),
        });
        contentY = height - contentPadding;
      }

      page.drawText(exp.position || "Position", {
        x: contentX,
        y: contentY,
        size: 9,
        font: boldFont,
        color: rgb(0.1, 0.1, 0.1),
      });
      contentY -= 10;

      const companyDate = `${exp.company || "Company"} (${
        formatDate(exp.startDate) || "Start"
      } - ${exp.current ? "present" : formatDate(exp.endDate) || "End"})`;
      page.drawText(companyDate, {
        x: contentX,
        y: contentY,
        size: 8,
        font: font,
        color: rgb(0.4, 0.4, 0.4),
      });
      contentY -= 9;

      if (exp.description) {
        const sentences = exp.description
          .split(/[.!?]+/)
          .filter((s) => s.trim());
        for (const sentence of sentences) {
          if (contentY < 50) {
            const newPage = pdfDoc.addPage(PageSizes.A4);
            page = newPage;
            page.drawRectangle({
              x: 0,
              y: 0,
              width: sidebarWidth,
              height: height,
              color: rgb(0.91, 0.87, 0.83),
            });
            page.drawRectangle({
              x: sidebarWidth,
              y: 0,
              width: contentWidth,
              height: height,
              color: rgb(0.96, 0.95, 0.92),
            });
            contentY = height - contentPadding;
          }
          const bulletText = `• ${sentence.trim()}`;
          const descLines = wrapText(
            bulletText,
            contentWidth - contentPadding * 2 - 8,
            8
          );
          for (const line of descLines) {
            page.drawText(line, {
              x: contentX + 8,
              y: contentY,
              size: 8,
              font: font,
              color: rgb(0.2, 0.2, 0.2),
            });
            contentY -= 9;
          }
        }
      }

      contentY -= 8;
    }
  }
}

/**
 * Classic design: Traditional, formal layout
 */
async function generateClassicResume(
  pdfDoc: PDFDocument,
  page: any,
  data: ResumeData,
  font: any,
  boldFont: any,
  width: number,
  height: number
) {
  const margin = 60;
  const contentWidth = width - margin * 2;
  let yPosition = height - margin;

  // Name centered at top (professional size)
  page.drawText(data.personalInfo.fullName || "Your Name", {
    x: margin,
    y: yPosition,
    size: 16,
    font: boldFont,
    color: rgb(0, 0, 0),
  });

  // Contact info centered
  const contactInfo: string[] = [];
  if (data.personalInfo.email) contactInfo.push(data.personalInfo.email);
  if (data.personalInfo.phone) contactInfo.push(data.personalInfo.phone);
  if (data.personalInfo.location) contactInfo.push(data.personalInfo.location);
  if (data.personalInfo.linkedIn) contactInfo.push(data.personalInfo.linkedIn);
  if (data.personalInfo.website) contactInfo.push(data.personalInfo.website);

  yPosition -= 25;
  page.drawText(contactInfo.join(" | "), {
    x: margin,
    y: yPosition,
    size: 10,
    font: font,
    color: rgb(0.2, 0.2, 0.2),
  });

  yPosition -= 30;

  // Horizontal line
  page.drawLine({
    start: { x: margin, y: yPosition },
    end: { x: width - margin, y: yPosition },
    thickness: 1,
    color: rgb(0, 0, 0),
  });

  yPosition -= 25;

  // Professional Summary
  if (data.summary) {
    yPosition = addSection(
      page,
      "PROFESSIONAL SUMMARY",
      data.summary,
      yPosition,
      margin,
      contentWidth,
      font,
      boldFont,
      rgb(0, 0, 0),
      10,
      9
    );
    yPosition -= 15;
  }

  // Experience
  if (data.experience.length > 0) {
    yPosition = addSection(
      page,
      "PROFESSIONAL EXPERIENCE",
      "",
      yPosition,
      margin,
      contentWidth,
      font,
      boldFont,
      rgb(0, 0, 0),
      10,
      9
    );
    yPosition -= 10;

    for (const exp of data.experience) {
      if (yPosition < 100) {
        const newPage = pdfDoc.addPage(PageSizes.A4);
        yPosition = height - margin;
        page = newPage;
      }

      // Position bold (professional size)
      page.drawText(exp.position || "Position", {
        x: margin,
        y: yPosition,
        size: 10,
        font: boldFont,
        color: rgb(0, 0, 0),
      });

      // Company and dates
      const dateRange = `${formatDate(exp.startDate) || "Start"} - ${
        exp.current ? "Present" : formatDate(exp.endDate) || "End"
      }`;
      const companyText = `${exp.company || "Company"} | ${dateRange}`;
      yPosition -= 12;
      page.drawText(companyText, {
        x: margin + 12,
        y: yPosition,
        size: 9,
        font: font,
        color: rgb(0.2, 0.2, 0.2),
      });

      // Description with bullet points
      if (exp.description) {
        yPosition -= 16;
        const sentences = exp.description
          .split(/[.!?]+/)
          .filter((s) => s.trim());
        for (const sentence of sentences) {
          if (yPosition < 80) {
            const newPage = pdfDoc.addPage(PageSizes.A4);
            yPosition = height - margin;
            page = newPage;
          }
          const bulletText = `• ${sentence.trim()}`;
          const descLines = wrapText(bulletText, contentWidth - 12, 9);
          for (const line of descLines) {
            page.drawText(line, {
              x: margin + 12,
              y: yPosition,
              size: 9,
              font: font,
              color: rgb(0.2, 0.2, 0.2),
            });
            yPosition -= 10;
          }
        }
      }

      yPosition -= 12;
    }
  }

  // Education
  if (data.education.length > 0) {
    if (yPosition < 150) {
      const newPage = pdfDoc.addPage(PageSizes.A4);
      yPosition = height - margin;
      page = newPage;
    }

    yPosition = addSection(
      page,
      "EDUCATION",
      "",
      yPosition,
      margin,
      contentWidth,
      font,
      boldFont,
      rgb(0, 0, 0),
      10,
      9
    );
    yPosition -= 8;

    for (const edu of data.education) {
      if (yPosition < 80) {
        const newPage = pdfDoc.addPage(PageSizes.A4);
        yPosition = height - margin;
        page = newPage;
      }

      page.drawText(edu.degree || "Degree", {
        x: margin,
        y: yPosition,
        size: 10,
        font: boldFont,
        color: rgb(0, 0, 0),
      });

      const eduDetails = `${edu.institution || "Institution"}${
        edu.year ? `, ${edu.year}` : ""
      }${edu.grade ? ` - ${edu.grade}` : ""}`;
      yPosition -= 12;
      page.drawText(eduDetails, {
        x: margin + 12,
        y: yPosition,
        size: 9,
        font: font,
        color: rgb(0.2, 0.2, 0.2),
      });

      yPosition -= 15;
    }
  }

  // Skills
  if (data.skills.length > 0) {
    if (yPosition < 100) {
      const newPage = pdfDoc.addPage(PageSizes.A4);
      yPosition = height - margin;
      page = newPage;
    }

    yPosition = addSection(
      page,
      "SKILLS",
      "",
      yPosition,
      margin,
      contentWidth,
      font,
      boldFont,
      rgb(0, 0, 0),
      10,
      9
    );
    yPosition -= 8;

    // Skills in columns
    const skillsPerLine = 3;
    const skillWidth = contentWidth / skillsPerLine;
    let xOffset = margin;
    let skillsOnLine = 0;

    for (const skill of data.skills) {
      if (skillsOnLine >= skillsPerLine) {
        skillsOnLine = 0;
        xOffset = margin;
        yPosition -= 10;
      }

      if (yPosition < 80) {
        const newPage = pdfDoc.addPage(PageSizes.A4);
        yPosition = height - margin;
        page = newPage;
        xOffset = margin;
        skillsOnLine = 0;
      }

      page.drawText(`• ${skill}`, {
        x: xOffset,
        y: yPosition,
        size: 9,
        font: font,
        color: rgb(0.2, 0.2, 0.2),
      });

      xOffset += skillWidth;
      skillsOnLine++;
    }
  }
}

/**
 * Helper function to add a section with title and optional content
 */
function addSection(
  page: any,
  title: string,
  content: string,
  yPosition: number,
  margin: number,
  contentWidth: number,
  font: any,
  boldFont: any,
  titleColor: any,
  titleSize: number,
  contentSize: number
): number {
  // Section title
  page.drawText(title, {
    x: margin,
    y: yPosition,
    size: titleSize,
    font: boldFont,
    color: titleColor,
  });

  yPosition -= 20;

  // Content if provided
  if (content) {
    const lines = wrapText(content, contentWidth, contentSize);
    for (const line of lines) {
      page.drawText(line, {
        x: margin,
        y: yPosition,
        size: contentSize,
        font: font,
        color: rgb(0.2, 0.2, 0.2),
      });
      yPosition -= contentSize + 2;
    }
  }

  return yPosition;
}

/**
 * Wrap text to fit within specified width
 */
function wrapText(text: string, maxWidth: number, fontSize: number): string[] {
  const words = text.split(" ");
  const lines: string[] = [];
  let currentLine = "";

  // Approximate character width (Helvetica average)
  const charWidth = fontSize * 0.6;

  for (const word of words) {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    const testWidth = testLine.length * charWidth;

    if (testWidth > maxWidth && currentLine) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = testLine;
    }
  }

  if (currentLine) {
    lines.push(currentLine);
  }

  return lines;
}
