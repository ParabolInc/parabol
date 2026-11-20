import type {JSONContent} from '@tiptap/core'

const reflectionStarterContent = (text: string): JSONContent => ({
  type: 'doc',
  content: [{type: 'paragraph', content: [{type: 'text', text}]}]
})

export default reflectionStarterContent
