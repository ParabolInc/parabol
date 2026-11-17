import type {IssueReadCtx} from '../platform/ServerIntegrationDefinition'

const resolveJiraTaskIntegration = async ({task, dataLoader, viewerId}: IssueReadCtx) => {
  const {integration, teamId, id: taskId} = task
  if (integration?.service !== 'jira') return null
  const {accessUserId, cloudId, issueKey} = integration
  return dataLoader.get('jiraIssue').load({
    teamId,
    userId: accessUserId,
    cloudId,
    issueKey,
    taskId,
    viewerId
  })
}

export default resolveJiraTaskIntegration
