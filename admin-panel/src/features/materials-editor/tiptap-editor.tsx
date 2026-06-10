import { useRef, useCallback } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import ImageExtension from '@tiptap/extension-image'
import LinkExtension from '@tiptap/extension-link'
import Placeholder from '@tiptap/extension-placeholder'
import { Button } from '@/components/ui/button'
import {
  Bold, Italic, Heading1, Heading2, Heading3, List, ListOrdered,
  Quote, Code, Link, Image, Undo, Redo
} from 'lucide-react'
import { useAuthStore } from '@/stores/auth-store'

interface TiptapEditorProps {
  value: string
  onChange: (val: string) => void
}

export function TiptapEditor({ value, onChange }: TiptapEditorProps) {
  const { auth } = useAuthStore()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const editor = useEditor({
    extensions: [
      StarterKit,
      ImageExtension,
      LinkExtension.configure({ openOnClick: false }),
      Placeholder.configure({ placeholder: 'Comece a escrever...' }),
    ],
    content: value || '',
    onUpdate: ({ editor }) => {
      const html = editor.getHTML()
      onChange(html)
    },
  })

  const handleImageUpload = useCallback(async (file: File) => {
    const formData = new FormData()
    formData.append('file', file)
    try {
      const res = await fetch('http://localhost:3333/api/upload', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${auth.accessToken}` },
        body: formData,
      })
      const data = await res.json()
      if (data.url && editor) {
        editor.chain().focus().setImage({ src: data.url }).run()
      }
    } catch (err) {
      console.error('Upload error', err)
    }
  }, [editor, auth.accessToken])

  if (!editor) return null

  const addLink = () => {
    const url = window.prompt('URL do link:')
    if (url) {
      editor.chain().focus().setLink({ href: url }).run()
    }
  }

  const ToolbarButton = ({ onClick, active, children }: any) => (
    <Button
      variant="ghost"
      size="sm"
      className={`h-8 w-8 p-0 ${active ? 'bg-accent text-accent-foreground' : ''}`}
      onClick={onClick}
      type="button"
    >
      {children}
    </Button>
  )

  return (
    <div className="border rounded-md">
      <div className="flex flex-wrap gap-0.5 p-1.5 border-b bg-muted/30">
        <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} active={editor.isActive('heading', { level: 1 })}>
          <Heading1 size={15} />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive('heading', { level: 2 })}>
          <Heading2 size={15} />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} active={editor.isActive('heading', { level: 3 })}>
          <Heading3 size={15} />
        </ToolbarButton>
        <span className="w-px h-6 bg-border mx-0.5 self-center" />
        <ToolbarButton onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive('bold')}>
          <Bold size={15} />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive('italic')}>
          <Italic size={15} />
        </ToolbarButton>
        <span className="w-px h-6 bg-border mx-0.5 self-center" />
        <ToolbarButton onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive('bulletList')}>
          <List size={15} />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive('orderedList')}>
          <ListOrdered size={15} />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive('blockquote')}>
          <Quote size={15} />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleCode().run()} active={editor.isActive('code')}>
          <Code size={15} />
        </ToolbarButton>
        <span className="w-px h-6 bg-border mx-0.5 self-center" />
        <ToolbarButton onClick={addLink} active={editor.isActive('link')}>
          <Link size={15} />
        </ToolbarButton>
        <ToolbarButton onClick={() => fileInputRef.current?.click()}>
          <Image size={15} />
        </ToolbarButton>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) handleImageUpload(file)
            e.target.value = ''
          }}
        />
        <span className="w-px h-6 bg-border mx-0.5 self-center" />
        <ToolbarButton onClick={() => editor.chain().focus().undo().run()}>
          <Undo size={15} />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().redo().run()}>
          <Redo size={15} />
        </ToolbarButton>
      </div>
      <EditorContent editor={editor} className="prose prose-sm max-w-none p-4 min-h-[200px] focus:outline-none [&_.ProseMirror]:outline-none" />
    </div>
  )
}