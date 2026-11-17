import type {JSONContent} from '@tiptap/core'

const replaceFileUploadPlaceholders = (node: JSONContent): JSONContent => {
  if (node.type === 'fileUpload') return {type: 'paragraph'}
  if (!node.content) return node
  return {...node, content: node.content.map(replaceFileUploadPlaceholders)}
}

export default replaceFileUploadPlaceholders
