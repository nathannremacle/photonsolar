"use client";

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import Underline from '@tiptap/extension-underline';
import { Bold, Italic, Underline as UnderlineIcon, List, ListOrdered, Link as LinkIcon, Image as ImageIcon, Heading1, Heading2, Undo, Redo } from 'lucide-react';
import { useRef, useState, useEffect } from 'react';
import { Upload } from 'lucide-react';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
}

export default function RichTextEditor({
  value,
  onChange,
  label = "Contenu",
  placeholder = "Écrivez votre contenu ici...",
}: RichTextEditorProps) {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Underline,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-orange-600 hover:text-orange-700 underline',
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: 'max-w-full h-auto rounded-lg my-6',
        },
      }),
    ],
    content: value || '',
    editorProps: {
      attributes: {
        class: 'prose prose-lg prose-orange max-w-none focus:outline-none min-h-[400px] px-4 py-3 prose-headings:font-bold prose-headings:text-gray-900 prose-p:text-gray-700 prose-p:leading-relaxed prose-a:text-orange-600 prose-a:no-underline hover:prose-a:underline prose-strong:text-gray-900 prose-img:rounded-xl prose-img:shadow-lg prose-img:my-8 prose-img:w-full prose-ul:my-6 prose-ol:my-6 prose-li:my-2',
      },
    },
    // Enable Markdown shortcuts (built into StarterKit)
    enablePasteRules: true,
    enableInputRules: true,
    immediatelyRender: false, // Fix SSR hydration issues
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    placeholder,
  });

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
        editor?.chain().focus().setImage({ src: imageUrl }).run();
      } else {
        throw new Error(data.error || 'Erreur lors de l\'upload');
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Erreur lors de l\'upload de l\'image');
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleImageButtonClick = () => {
    fileInputRef.current?.click();
  };

  const setLink = () => {
    const previousUrl = editor?.getAttributes('link').href;
    const url = window.prompt('URL', previousUrl);

    if (url === null) {
      return;
    }

    if (url === '') {
      editor?.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }

    editor?.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  };

  // Sync editor content when value changes externally
  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value || '');
    }
  }, [value, editor]);

  if (!editor) {
    return null;
  }

  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
      )}
      
      {/* Toolbar */}
      <div className="flex items-center gap-1 p-2 bg-gray-50 border-2 border-gray-300 rounded-t-lg border-b-0 flex-wrap">
        <div className="flex items-center gap-1 border-r border-gray-300 pr-2 mr-2">
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBold().run()}
            disabled={!editor.can().chain().focus().toggleBold().run()}
            className={`p-2 rounded transition-colors ${
              editor.isActive('bold')
                ? 'bg-orange-100 text-orange-700'
                : 'hover:bg-gray-200'
            }`}
            title="Gras"
          >
            <Bold className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            disabled={!editor.can().chain().focus().toggleItalic().run()}
            className={`p-2 rounded transition-colors ${
              editor.isActive('italic')
                ? 'bg-orange-100 text-orange-700'
                : 'hover:bg-gray-200'
            }`}
            title="Italique"
          >
            <Italic className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            className={`p-2 rounded transition-colors ${
              editor.isActive('underline')
                ? 'bg-orange-100 text-orange-700'
                : 'hover:bg-gray-200'
            }`}
            title="Souligné"
          >
            <UnderlineIcon className="w-4 h-4" />
          </button>
        </div>
        
        <div className="flex items-center gap-1 border-r border-gray-300 pr-2 mr-2">
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            className={`p-2 rounded transition-colors ${
              editor.isActive('heading', { level: 1 })
                ? 'bg-orange-100 text-orange-700'
                : 'hover:bg-gray-200'
            }`}
            title="Titre 1"
          >
            <Heading1 className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            className={`p-2 rounded transition-colors ${
              editor.isActive('heading', { level: 2 })
                ? 'bg-orange-100 text-orange-700'
                : 'hover:bg-gray-200'
            }`}
            title="Titre 2"
          >
            <Heading2 className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            className={`p-2 rounded transition-colors ${
              editor.isActive('heading', { level: 3 })
                ? 'bg-orange-100 text-orange-700'
                : 'hover:bg-gray-200'
            }`}
            title="Titre 3"
          >
            <span className="text-xs font-bold">H3</span>
          </button>
        </div>

        <div className="flex items-center gap-1 border-r border-gray-300 pr-2 mr-2">
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={`p-2 rounded transition-colors ${
              editor.isActive('bulletList')
                ? 'bg-orange-100 text-orange-700'
                : 'hover:bg-gray-200'
            }`}
            title="Liste à puces"
          >
            <List className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={`p-2 rounded transition-colors ${
              editor.isActive('orderedList')
                ? 'bg-orange-100 text-orange-700'
                : 'hover:bg-gray-200'
            }`}
            title="Liste numérotée"
          >
            <ListOrdered className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center gap-1 border-r border-gray-300 pr-2 mr-2">
          <button
            type="button"
            onClick={setLink}
            className={`p-2 rounded transition-colors ${
              editor.isActive('link')
                ? 'bg-orange-100 text-orange-700'
                : 'hover:bg-gray-200'
            }`}
            title="Lien"
          >
            <LinkIcon className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={handleImageButtonClick}
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
            onChange={(e) => {
              const files = e.target.files;
              if (files && files.length > 0) {
                handleFileUpload(files[0]);
              }
            }}
            className="hidden"
          />
        </div>

        <div className="flex items-center gap-1 border-r border-gray-300 pr-2 mr-2">
          <button
            type="button"
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().chain().focus().undo().run()}
            className="p-2 hover:bg-gray-200 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title="Annuler"
          >
            <Undo className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().chain().focus().redo().run()}
            className="p-2 hover:bg-gray-200 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title="Refaire"
          >
            <Redo className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Editor */}
      <div className="border-2 border-gray-300 rounded-b-lg overflow-hidden bg-white">
        <EditorContent editor={editor} />
      </div>

      <p className="text-xs text-gray-500">
        Utilisez la barre d'outils pour formater votre texte. Raccourcis Markdown : **gras**, *italique*, # Titre
      </p>
    </div>
  );
}

