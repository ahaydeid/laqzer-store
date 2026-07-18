'use client'

import React, { useEffect } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { 
  FiBold, 
  FiItalic, 
  FiList, 
  FiCornerUpLeft, 
  FiCornerUpRight,
  FiMinus
} from 'react-icons/fi'

interface RichTextEditorProps {
  value: string
  onChange: (htmlContent: string) => void
  placeholder?: string
}

const formatInitialValueHtml = (val?: string) => {
  if (!val) return ''
  // If value already contains HTML tags, return as is
  if (/<[a-z][\s\S]*>/i.test(val)) {
    return val
  }
  // Otherwise, split double newlines into <p> and single newlines into <br />
  return val
    .split(/\n\n+/)
    .map((paragraph) => `<p>${paragraph.replace(/\n/g, '<br />')}</p>`)
    .join('')
}

export function RichTextEditor({ value, onChange }: RichTextEditorProps) {
  const initialHtml = formatInitialValueHtml(value)

  const editor = useEditor({
    extensions: [StarterKit],
    content: initialHtml,
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
    editorProps: {
      attributes: {
        class: 'min-h-[130px] p-3 text-xs outline-none text-zinc-800 dark:text-zinc-200 focus:outline-none prose dark:prose-invert max-w-none whitespace-pre-line [&_p]:mb-2 [&_h1]:text-sm [&_h1]:font-bold [&_h2]:text-xs [&_h2]:font-bold [&_ul]:list-disc [&_ul]:pl-4 [&_ol]:list-decimal [&_ol]:pl-4',
      },
    },
  })

  // Synchronize external value changes (e.g., reset or load initial data)
  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(formatInitialValueHtml(value))
    }
  }, [value, editor])

  if (!editor) {
    return null
  }

  return (
    <div className="rounded border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/60 overflow-hidden">
      {/* Toolbar formatting */}
      <div className="flex flex-wrap items-center gap-1 p-1.5 border-b border-zinc-200 dark:border-zinc-800/80 bg-zinc-100/60 dark:bg-zinc-900/80 select-none">
        {/* Headings */}
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          className={`px-2 py-1 rounded text-xs font-bold transition-colors ${
            editor.isActive('heading', { level: 1 })
              ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900'
              : 'text-zinc-600 hover:bg-zinc-200/60 dark:text-zinc-300 dark:hover:bg-zinc-800'
          }`}
          title="Heading 1"
        >
          H1
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={`px-2 py-1 rounded text-xs font-bold transition-colors ${
            editor.isActive('heading', { level: 2 })
              ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900'
              : 'text-zinc-600 hover:bg-zinc-200/60 dark:text-zinc-300 dark:hover:bg-zinc-800'
          }`}
          title="Heading 2"
        >
          H2
        </button>

        <div className="h-4 w-[1px] bg-zinc-300 dark:bg-zinc-700 mx-1" />

        {/* Text Formats */}
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`p-1.5 rounded transition-colors ${
            editor.isActive('bold')
              ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900'
              : 'text-zinc-600 hover:bg-zinc-200/60 dark:text-zinc-300 dark:hover:bg-zinc-800'
          }`}
          title="Tebal (Bold)"
        >
          <FiBold className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`p-1.5 rounded transition-colors ${
            editor.isActive('italic')
              ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900'
              : 'text-zinc-600 hover:bg-zinc-200/60 dark:text-zinc-300 dark:hover:bg-zinc-800'
          }`}
          title="Miring (Italic)"
        >
          <FiItalic className="h-3.5 w-3.5" />
        </button>

        <div className="h-4 w-[1px] bg-zinc-300 dark:bg-zinc-700 mx-1" />

        {/* Lists */}
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`p-1.5 rounded transition-colors ${
            editor.isActive('bulletList')
              ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900'
              : 'text-zinc-600 hover:bg-zinc-200/60 dark:text-zinc-300 dark:hover:bg-zinc-800'
          }`}
          title="Bullet List"
        >
          <FiList className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`px-1.5 py-1 rounded text-[11px] font-semibold transition-colors ${
            editor.isActive('orderedList')
              ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900'
              : 'text-zinc-600 hover:bg-zinc-200/60 dark:text-zinc-300 dark:hover:bg-zinc-800'
          }`}
          title="Numbered List"
        >
          1.
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          className="p-1.5 rounded text-zinc-600 hover:bg-zinc-200/60 dark:text-zinc-300 dark:hover:bg-zinc-800 transition-colors"
          title="Garis Pemisah"
        >
          <FiMinus className="h-3.5 w-3.5" />
        </button>

        <div className="h-4 w-[1px] bg-zinc-300 dark:bg-zinc-700 mx-1 ml-auto" />

        {/* Undo / Redo */}
        <button
          type="button"
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          className="p-1.5 rounded text-zinc-600 hover:bg-zinc-200/60 dark:text-zinc-300 dark:hover:bg-zinc-800 disabled:opacity-30 transition-colors"
          title="Undo"
        >
          <FiCornerUpLeft className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          className="p-1.5 rounded text-zinc-600 hover:bg-zinc-200/60 dark:text-zinc-300 dark:hover:bg-zinc-800 disabled:opacity-30 transition-colors"
          title="Redo"
        >
          <FiCornerUpRight className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Editor Content Area */}
      <EditorContent editor={editor} />
    </div>
  )
}
