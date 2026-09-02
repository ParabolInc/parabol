import {SprintPokerDefaults} from 'parabol-client/types/constEnums'
import type {ServiceField, ServiceFieldCtx} from '../platform/ServerIntegrationDefinition'

const resolveJiraServerServiceField = async ({
  task,
  dataLoader,
  teamId,
  dimensionName
}: ServiceFieldCtx): Promise<ServiceField | null> => {
  const {integration} = task
  if (integration?.service !== 'jiraServer') return null
  const {providerId, repositoryId: projectId, issueId, accessUserId} = integration
  const jiraServerIssue = await dataLoader
    .get('jiraServerIssue')
    .load({providerId, teamId, userId: accessUserId, issueId})
  if (!jiraServerIssue) return null
  const {issueType} = jiraServerIssue
  const existingDimensionField = await dataLoader
    .get('jiraServerDimensionFieldMap')
    .load({providerId, projectId, issueType, teamId, dimensionName})
  if (existingDimensionField) {
    return {name: existingDimensionField.fieldName ?? '', type: existingDimensionField.fieldType}
  }
  return {name: SprintPokerDefaults.SERVICE_FIELD_COMMENT, type: 'string'}
}

export default resolveJiraServerServiceField
