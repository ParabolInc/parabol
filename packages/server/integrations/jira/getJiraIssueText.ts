import type {IssueText} from '../platform/InspirationIssue'
import type {IssueTextCtx} from '../platform/ServerIntegrationDefinition'
import adfToPlaintext from './adfToPlaintext'

const getJiraIssueText = async ({
  task,
  dataLoader,
  viewerId
}: IssueTextCtx): Promise<IssueText | null> => {
  const {integration, teamId, id: taskId} = task
  if (integration?.service !== 'jira') return null
  const {accessUserId, cloudId, issueKey} = integration
  const issue = await dataLoader.get('jiraIssue').load({
    teamId,
    userId: accessUserId,
    cloudId,
    issueKey,
    taskId,
    viewerId
  })
  if (!issue) return null
  return {
    title: issue.summary,
    reference: issue.issueKey,
    description: adfToPlaintext(issue.description)
  }
}

export default getJiraIssueText
