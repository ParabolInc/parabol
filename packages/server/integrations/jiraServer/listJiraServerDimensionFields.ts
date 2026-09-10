import type {DimensionFieldCtx, ServiceFieldListing} from '../platform/ServerIntegrationDefinition'
import {VOTE_FIELD_ALLOWED_TYPES, VOTE_FIELD_ID_BLACKLIST} from './jiraServerVoteFields'

const listJiraServerDimensionFields = async ({
  task,
  dataLoader,
  teamId
}: DimensionFieldCtx): Promise<ServiceFieldListing> => {
  const {integration} = task
  if (integration?.service !== 'jiraServer') return {options: []}
  const {providerId, issueId, accessUserId} = integration
  const issue = await dataLoader
    .get('jiraServerIssue')
    .load({providerId, teamId, userId: accessUserId, issueId})
  if (!issue) return {options: []}
  const {issueType, projectId} = issue
  const fieldTypes = await dataLoader
    .get('jiraServerFieldTypes')
    .load({teamId, userId: accessUserId, projectId, issueType, providerId})
  if (!fieldTypes) return {options: []}
  const options = fieldTypes
    .filter(
      ({fieldId, operations, schema}) =>
        !VOTE_FIELD_ID_BLACKLIST.includes(fieldId) &&
        operations.includes('set') &&
        VOTE_FIELD_ALLOWED_TYPES.includes(schema.type)
    )
    .map(({fieldId, name, schema}) => ({fieldId, label: name, type: schema.type}))
  return {options}
}

export default listJiraServerDimensionFields
