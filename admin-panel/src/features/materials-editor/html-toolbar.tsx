import { Button } from '@/components/ui/button'
import {
  Bold, Italic, List, ListOrdered, Link, Image, Video, Heading1, Heading2, Heading3, Quote, Code
} from 'lucide-react'

interface HtmlToolbarProps {
  onInsert: (before: string, after: string) => void
}

export function HtmlToolbar({ onInsert }: HtmlToolbarProps) {
  const tools = [
    { icon: Heading1, label: 'Título 1', before: '<h1>', after: '</h1>\n' },
    { icon: Heading2, label: 'Título 2', before: '<h2>', after: '</h2>\n' },
    { icon: Heading3, label: 'Título 3', before: '<h3>', after: '</h3>\n' },
    { icon: Bold, label: 'Negrito', before: '<strong>', after: '</strong>' },
    { icon: Italic, label: 'Itálico', before: '<em>', after: '</em>' },
    { icon: List, label: 'Lista', before: '<ul>\n  <li>', after: '</li>\n</ul>\n' },
    { icon: ListOrdered, label: 'Lista num.', before: '<ol>\n  <li>', after: '</li>\n</ol>\n' },
    { icon: Quote, label: 'Citação', before: '<blockquote>', after: '</blockquote>\n' },
    { icon: Code, label: 'Código', before: '<code>', after: '</code>' },
    { icon: Link, label: 'Link', before: '<a href="https://">', after: '</a>' },
    { icon: Image, label: 'Imagem', before: '<img src="https://" alt="" style="max-width:100%" />', after: '' },
    { icon: Video, label: 'Vídeo', before: '<div style="position:relative;padding-bottom:56.25%;height:0;overflow:hidden;max-width:100%;margin:16px 0"><iframe src="https://www.youtube.com/embed/" style="position:absolute;top:0;left:0;width:100%;height:100%" frameborder="0" allowfullscreen></iframe></div>\n', after: '' },
  ]

  return (
    <div className="flex flex-wrap gap-1 p-2 border rounded-t-md bg-muted/50">
      {tools.map((tool) => (
        <Button
          key={tool.label}
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
          title={tool.label}
          onClick={() => onInsert(tool.before, tool.after)}
        >
          <tool.icon size={15} />
        </Button>
      ))}
    </div>
  )
}