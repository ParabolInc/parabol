import type {JSONContent} from '@tiptap/core'
import type {InspirationItemResolvers} from '../resolverTypes'

export interface InspirationItemSource {
  id: string
  service: string
  title: string | null
  promptId: string | null
  content: JSONContent
  createdAt: Date
}

const InspirationItem: InspirationItemResolvers = {
  // content is a tiptap doc; expose it as a JSON string, like TeamPromptResponse
  content: ({content}) => JSON.stringify(content)
}

export default InspirationItem
