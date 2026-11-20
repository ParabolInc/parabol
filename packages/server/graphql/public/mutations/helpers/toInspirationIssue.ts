import {rankInspirationIssue} from '../../../../integrations/platform/InspirationIssue'
import type {NumberedIssue} from './gatherInspirationIssues'

const toInspirationIssue = (
  {service, issue}: Pick<NumberedIssue, 'service' | 'issue'>,
  unusedReason: string | null = null
) => ({
  service,
  kind: issue.kind,
  title: issue.title,
  url: issue.url || null,
  updatedAt: issue.updatedAt,
  importance: rankInspirationIssue(issue),
  unusedReason
})

export type InspirationIssueSource = ReturnType<typeof toInspirationIssue>

export default toInspirationIssue
