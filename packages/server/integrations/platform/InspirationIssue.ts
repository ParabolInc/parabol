// How many issues each integration pulls for a standup, and for each page of a retro's timeline.
// Kept here so every service stays consistent about how much it fetches.
export const MAX_ISSUES = 20
export const TIMELINE_PAGE_SIZE = 50
// Fetch the most recent comments rather than the first: on long threads the latest discussion
// carries the current state, which is what the AI needs to draft a response.
export const MAX_ISSUE_COMMENTS = 10

export interface IssueComment {
  author: string
  body: string
}

export interface IssuePage {
  // Only issues dated no later than this; null for the newest
  before: Date | null
  first: number
}

const toTime = ({updatedAt}: InspirationIssue) => updatedAt?.getTime() || 0

export const compareNewestFirst = (a: InspirationIssue, b: InspirationIssue) =>
  toTime(b) - toTime(a)

// How notable an issue looks before the AI reads it. The viewer's own work, finished work, long
// discussions and big changes rank first; a service leaves out what it can't tell.
export const rankInspirationIssue = ({
  isOwnWork,
  isClosed,
  commentCount = 0,
  changeSize = 0
}: InspirationIssue) =>
  (isOwnWork ? 2 : 0) +
  (isClosed ? 1 : 0) +
  Math.log2(1 + commentCount) +
  Math.log10(1 + changeSize)

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
  // The viewer wrote it or it's assigned to them
  isOwnWork?: boolean
  // Merged, done or otherwise finished
  isClosed?: boolean
  commentCount?: number
  // Lines a pull request adds and removes
  changeSize?: number
}

export type IssueText = Pick<InspirationIssue, 'reference' | 'title'> & {description: string}
