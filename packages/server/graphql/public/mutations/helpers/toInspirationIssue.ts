import {rankInspirationIssue} from '../../../../integrations/platform/InspirationIssue'
import type {InspirationItemSource} from '../../types/GenerateInspirationItemsPayload'
import type {NumberedIssue} from './gatherInspirationIssues'

const toInspirationIssue = (
  {service, issue}: NumberedIssue,
  draft: InspirationItemSource | null,
  unusedReason: string | null = null
) => ({
  service,
  kind: issue.kind,
  title: issue.title,
  url: issue.url || null,
  updatedAt: issue.updatedAt,
  importance: rankInspirationIssue(issue),
  unusedReason,
  draft
})

export default toInspirationIssue
