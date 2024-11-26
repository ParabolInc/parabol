import {JSONContent} from '@tiptap/core'

export const removeMentionKeepText = (
  node: JSONContent,
  eqFn: (userId: string) => boolean
): JSONContent => {
  // Base case: if the node is a 'mention', replace it
  if (node.type === 'mention' && node.attrs && eqFn(node.attrs.id)) {
    return {
      type: 'span',
      content: [
        {
          text: node.attrs.label,
          type: 'text'
        }
      ]
    }
  }

  // If the node has content, recursively process each child node
  if (Array.isArray(node.content)) {
    return {
      ...node,
      content: node.content.map((obj) => removeMentionKeepText(obj, eqFn))
    }
  }
  // If the node is not a 'mention' and has no content, return it as is
  return node
}
