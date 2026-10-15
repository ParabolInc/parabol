const NON_WORK_TYPES = [
  'Test Case',
  'Test Plan',
  'Test Suite',
  'Shared Steps',
  'Shared Parameter',
  'Code Review Request',
  'Code Review Response',
  'Feedback Request',
  'Feedback Response'
]

export type AzureDevOpsWorkKind = 'assigned' | 'created'

export const quoteWiql = (value: string) => `'${value.replace(/'/g, "''")}'`

export const AZURE_DEVOPS_IS_WORK = `[System.WorkItemType] NOT IN (${NON_WORK_TYPES.map(quoteWiql).join(', ')})`

interface WorkFilter {
  kinds: readonly AzureDevOpsWorkKind[]
  /** ISO dates bounding when the work item last changed; either may be left open */
  startAt?: string
  endAt?: string
}

/**
 * The WIQL WHERE clause for the work the viewer was assigned or created.
 * The client lists with it and the server drafts with it, so the two cannot drift
 */
const buildAzureDevOpsWorkWiql = ({kinds, startAt, endAt}: WorkFilter) => {
  const people = [
    kinds.includes('assigned') && '[System.AssignedTo] = @Me',
    kinds.includes('created') && '[System.CreatedBy] = @Me'
  ].filter(Boolean)
  return [
    people.length > 0 && `(${people.join(' OR ')})`,
    AZURE_DEVOPS_IS_WORK,
    startAt && `[System.ChangedDate] >= ${quoteWiql(startAt)}`,
    endAt && `[System.ChangedDate] <= ${quoteWiql(endAt)}`
  ]
    .filter(Boolean)
    .join(' AND ')
}

export default buildAzureDevOpsWorkWiql
