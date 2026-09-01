import JiraServerIssueId from '../../../client/shared/gqlIds/JiraServerIssueId'
import type {IssueReadCtx} from '../platform/ServerIntegrationDefinition'

const resolveJiraServerTaskIntegration = async ({task, dataLoader}: IssueReadCtx) => {
  const {integration, teamId, integrationHash} = task
  if (integration?.service !== 'jiraServer') return null
  const {accessUserId} = integration
  const {issueId} = JiraServerIssueId.split(integrationHash!)
  const issue = await dataLoader.get('jiraServerIssue').load({
    teamId,
    userId: accessUserId,
    issueId,
    providerId: integration.providerId
  })
  return issue
    ? {
        ...issue,
        userId: accessUserId,
        teamId
      }
    : null
}

export default resolveJiraServerTaskIntegration
