import type {Editor, JSONContent} from '@tiptap/core'
import {validatePageDoc} from './validatePageDoc'

const repairListItems = (node: JSONContent): JSONContent => {
  const content = node.content?.map(repairListItems)
  if (
    (node.type === 'listItem' || node.type === 'taskItem') &&
    content?.[0]?.type !== 'paragraph'
  ) {
    return {...node, content: [{type: 'paragraph'}, ...(content ?? [])]}
  }
  return content ? {...node, content} : node
}

export const parsePageMarkdown = (
  editor: Editor,
  markdown: string,
  allowedImageSrcs: Set<string>
): JSONContent[] => {
  if (!markdown.trim()) return []
  const doc = repairListItems(editor.storage.markdown.manager.parse(markdown))
  validatePageDoc(editor, doc, allowedImageSrcs)
  return doc.content ?? []
}
