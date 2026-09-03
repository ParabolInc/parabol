import JiraServerProjectId from 'parabol-client/shared/gqlIds/JiraServerProjectId'
import type {DimensionFieldCtx, DimensionFieldKey} from '../platform/ServerIntegrationDefinition'

const resolveJiraServerDimensionFieldKey = async ({
  task,
  dataLoader,
  teamId
}: DimensionFieldCtx): Promise<DimensionFieldKey | null> => {
  const {integration} = task
  if (integration?.service !== 'jiraServer') return null
  const {providerId, repositoryId, issueId, accessUserId} = integration
  const jiraServerIssue = await dataLoader
    .get('jiraServerIssue')
    .load({providerId, teamId, userId: accessUserId, issueId})
  if (!jiraServerIssue) return null
  const {issueType} = jiraServerIssue
  return {repoId: JiraServerProjectId.join(providerId, repositoryId), issueType}
}

export default resolveJiraServerDimensionFieldKey
