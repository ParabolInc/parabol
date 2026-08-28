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
  return {repoId: `${providerId}:${repositoryId}`, workItemType: issueType}
}

export default resolveJiraServerDimensionFieldKey
