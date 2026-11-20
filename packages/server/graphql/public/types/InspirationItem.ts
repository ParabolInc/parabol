import type {InspirationItem as InspirationItemDB} from '../../../postgres/types'
import type {InspirationIssueSource} from '../mutations/helpers/toInspirationIssue'
import type {InspirationItemResolvers} from '../resolverTypes'

// A draft is never saved, so it carries the issues it was drawn from; a saved item has none
export type InspirationItemSource = Omit<InspirationItemDB, 'id'> & {
  id: string
  issues?: InspirationIssueSource[]
}

const InspirationItem: InspirationItemResolvers = {
  // content is stored as a tiptap doc (jsonb); expose it as a JSON string, like TeamPromptResponse
  content: ({content}) => JSON.stringify(content),
  issues: ({issues}) => issues ?? []
}

export default InspirationItem
