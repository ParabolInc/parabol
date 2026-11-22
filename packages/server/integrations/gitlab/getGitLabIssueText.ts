import logError from '../../utils/logError'
import type {IssueText} from '../platform/InspirationIssue'
import type {IssueTextCtx} from '../platform/ServerIntegrationDefinition'
import GitLabServerManager from './GitLabServerManager'

const getGitLabIssueText = async ({
  task,
  dataLoader,
  context,
  info
}: IssueTextCtx): Promise<IssueText | null> => {
  const {integration, teamId} = task
  if (integration?.service !== 'gitlab') return null
  const {accessUserId, gid} = integration
  const auth = await dataLoader
    .get('freshAuth')
    .load({service: 'gitlab', teamId, userId: accessUserId})
  if (!auth?.accessToken) return null
  const provider = await dataLoader.get('integrationProviders').load(auth.providerId)
  if (!provider?.serverBaseUrl) return null
  const manager = new GitLabServerManager(auth, context, info, provider.serverBaseUrl)
  const [data, error] = await manager.getIssue({gid})
  if (error) {
    logError(error, {userId: accessUserId})
    return null
  }
  const issue = data.issue
  if (!issue) return null
  return {title: issue.title, reference: issue.reference, description: issue.description ?? ''}
}

export default getGitLabIssueText
