// Shared formatting for the "draft my response from this work" AI feature. Each integration
// (GitHub, Jira, Linear) fetches its own work items, normalizes them to WorkItem, and hands them
// here to be rendered into one compact text blob suitable for an LLM prompt.

const MAX_BODY_LEN = 1500
const MAX_COMMENT_LEN = 500

// How many work items / comments each integration pulls. Kept here so every service stays
// consistent about how much context it sends to the AI.
export const MAX_WORK_ITEMS = 20
// Fetch the most recent comments rather than the first: on long threads the latest discussion
// carries the current state, which is what the AI needs to draft a response.
export const MAX_WORK_ITEM_COMMENTS = 10

const truncate = (text: string, max: number) =>
  text.length > max ? `${text.slice(0, max)}…` : text

export interface WorkItemComment {
  author: string
  body: string
}

export interface WorkItem {
  // Heading label, e.g. 'Issue' or 'Pull Request'
  kind: string
  title: string
  // The parenthetical reference shown after the title, e.g. a repo, issue key, or identifier
  reference: string
  url: string
  description: string | null | undefined
  // Optional extra location line, e.g. Linear's "team / project"
  subtitle?: string
  // Optional status line, e.g. 'open (in progress)'. The AI uses this to pick verb tense.
  status?: string
  comments?: WorkItemComment[]
}

// Renders normalized work items into the text blob the AI drafts a response from, truncating long
// bodies and comments. Returns '' when there's nothing to send.
export const formatWorkItemsForAI = (items: WorkItem[]): string =>
  items
    .map((item) => {
      const thread = (item.comments ?? [])
        .flatMap((comment) =>
          comment.body.trim()
            ? [`  - ${comment.author}: ${truncate(comment.body.trim(), MAX_COMMENT_LEN)}`]
            : []
        )
        .join('\n')
      const body = item.description?.trim()
        ? truncate(item.description.trim(), MAX_BODY_LEN)
        : '(no description)'
      const lines = [`### ${item.kind}: ${item.title} (${item.reference})`]
      if (item.subtitle) lines.push(item.subtitle)
      if (item.status) lines.push(`Status: ${item.status}`)
      lines.push(item.url, body)
      if (thread) lines.push(`Thread:\n${thread}`)
      return lines.join('\n')
    })
    .join('\n\n')
