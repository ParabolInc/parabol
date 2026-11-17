import type {GraphQLResolveInfo} from 'graphql'
import type {TaskEstimate as TaskEstimateDB} from '../../../../postgres/types'
import type {GQLContext} from '../../../graphql'
import TaskEstimate from '../TaskEstimate'

const context = {} as GQLContext
const info = {} as GraphQLResolveInfo

const resolveJiraFieldId = (row: Pick<TaskEstimateDB, 'pushService' | 'pushTargetId'>) => {
  const field = TaskEstimate.jiraFieldId
  if (typeof field !== 'function') throw new Error('jiraFieldId is not a resolver function')
  return field(row as TaskEstimateDB, {}, context, info)
}

describe('TaskEstimate.jiraFieldId', () => {
  it('returns the field id a Jira push wrote', () => {
    expect(resolveJiraFieldId({pushService: 'jira', pushTargetId: 'customfield_1'})).toBe(
      'customfield_1'
    )
  })
  it('returns null for a field another service wrote', () => {
    expect(resolveJiraFieldId({pushService: 'azureDevOps', pushTargetId: 'StoryPoints'})).toBeNull()
  })
  it('returns null for a label push', () => {
    expect(resolveJiraFieldId({pushService: 'github', pushTargetId: 'Effort: 3'})).toBeNull()
  })
  it('returns null when the push left no provenance', () => {
    expect(resolveJiraFieldId({pushService: null, pushTargetId: null})).toBeNull()
  })
})
