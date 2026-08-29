import type {
  DimensionFieldCtx,
  DimensionFieldListing
} from '../platform/ServerIntegrationDefinition'
import {VOTE_FIELD_ALLOWED_TYPES, VOTE_FIELD_ID_BLACKLIST} from './jiraServerVoteFields'

const listJiraServerDimensionFields = async ({
  task,
  dataLoader,
  teamId
}: DimensionFieldCtx): Promise<DimensionFieldListing> => {
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
    .map(({name}) => ({fieldId: name, label: name}))
  return {options}
}

export default listJiraServerDimensionFields
