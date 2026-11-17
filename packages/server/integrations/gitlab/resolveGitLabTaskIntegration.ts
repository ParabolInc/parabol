import logError from '../../utils/logError'
import type {IssueReadCtx} from '../platform/ServerIntegrationDefinition'
import GitLabServerManager from './GitLabServerManager'

const resolveGitLabTaskIntegration = async ({
  task,
  dataLoader,
  context,
  info,
  fieldsToFetch
}: IssueReadCtx) => {
  const {integration, teamId} = task
  if (integration?.service !== 'gitlab') return null
  const {accessUserId} = integration
  const gitlabAuth = await dataLoader
    .get('freshAuth')
    .load({service: 'gitlab', teamId, userId: accessUserId})
  if (!gitlabAuth?.accessToken) return null
  const {providerId} = gitlabAuth
  const provider = await dataLoader.get('integrationProviders').load(providerId)
  if (!provider?.serverBaseUrl) return null
  const {gid} = integration
  const query = `
          query {
            issue(id: "${gid}"){
              ${fieldsToFetch}
            }
          }
        `
  const manager = new GitLabServerManager(gitlabAuth, context, info, provider.serverBaseUrl)
  const gitlabRequest = manager.getGitLabRequest(info, context)
  const [data, error] = await gitlabRequest(query, {})
  if (error) {
    logError(error, {userId: accessUserId})
  }
  return data
}

export default resolveGitLabTaskIntegration
