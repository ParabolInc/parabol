import GitHubRepoId from '../../../client/integrations/github/shared/GitHubRepoId'
import logError from '../../utils/logError'
import type {IssueReadCtx} from '../platform/ServerIntegrationDefinition'
import getGitHubRequest from './getGitHubRequest'

const resolveGitHubTaskIntegration = async ({
  task,
  dataLoader,
  context,
  info,
  fieldsToFetch
}: IssueReadCtx) => {
  const {integration, teamId} = task
  if (integration?.service !== 'github') return null
  const {accessUserId} = integration
  const githubAuth = await dataLoader.get('githubAuth').load({userId: accessUserId, teamId})
  if (!githubAuth) return null
  const {accessToken} = githubAuth
  const {nameWithOwner, issueNumber} = integration
  const {repoOwner, repoName} = GitHubRepoId.split(nameWithOwner)
  const query = `
              {
                repository(owner: "${repoOwner}", name: "${repoName}") {
                  issue(number: ${issueNumber}) {
                    ${fieldsToFetch}
                  }
                }
              }`

  const githubRequest = getGitHubRequest(info, context, {accessToken})
  const [data, error] = await githubRequest(query)

  if (error) {
    logError(error, {userId: accessUserId})
  }
  return data
}

export default resolveGitHubTaskIntegration
