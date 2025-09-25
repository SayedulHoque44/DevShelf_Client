"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  Code,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Undo,
  Redo,
  Link as LinkIcon,
  Image as ImageIcon,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
} from "lucide-react";

interface SimpleRichEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
  className?: string;
}

export function SimpleRichEditor({
  content,
  onChange,
  placeholder = "Start writing...",
  className = "",
}: SimpleRichEditorProps) {
  const [isMounted, setIsMounted] = useState(false);
  const [htmlContent, setHtmlContent] = useState(content);
  const editorRef = useRef<HTMLDivElement>(null);
  const lastExternalContent = useRef(content);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Set initial content
  useEffect(() => {
    if (isMounted && editorRef.current && !editorRef.current.innerHTML) {
      editorRef.current.innerHTML = content;
    }
  }, [isMounted, content]);

  // Only update content if it's from external source and editor is not focused
  useEffect(() => {
    if (content !== lastExternalContent.current) {
      lastExternalContent.current = content;
      const isFocused = document.activeElement === editorRef.current;
      if (!isFocused) {
        setHtmlContent(content);
        // Directly update the DOM without React re-render
        if (editorRef.current) {
          editorRef.current.innerHTML = content;
        }
      }
    }
  }, [content]);

  if (!isMounted) {
    return (
      <div className={`border rounded-lg ${className}`}>
        <div className="border-b p-2 flex flex-wrap gap-1">
          <div className="text-sm text-gray-500">Loading editor...</div>
        </div>
        <div className="min-h-[400px] p-4 flex items-center justify-center text-gray-500">
          Initializing editor...
        </div>
      </div>
    );
  }

  const addLink = () => {
    const url = window.prompt("Enter URL:");
    if (url) {
      const text = window.getSelection()?.toString() || "Link";
      const linkHtml = `<a href="${url}" class="text-blue-600 underline">${text}</a>`;
      const newContent = htmlContent + linkHtml;
      setHtmlContent(newContent);
      onChange(newContent);
    }
  };

  const addImage = () => {
    const url = window.prompt("Enter image URL:");
    if (url) {
      const alt = window.prompt("Enter alt text (optional):") || "";
      const imgHtml = `<img src="${url}" alt="${alt}" class="max-w-full h-auto rounded-lg" />`;
      const newContent = htmlContent + imgHtml;
      setHtmlContent(newContent);
      onChange(newContent);
    }
  };

  const formatText = (tag: string, className?: string) => {
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      const selectedText = range.toString();
      if (selectedText) {
        const formattedText = className
          ? `<${tag} class="${className}">${selectedText}</${tag}>`
          : `<${tag}>${selectedText}</${tag}>`;

        range.deleteContents();
        range.insertNode(
          document.createRange().createContextualFragment(formattedText)
        );

        const newContent =
          document.getElementById("editor-content")?.innerHTML || htmlContent;
        setHtmlContent(newContent);
        onChange(newContent);
      }
    }
  };

  const insertElement = (
    tag: string,
    className?: string,
    placeholder?: string
  ) => {
    const element = className
      ? `<${tag} class="${className}">${placeholder || ""}</${tag}>`
      : `<${tag}>${placeholder || ""}</${tag}>`;

    const newContent = htmlContent + element;
    setHtmlContent(newContent);
    onChange(newContent);
  };

  const handleContentChange = (e: React.FormEvent<HTMLDivElement>) => {
    const newContent = e.currentTarget.innerHTML;
    setHtmlContent(newContent);
    onChange(newContent);
  };

  return (
    <div className={`border rounded-lg ${className}`}>
      {/* Toolbar */}
      <div className="border-b p-2 flex flex-wrap gap-1">
        {/* Text Formatting */}
        <div className="flex gap-1 border-r pr-2 mr-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => formatText("strong")}
            title="Bold"
          >
            <Bold className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => formatText("em")}
            title="Italic"
          >
            <Italic className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => formatText("u")}
            title="Underline"
          >
            <UnderlineIcon className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => formatText("s")}
            title="Strikethrough"
          >
            <Strikethrough className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => formatText("code")}
            title="Code"
          >
            <Code className="w-4 h-4" />
          </Button>
        </div>

        {/* Headings */}
        <div className="flex gap-1 border-r pr-2 mr-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() =>
              insertElement("h1", "text-2xl font-bold mb-4", "Heading 1")
            }
            title="Heading 1"
          >
            <Heading1 className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() =>
              insertElement("h2", "text-xl font-bold mb-3", "Heading 2")
            }
            title="Heading 2"
          >
            <Heading2 className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() =>
              insertElement("h3", "text-lg font-bold mb-2", "Heading 3")
            }
            title="Heading 3"
          >
            <Heading3 className="w-4 h-4" />
          </Button>
        </div>

        {/* Lists */}
        <div className="flex gap-1 border-r pr-2 mr-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() =>
              insertElement(
                "ul",
                "list-disc list-inside mb-4",
                "<li>List item</li>"
              )
            }
            title="Bullet List"
          >
            <List className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() =>
              insertElement(
                "ol",
                "list-decimal list-inside mb-4",
                "<li>List item</li>"
              )
            }
            title="Numbered List"
          >
            <ListOrdered className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() =>
              insertElement(
                "blockquote",
                "border-l-4 border-gray-300 pl-4 italic mb-4",
                "Quote text"
              )
            }
            title="Quote"
          >
            <Quote className="w-4 h-4" />
          </Button>
        </div>

        {/* Alignment */}
        <div className="flex gap-1 border-r pr-2 mr-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() =>
              insertElement("div", "text-left", "Left aligned text")
            }
            title="Align Left"
          >
            <AlignLeft className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() =>
              insertElement("div", "text-center", "Center aligned text")
            }
            title="Align Center"
          >
            <AlignCenter className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() =>
              insertElement("div", "text-right", "Right aligned text")
            }
            title="Align Right"
          >
            <AlignRight className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() =>
              insertElement("div", "text-justify", "Justified text")
            }
            title="Justify"
          >
            <AlignJustify className="w-4 h-4" />
          </Button>
        </div>

        {/* Media */}
        <div className="flex gap-1">
          <Button variant="ghost" size="sm" onClick={addLink} title="Add Link">
            <LinkIcon className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={addImage}
            title="Add Image"
          >
            <ImageIcon className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Editor Content */}
      <div
        ref={editorRef}
        id="editor-content"
        contentEditable
        onInput={handleContentChange}
        className="prose prose-sm max-w-none min-h-[400px] p-4 focus:outline-none"
        style={{ minHeight: "400px" }}
        suppressContentEditableWarning={true}
      />
    </div>
  );
}
