import type {InspirationItemResolvers} from '../resolverTypes'

const InspirationItem: InspirationItemResolvers = {
  // content is stored as a tiptap doc (jsonb); expose it as a JSON string, like TeamPromptResponse
  content: ({content}) => JSON.stringify(content)
}

export default InspirationItem
