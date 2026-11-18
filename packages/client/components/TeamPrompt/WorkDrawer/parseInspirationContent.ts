import type {JSONContent} from '@tiptap/core'

// A draft's content arrives as a stringified tiptap doc
const parseInspirationContent = (raw: string): JSONContent => {
  try {
    return JSON.parse(raw)
  } catch {
    return {type: 'doc', content: []}
  }
}

export default parseInspirationContent
