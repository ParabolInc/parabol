import type {GraphQLResolveInfo} from 'graphql'
import type {TaskEstimate as TaskEstimateDB} from '../../../../postgres/types'
import type {GQLContext} from '../../../graphql'
import TaskEstimate from '../TaskEstimate'

const context = {} as GQLContext
const info = {} as GraphQLResolveInfo

const resolveJiraFieldId = (pushResult: TaskEstimateDB['pushResult']) => {
  const field = TaskEstimate.jiraFieldId
  if (typeof field !== 'function') throw new Error('jiraFieldId is not a resolver function')
  return field({pushResult} as TaskEstimateDB, {}, context, info)
}

describe('TaskEstimate.jiraFieldId', () => {
  it('returns the field id a Jira push wrote', () => {
    expect(resolveJiraFieldId({targetKind: 'field', fieldId: 'customfield_1'})).toBe(
      'customfield_1'
    )
  })
  it('returns null for a label push', () => {
    expect(resolveJiraFieldId({targetKind: 'label', labelName: 'Effort: 3'})).toBeNull()
  })
  it('returns null when the push left no provenance', () => {
    expect(resolveJiraFieldId(null)).toBeNull()
  })
})
