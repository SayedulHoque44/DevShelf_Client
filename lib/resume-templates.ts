export type ResumeTemplateId =
  | "classic"
  | "modern-sidebar"
  | "modern-two-column"
  | "modern-minimal";

export interface ResumeTemplate {
  id: ResumeTemplateId;
  name: string;
  description: string;
  category: "classic" | "modern";
  supportsProfilePicture: boolean;
  preview: string;
}

export const resumeTemplates: ResumeTemplate[] = [
  {
    id: "classic",
    name: "Classic",
    description:
      "Traditional single-column layout, perfect for formal applications",
    category: "classic",
    supportsProfilePicture: false,
    preview: "Traditional layout with centered header and clean sections",
  },
  {
    id: "modern-sidebar",
    name: "Modern Sidebar",
    description:
      "Two-column layout with colored sidebar, perfect for modern professionals",
    category: "modern",
    supportsProfilePicture: true,
    preview: "Sidebar with contact info, skills, and education on left",
  },
  {
    id: "modern-two-column",
    name: "Modern Two-Column",
    description: "Clean two-column design with balanced layout",
    category: "modern",
    supportsProfilePicture: false,
    preview: "Two-column layout with header spanning full width",
  },
  {
    id: "modern-minimal",
    name: "Modern Minimal",
    description: "Minimalist design with subtle colors and elegant typography",
    category: "modern",
    supportsProfilePicture: true,
    preview: "Minimalist beige color scheme with circular profile picture",
  },
];

export function getTemplateById(id: ResumeTemplateId): ResumeTemplate {
  return resumeTemplates.find((t) => t.id === id) || resumeTemplates[0];
}
