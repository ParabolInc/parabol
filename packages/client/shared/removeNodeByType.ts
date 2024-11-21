import {JSONContent} from '@tiptap/core'

export const removeNodeByType = (json: JSONContent, nodeTypeToRemove: string): JSONContent => {
  if (Array.isArray(json)) {
    return json
      .map((node) => removeNodeByType(node, nodeTypeToRemove))
      .filter((item) => item.type !== nodeTypeToRemove)
  }

  if (json && typeof json === 'object') {
    const newObj = {...json}

    // Recursively process content if it exists
    if (newObj.content) {
      newObj.content = removeNodeByType(newObj.content, nodeTypeToRemove) as JSONContent[]
    }
    return newObj
  }
  // Return primitive values as-is
  return json
}
