import type {JSONContent} from '@tiptap/core'

const reflectionStarterContent = (
  text: string,
  href?: string | null,
  issueService?: string
): JSONContent => ({
  type: 'doc',
  content: [
    {
      type: 'paragraph',
      content: [
        {
          type: 'text',
          text,
          ...(href
            ? {marks: [{type: 'link', attrs: {href, issueService: issueService ?? null}}]}
            : {})
        }
      ]
    }
  ]
})

export default reflectionStarterContent
