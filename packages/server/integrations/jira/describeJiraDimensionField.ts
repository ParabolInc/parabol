import type {
  DimensionFieldCtx,
  DimensionFieldKey,
  DimensionFieldTarget
} from '../platform/ServerIntegrationDefinition'

const describeJiraDimensionField = async (
  {task, dataLoader, teamId, viewerId}: DimensionFieldCtx,
  _key: DimensionFieldKey,
  fieldId: string
): Promise<DimensionFieldTarget | Error> => {
  const {integration, id: taskId} = task
  if (integration?.service !== 'jira') return new Error('Not a Jira task')
  const {cloudId, issueKey, accessUserId} = integration
  const jiraIssue = await dataLoader.get('jiraIssue').load({
    teamId,
    userId: accessUserId,
    cloudId,
    issueKey,
    taskId,
    viewerId
  })
  if (!jiraIssue) return new Error('Issue not found')
  const field = jiraIssue.possibleEstimationFields.find(
    (candidate) => candidate.fieldId === fieldId
  )
  return field
    ? {fieldId: field.fieldId, fieldName: field.fieldName, fieldType: field.fieldType}
    : new Error('Invalid field name')
}

export default describeJiraDimensionField
