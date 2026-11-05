import type {InspirationIssue} from '../../../../integrations/platform/InspirationIssue'

// Shared formatting for the "draft my response from this work" AI feature. Each integration
// (GitHub, Jira, Linear, Azure DevOps) fetches its own issues, normalizes them to InspirationIssue, and hands them
// here to be rendered into one compact text blob suitable for an LLM prompt.

const MAX_BODY_LEN = 1500
const MAX_COMMENT_LEN = 500

const truncate = (text: string, max: number) =>
  text.length > max ? `${text.slice(0, max)}…` : text

// Renders normalized issues into the text blob the AI drafts a response from, truncating long
// bodies and comments. Returns '' when there's nothing to send. Pass ids to label each item so the AI
// can refer back to it.
export const formatIssuesForAI = (items: InspirationIssue[], ids?: string[]): string =>
  items
    .map((item, idx) => {
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
      const id = ids?.[idx]
      const lines = [`### ${id ? `[${id}] ` : ''}${item.kind}: ${item.title} (${item.reference})`]
      if (item.subtitle) lines.push(item.subtitle)
      if (item.status) lines.push(`Status: ${item.status}`)
      if (item.updatedAt && !Number.isNaN(item.updatedAt.getTime())) {
        lines.push(`Date: ${item.updatedAt.toISOString().slice(0, 10)}`)
      }
      lines.push(item.url, body)
      if (thread) lines.push(`Thread:\n${thread}`)
      return lines.join('\n')
    })
    .join('\n\n')
