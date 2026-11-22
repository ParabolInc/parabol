import type {IssueText} from '../platform/InspirationIssue'
import type {IssueTextCtx} from '../platform/ServerIntegrationDefinition'

const getJiraServerIssueText = async ({
  task,
  dataLoader
}: IssueTextCtx): Promise<IssueText | null> => {
  const {integration, teamId} = task
  if (integration?.service !== 'jiraServer') return null
  const issue = await dataLoader.get('integrationIssue').load({teamId, integration})
  if (issue?.service !== 'jiraServer') return null
  return {title: issue.summary, reference: issue.issueKey, description: issue.description ?? ''}
}

export default getJiraServerIssueText
