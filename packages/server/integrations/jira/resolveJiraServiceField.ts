import {SprintPokerDefaults} from 'parabol-client/types/constEnums'
import JiraProjectKeyId from '../../../client/shared/gqlIds/JiraProjectKeyId'
import type {ServiceField, ServiceFieldCtx} from '../platform/ServerIntegrationDefinition'

const resolveJiraServiceField = async ({
  task,
  dataLoader,
  teamId,
  dimensionName,
  viewerId
}: ServiceFieldCtx): Promise<ServiceField | null> => {
  const {integration, id: taskId} = task
  if (integration?.service !== 'jira') return null
  const {cloudId, issueKey, accessUserId} = integration
  const projectKey = JiraProjectKeyId.join(issueKey)
  const jiraIssue = await dataLoader.get('jiraIssue').load({
    teamId,
    userId: accessUserId,
    cloudId,
    issueKey,
    taskId,
    viewerId
  })
  if (!jiraIssue) return null
  const {issueType, possibleEstimationFields} = jiraIssue
  const dimensionFields = await dataLoader
    .get('jiraDimensionFieldMap')
    .load({teamId, cloudId, projectKey, issueType, dimensionName})
  const validFieldIds = [
    SprintPokerDefaults.SERVICE_FIELD_COMMENT,
    SprintPokerDefaults.SERVICE_FIELD_NULL,
    ...possibleEstimationFields.map(({fieldId}) => fieldId)
  ]
  const dimensionField = dimensionFields.find(({fieldId}) => validFieldIds.includes(fieldId))
  if (dimensionField) {
    return {name: dimensionField.fieldName ?? '', type: dimensionField.fieldType}
  }
  return {name: SprintPokerDefaults.SERVICE_FIELD_COMMENT, type: 'string'}
}

export default resolveJiraServiceField
