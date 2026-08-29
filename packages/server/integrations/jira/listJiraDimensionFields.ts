import {ExternalLinks} from 'parabol-client/types/constEnums'
import type {JiraIssueMissingEstimationFieldHintEnum} from '../../graphql/public/resolverTypes'
import type {
  DimensionFieldCtx,
  DimensionFieldListing
} from '../platform/ServerIntegrationDefinition'

const MISSING_FIELD_DOCS: Record<JiraIssueMissingEstimationFieldHintEnum, string> = {
  companyManagedStoryPoints: ExternalLinks.INTEGRATIONS_SUPPORT_JIRA_MISSING_FIELD_COMPANY_MANAGED,
  teamManagedStoryPoints: ExternalLinks.INTEGRATIONS_SUPPORT_JIRA_MISSING_FIELD_TEAM_MANAGED
}

const listJiraDimensionFields = async ({
  task,
  dataLoader,
  teamId,
  viewerId
}: DimensionFieldCtx): Promise<DimensionFieldListing> => {
  const {integration, id: taskId} = task
  if (integration?.service !== 'jira') return {options: []}
  const {cloudId, issueKey, accessUserId} = integration
  const jiraIssue = await dataLoader
    .get('jiraIssue')
    .load({teamId, userId: accessUserId, cloudId, issueKey, taskId, viewerId})
  if (!jiraIssue) return {options: []}
  const {possibleEstimationFields, missingEstimationFieldHint} = jiraIssue
  const options = possibleEstimationFields.map(({fieldId, fieldName}) => ({
    fieldId,
    label: fieldName
  }))
  if (!missingEstimationFieldHint) return {options}
  return {options, helpUrl: MISSING_FIELD_DOCS[missingEstimationFieldHint]}
}

export default listJiraDimensionFields
