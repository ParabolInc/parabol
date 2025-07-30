import type {JSONContent} from '@tiptap/core'
import type {Attrs} from '@tiptap/pm/model'

export const getAllNodesAttributesByType = <T extends Attrs>(
  doc: JSONContent,
  nodeType: string
) => {
  let nodes: T[] = []

  // Handle arrays
  if (Array.isArray(doc)) {
    for (const item of doc) {
      nodes = nodes.concat(getAllNodesAttributesByType(item, nodeType))
    }
  }

  // Handle objects
  if (doc && typeof doc === 'object') {
    if (doc.type === nodeType) {
      nodes.push(doc.attrs as T)
    }

    // Recursively search content if it exists
    if (doc.content) {
      nodes = nodes.concat(getAllNodesAttributesByType(doc.content, nodeType))
    }
  }

  return nodes
}
