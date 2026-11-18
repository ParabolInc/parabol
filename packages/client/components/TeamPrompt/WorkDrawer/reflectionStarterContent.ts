import type {JSONContent} from '@tiptap/core'

const reflectionStarterContent = (text: string, href?: string | null): JSONContent => ({
  type: 'doc',
  content: [
    {
      type: 'paragraph',
      content: [{type: 'text', text, ...(href ? {marks: [{type: 'link', attrs: {href}}]} : {})}]
    }
  ]
})

export default reflectionStarterContent
