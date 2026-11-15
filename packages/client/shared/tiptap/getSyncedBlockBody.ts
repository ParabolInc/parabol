import type {JSONContent} from '@tiptap/core'

const copyPageLinks = (node: JSONContent): JSONContent => ({
  ...node,
  ...(node.type === 'pageLinkBlock' && {attrs: {...node.attrs, canonical: false}}),
  ...(node.content && {content: node.content.map(copyPageLinks)})
})

export const getSyncedBlockBody = (doc: JSONContent): JSONContent[] => {
  const content = doc.content ?? []
  const body = content[0]?.type === 'heading' ? content.slice(1) : content
  return body.length > 0 ? body.map(copyPageLinks) : [{type: 'paragraph'}]
}
