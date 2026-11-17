// How many issues / comments each integration pulls. Kept here so every service stays
// consistent about how much context it sends to the AI.
export const MAX_ISSUES = 20
// Fetch the most recent comments rather than the first: on long threads the latest discussion
// carries the current state, which is what the AI needs to draft a response.
export const MAX_ISSUE_COMMENTS = 10

export interface IssueComment {
  author: string
  body: string
}

export interface InspirationIssue {
  // Heading label, e.g. 'Issue' or 'Pull Request'
  kind: string
  title: string
  // The parenthetical reference shown after the title, e.g. a repo, issue key, or identifier
  reference: string
  url: string
  // The most recent date tied to the issue: its last update, or when the event starts
  updatedAt: Date | null
  description: string | null | undefined
  // Optional extra location line, e.g. Linear's "team / project"
  subtitle?: string
  // Optional status line, e.g. 'open (in progress)'. The AI uses this to pick verb tense.
  status?: string
  comments?: IssueComment[]
}
