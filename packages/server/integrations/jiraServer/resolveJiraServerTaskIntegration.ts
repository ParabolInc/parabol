import type {IssueReadCtx} from '../platform/ServerIntegrationDefinition'

const resolveJiraServerTaskIntegration = async ({task, dataLoader}: IssueReadCtx) => {
  const {integration, teamId} = task
  if (integration?.service !== 'jiraServer') return null
  const issue = await dataLoader.get('integrationIssue').load({teamId, integration})
  return issue ? {...issue, userId: integration.accessUserId, teamId} : null
}

export default resolveJiraServerTaskIntegration
