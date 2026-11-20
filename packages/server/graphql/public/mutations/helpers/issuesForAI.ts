import type {InspirationIssue} from '../../../../integrations/platform/InspirationIssue'

// Shared formatting for the "draft my response from this work" AI feature. Each integration
// (GitHub, Jira, Linear, Azure DevOps) fetches its own issues, normalizes them to InspirationIssue, and hands them
// here to be rendered into one compact text blob suitable for an LLM prompt.

const MAX_BODY_LEN = 1500
const MAX_COMMENT_LEN = 500
const MAX_EXCERPT_LEN = 400
const MAX_EXCERPT_COMMENTS = 2
const MAX_EXCERPT_COMMENT_LEN = 200

const truncate = (text: string, max: number) =>
  text.length > max ? `${text.slice(0, max)}…` : text

const formatDate = (date: Date | null) =>
  date && !Number.isNaN(date.getTime()) ? date.toISOString().slice(0, 10) : null

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
      const date = formatDate(item.updatedAt)
      if (date) lines.push(`Date: ${date}`)
      lines.push(item.url, body)
      if (thread) lines.push(`Thread:\n${thread}`)
      return lines.join('\n')
    })
    .join('\n\n')

const toOneLine = (text: string, max: number) => truncate(text.trim().replace(/\s+/g, ' '), max)

// The start of an issue's description and its latest comments, quoted under its line
const formatExcerpt = ({description, comments}: InspirationIssue) => {
  const descriptionLine = description?.trim() ? [toOneLine(description, MAX_EXCERPT_LEN)] : []
  const commentLines = (comments ?? [])
    .slice(-MAX_EXCERPT_COMMENTS)
    .flatMap(({author, body}) =>
      body.trim() ? [`${author}: ${toOneLine(body, MAX_EXCERPT_COMMENT_LEN)}`] : []
    )
  return [...descriptionLine, ...commentLines].map((line) => `\n  > ${line}`).join('')
}

// One line per issue, so the AI can read a whole stretch of work and spot what repeats across it. The issues in
// detailedIds also get an excerpt of what they say.
export const formatIssueLinesForAI = (
  items: InspirationIssue[],
  ids: string[],
  detailedIds: ReadonlySet<string>
): string =>
  items
    .map((item, idx) => {
      const id = ids[idx]!
      const where = [item.reference, item.subtitle].filter(Boolean).join(' · ')
      const facts = [
        item.status,
        formatDate(item.updatedAt),
        item.isOwnWork ? 'mine' : null,
        item.commentCount ? `${item.commentCount} comments` : null,
        item.changeSize ? `${item.changeSize} lines changed` : null,
        item.url || null
      ].filter(Boolean)
      const heading = `- [${id}] ${item.kind}: ${item.title}${where ? ` (${where})` : ''}`
      const excerpt = detailedIds.has(id) ? formatExcerpt(item) : ''
      return `${[heading, ...facts].join(' · ')}${excerpt}`
    })
    .join('\n')
