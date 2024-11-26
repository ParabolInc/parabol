import {JSONContent} from '@tiptap/core'
import {Attrs} from '@tiptap/pm/model'

export const getAllNodesAttributesByType = <T extends Attrs>(
  doc: JSONContent,
  nodeType: string
) => {
  let mentions: T[] = []

  // Handle arrays
  if (Array.isArray(doc)) {
    for (const item of doc) {
      mentions = mentions.concat(getAllNodesAttributesByType(item, nodeType))
    }
  }

  // Handle objects
  if (doc && typeof doc === 'object') {
    // Check if current object is a mention
    if (doc.type === nodeType) {
      mentions.push(doc.attrs as T)
    }

    // Recursively search content if it exists
    if (doc.content) {
      mentions = mentions.concat(getAllNodesAttributesByType(doc.content, nodeType))
    }
  }

  return mentions
}
