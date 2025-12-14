"use client";

import { useState, useRef, useEffect } from 'react';
import { Bold, Italic, Underline, List, ListOrdered, Link as LinkIcon, Image as ImageIcon, Eye, Edit, Upload, X } from 'lucide-react';

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
}

export default function MarkdownEditor({
  value,
  onChange,
  label = "Contenu",
  placeholder = "Écrivez votre contenu ici...",
}: MarkdownEditorProps) {
  const [showPreview, setShowPreview] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);

  const insertText = (before: string, after: string = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    // Focus the textarea first
    textarea.focus();

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);
    const newText = value.substring(0, start) + before + selectedText + after + value.substring(end);
    
    onChange(newText);
    
    // Restore cursor position
    setTimeout(() => {
      textarea.focus();
      const newStart = start + before.length;
      const newEnd = newStart + selectedText.length;
      textarea.setSelectionRange(newStart, newEnd);
    }, 0);
  };

  const insertLine = (prefix: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const lines = value.substring(0, start).split('\n');
    const currentLine = lines.length - 1;
    const lineStart = value.substring(0, start).lastIndexOf('\n') + 1;
    const lineEnd = value.indexOf('\n', start);
    const lineText = value.substring(lineStart, lineEnd === -1 ? value.length : lineEnd);
    
    const newLine = prefix + (lineText.trim() || '');
    const newText = value.substring(0, lineStart) + newLine + value.substring(lineEnd === -1 ? value.length : lineEnd);
    
    onChange(newText);
    
    setTimeout(() => {
      textarea.focus();
      const newPos = lineStart + newLine.length;
      textarea.setSelectionRange(newPos, newPos);
    }, 0);
  };

  const handleDragEnter = (e: React.DragEvent) => {
    // Ignore drag events from textarea/input elements (text selection)
    const target = e.target as HTMLElement;
    if (target.tagName === 'TEXTAREA' || target.tagName === 'INPUT') {
      return;
    }
    
    // Only handle file drags (check if files are being dragged)
    if (e.dataTransfer.types.includes('Files')) {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    const target = e.target as HTMLElement;
    if (target.tagName === 'TEXTAREA' || target.tagName === 'INPUT') {
      return;
    }
    
    e.preventDefault();
    e.stopPropagation();
    if (e.currentTarget === dropZoneRef.current) {
      setIsDragging(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    // Only prevent default if files are being dragged
    if (e.dataTransfer.types.includes('Files')) {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    // Ignore drops on textarea/input (text selection)
    const target = e.target as HTMLElement;
    if (target.tagName === 'TEXTAREA' || target.tagName === 'INPUT') {
      return;
    }
    
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      await handleFileUpload(files[0]);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      await handleFileUpload(files[0]);
    }
  };

  // Convert HTML to Markdown when pasting
  const convertHtmlToMarkdown = (html: string): string => {
    // Create a temporary div to parse HTML
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    
    // Function to recursively convert nodes
    const convertNode = (node: Node): string => {
      if (node.nodeType === Node.TEXT_NODE) {
        return node.textContent || '';
      }
      
      if (node.nodeType !== Node.ELEMENT_NODE) {
        return '';
      }
      
      const element = node as HTMLElement;
      const tagName = element.tagName.toLowerCase();
      const children = Array.from(node.childNodes).map(convertNode).join('');
      
      switch (tagName) {
        case 'strong':
        case 'b':
          return `**${children}**`;
        case 'em':
        case 'i':
          return `*${children}*`;
        case 'u':
          return `<u>${children}</u>`;
        case 'h1':
          return `# ${children}\n\n`;
        case 'h2':
          return `## ${children}\n\n`;
        case 'h3':
          return `### ${children}\n\n`;
        case 'h4':
          return `#### ${children}\n\n`;
        case 'h5':
          return `##### ${children}\n\n`;
        case 'h6':
          return `###### ${children}\n\n`;
        case 'p':
          return `${children}\n\n`;
        case 'br':
          return '\n';
        case 'ul':
        case 'ol':
          return `${children}\n`;
        case 'li':
          return `- ${children}\n`;
        default:
          return children;
      }
    };
    
    return Array.from(tempDiv.childNodes)
      .map(convertNode)
      .join('')
      .trim();
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    e.preventDefault();
    const textarea = textareaRef.current;
    if (!textarea) return;

    const clipboardData = e.clipboardData;
    const html = clipboardData.getData('text/html');
    const plainText = clipboardData.getData('text/plain');

    let textToInsert = plainText;

    // If HTML is available, try to convert it to Markdown
    if (html) {
      textToInsert = convertHtmlToMarkdown(html);
    }

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const newText = value.substring(0, start) + textToInsert + value.substring(end);
    
    onChange(newText);
    
    // Restore cursor position
    setTimeout(() => {
      textarea.focus();
      const newPos = start + textToInsert.length;
      textarea.setSelectionRange(newPos, newPos);
    }, 0);
  };

  const handleFileUpload = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Veuillez sélectionner un fichier image');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      alert('Le fichier est trop volumineux (max 10MB)');
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append('images', file);

      const response = await fetch('/api/admin/images/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      if (response.ok && data.success && data.files.length > 0) {
        const imageUrl = data.files[0];
        const alt = prompt('Texte alternatif pour l\'image (optionnel):', '');
        const textarea = textareaRef.current;
        if (textarea) {
          const start = textarea.selectionStart;
          const end = textarea.selectionEnd;
          const imageMarkdown = `![${alt || ''}](${imageUrl})`;
          const newText = value.substring(0, start) + imageMarkdown + value.substring(end);
          onChange(newText);
          setTimeout(() => {
            textarea.focus();
            const newPos = start + imageMarkdown.length;
            textarea.setSelectionRange(newPos, newPos);
          }, 0);
        } else {
          // Fallback if textarea is not available
          onChange(value + `\n\n![${alt || ''}](${imageUrl})`);
        }
      } else {
        throw new Error(data.error || 'Erreur lors de l\'upload');
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Erreur lors de l\'upload de l\'image');
    } finally {
      setUploading(false);
      setUploadProgress(0);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleImageButtonClick = () => {
    fileInputRef.current?.click();
  };

  const renderMarkdown = (text: string): string => {
    // Simple markdown rendering
    let html = text
      // Headers
      .replace(/^### (.*$)/gim, '<h3 class="text-xl font-bold mt-4 mb-2">$1</h3>')
      .replace(/^## (.*$)/gim, '<h2 class="text-2xl font-bold mt-6 mb-3">$1</h2>')
      .replace(/^# (.*$)/gim, '<h1 class="text-3xl font-bold mt-8 mb-4">$1</h1>')
      // Bold
      .replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold">$1</strong>')
      .replace(/__(.*?)__/g, '<strong class="font-bold">$1</strong>')
      // Italic
      .replace(/\*(.*?)\*/g, '<em class="italic">$1</em>')
      .replace(/_(.*?)_/g, '<em class="italic">$1</em>')
      // Underline (custom syntax)
      .replace(/<u>(.*?)<\/u>/g, '<u class="underline">$1</u>')
      // Links
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-orange-600 hover:text-orange-700 underline" target="_blank" rel="noopener noreferrer">$1</a>')
      // Images
      .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" class="max-w-full h-auto rounded-lg my-4" />')
      // Lists
      .replace(/^\* (.*$)/gim, '<li class="ml-4">$1</li>')
      .replace(/^- (.*$)/gim, '<li class="ml-4">$1</li>')
      .replace(/^(\d+)\. (.*$)/gim, '<li class="ml-4">$2</li>');

    // Wrap consecutive list items
    html = html.replace(/(<li class="ml-4">.*<\/li>\n?)+/g, (match) => {
      return '<ul class="list-disc list-inside mb-4 space-y-1">' + match + '</ul>';
    });

    // Paragraphs
    const lines = html.split('\n');
    const paragraphs: string[] = [];
    let currentParagraph = '';

    lines.forEach((line) => {
      const trimmed = line.trim();
      if (!trimmed) {
        if (currentParagraph) {
          paragraphs.push(`<p class="mb-4 leading-relaxed">${currentParagraph}</p>`);
          currentParagraph = '';
        }
      } else if (trimmed.startsWith('<')) {
        if (currentParagraph) {
          paragraphs.push(`<p class="mb-4 leading-relaxed">${currentParagraph}</p>`);
          currentParagraph = '';
        }
        paragraphs.push(trimmed);
      } else {
        currentParagraph += (currentParagraph ? ' ' : '') + trimmed;
      }
    });

    if (currentParagraph) {
      paragraphs.push(`<p class="mb-4 leading-relaxed">${currentParagraph}</p>`);
    }

    return paragraphs.join('\n');
  };

  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
      )}
      
      {/* Toolbar */}
      <div className="flex items-center gap-1 p-2 bg-gray-50 border-2 border-gray-300 rounded-t-lg border-b-0">
        <div className="flex items-center gap-1 border-r border-gray-300 pr-2 mr-2">
          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault(); // Prevent losing textarea focus
              insertText('**', '**');
            }}
            className="p-2 hover:bg-gray-200 rounded transition-colors"
            title="Gras"
          >
            <Bold className="w-4 h-4" />
          </button>
          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault(); // Prevent losing textarea focus
              insertText('*', '*');
            }}
            className="p-2 hover:bg-gray-200 rounded transition-colors"
            title="Italique"
          >
            <Italic className="w-4 h-4" />
          </button>
          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault(); // Prevent losing textarea focus
              insertText('<u>', '</u>');
            }}
            className="p-2 hover:bg-gray-200 rounded transition-colors"
            title="Souligné"
          >
            <Underline className="w-4 h-4" />
          </button>
        </div>
        
        <div className="flex items-center gap-1 border-r border-gray-300 pr-2 mr-2">
          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault(); // Prevent losing textarea focus
              insertLine('# ');
            }}
            className="p-2 hover:bg-gray-200 rounded transition-colors"
            title="Titre 1"
          >
            <span className="text-xs font-bold">H1</span>
          </button>
          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault(); // Prevent losing textarea focus
              insertLine('## ');
            }}
            className="p-2 hover:bg-gray-200 rounded transition-colors"
            title="Titre 2"
          >
            <span className="text-xs font-bold">H2</span>
          </button>
          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault(); // Prevent losing textarea focus
              insertLine('### ');
            }}
            className="p-2 hover:bg-gray-200 rounded transition-colors"
            title="Titre 3"
          >
            <span className="text-xs font-bold">H3</span>
          </button>
        </div>

        <div className="flex items-center gap-1 border-r border-gray-300 pr-2 mr-2">
          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault(); // Prevent losing textarea focus
              insertLine('- ');
            }}
            className="p-2 hover:bg-gray-200 rounded transition-colors"
            title="Liste à puces"
          >
            <List className="w-4 h-4" />
          </button>
          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault(); // Prevent losing textarea focus
              insertLine('1. ');
            }}
            className="p-2 hover:bg-gray-200 rounded transition-colors"
            title="Liste numérotée"
          >
            <ListOrdered className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center gap-1 border-r border-gray-300 pr-2 mr-2">
          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault(); // Prevent losing textarea focus
              const textarea = textareaRef.current;
              if (!textarea) return;
              
              const url = prompt('URL du lien:');
              const text = prompt('Texte du lien:', 'Lien');
              if (url && text) {
                const start = textarea.selectionStart;
                const end = textarea.selectionEnd;
                const linkMarkdown = `[${text}](${url})`;
                const newText = value.substring(0, start) + linkMarkdown + value.substring(end);
                onChange(newText);
                setTimeout(() => {
                  textarea.focus();
                  const newPos = start + linkMarkdown.length;
                  textarea.setSelectionRange(newPos, newPos);
                }, 0);
              }
            }}
            className="p-2 hover:bg-gray-200 rounded transition-colors"
            title="Lien"
          >
            <LinkIcon className="w-4 h-4" />
          </button>
          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault(); // Prevent losing textarea focus
              handleImageButtonClick();
            }}
            className="p-2 hover:bg-gray-200 rounded transition-colors"
            title="Uploader une image"
            disabled={uploading}
          >
            {uploading ? (
              <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
            ) : (
              <Upload className="w-4 h-4" />
            )}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>

        <div className="flex-1" />

        <button
          type="button"
          onMouseDown={(e) => {
            e.preventDefault(); // Prevent losing textarea focus
            setShowPreview(!showPreview);
          }}
          className="p-2 hover:bg-gray-200 rounded transition-colors"
          title={showPreview ? "Mode édition" : "Aperçu"}
        >
          {showPreview ? <Edit className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>

      {/* Editor/Preview */}
      <div
        ref={dropZoneRef}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        className={`border-2 border-gray-300 rounded-b-lg overflow-hidden relative ${
          isDragging ? 'border-orange-500 bg-orange-50' : ''
        }`}
      >
        {isDragging && (
          <div className="absolute inset-0 bg-orange-100 bg-opacity-90 flex items-center justify-center z-10 border-4 border-dashed border-orange-500">
            <div className="text-center">
              <Upload className="w-12 h-12 text-orange-600 mx-auto mb-2" />
              <p className="text-lg font-semibold text-orange-700">Déposez l'image ici</p>
            </div>
          </div>
        )}
        {showPreview ? (
          <div className="p-4 bg-white min-h-[300px] prose prose-lg max-w-none">
            <div dangerouslySetInnerHTML={{ __html: renderMarkdown(value) }} />
            {!value && (
              <p className="text-gray-400 italic">Aperçu du contenu...</p>
            )}
          </div>
        ) : (
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onPaste={handlePaste}
            placeholder={placeholder}
            className="w-full px-4 py-3 border-0 focus:ring-0 focus:outline-none resize-none font-mono text-sm min-h-[300px] select-text"
            style={{ fontFamily: 'inherit', userSelect: 'text' }}
            onDragStart={(e) => {
              // Allow text selection drag in textarea
              e.stopPropagation();
            }}
            onDragOver={(e) => {
              // Allow text selection drag in textarea
              e.stopPropagation();
            }}
            onDrop={(e) => {
              // Allow text drop in textarea (text selection)
              e.stopPropagation();
            }}
            onMouseDown={(e) => {
              // Ensure textarea gets focus when clicking
              e.stopPropagation();
            }}
            onClick={(e) => {
              // Ensure textarea gets focus when clicking
              e.stopPropagation();
            }}
          />
        )}
      </div>

      <p className="text-xs text-gray-500">
        Utilisez la barre d'outils pour formater votre texte. Syntaxe Markdown : **gras**, *italique*, [lien](url), # Titre
        {isDragging && <span className="text-orange-600 font-semibold ml-2">• Glissez-déposez une image ici</span>}
      </p>
    </div>
  );
}

