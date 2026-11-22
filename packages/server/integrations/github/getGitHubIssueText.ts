import GitHubRepoId from 'parabol-client/integrations/github/shared/GitHubRepoId'
import type {GetIssueTextQuery, GetIssueTextQueryVariables} from '../../types/githubTypes'
import getIssueText from '../../utils/githubQueries/getIssueText.graphql'
import logError from '../../utils/logError'
import type {IssueText} from '../platform/InspirationIssue'
import type {IssueTextCtx} from '../platform/ServerIntegrationDefinition'
import getGitHubRequest from './getGitHubRequest'

const getGitHubIssueText = async ({
  task,
  dataLoader,
  context,
  info
}: IssueTextCtx): Promise<IssueText | null> => {
  const {integration, teamId} = task
  if (integration?.service !== 'github') return null
  const {accessUserId, nameWithOwner, issueNumber} = integration
  const auth = await dataLoader.get('githubAuth').load({userId: accessUserId, teamId})
  if (!auth) return null
  const {repoOwner, repoName} = GitHubRepoId.split(nameWithOwner)
  const githubRequest = getGitHubRequest(info, context, {accessToken: auth.accessToken})
  const [data, error] = await githubRequest<GetIssueTextQuery, GetIssueTextQueryVariables>(
    getIssueText,
    {name: repoName, owner: repoOwner, number: issueNumber}
  )
  if (error) {
    logError(error, {userId: accessUserId})
    return null
  }
  const issue = data.repository?.issue
  if (!issue) return null
  return {title: issue.title, reference: `${nameWithOwner}#${issueNumber}`, description: issue.body}
}

export default getGitHubIssueText
