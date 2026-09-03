import GitLabProjectId from 'parabol-client/shared/gqlIds/GitLabProjectId'
import logError from '../../utils/logError'
import type {DimensionFieldCtx, DimensionFieldKey} from '../platform/ServerIntegrationDefinition'
import GitLabServerManager from './GitLabServerManager'

const resolveGitLabDimensionFieldKey = async ({
  task,
  dataLoader,
  teamId,
  viewerId,
  context,
  info
}: DimensionFieldCtx): Promise<DimensionFieldKey | null> => {
  const {integration} = task
  if (integration?.service !== 'gitlab') return null
  const {gid, accessUserId} = integration
  const gitlabAuth = await dataLoader
    .get('freshAuth')
    .load({service: 'gitlab', teamId, userId: accessUserId})
  if (!gitlabAuth?.accessToken) return null
  const {providerId} = gitlabAuth
  const provider = await dataLoader.get('integrationProviders').loadNonNull(providerId)
  const manager = new GitLabServerManager(gitlabAuth, context, info, provider.serverBaseUrl!)
  const [issueData, issueError] = await manager.getIssue({gid})
  if (issueError) {
    logError(issueError, {userId: viewerId, tags: {teamId, gid}})
    return null
  }
  const {issue} = issueData
  if (!issue) return null
  const {projectId} = issue
  if (!projectId) return null
  return {repoId: GitLabProjectId.join(providerId, projectId), issueType: null}
}

export default resolveGitLabDimensionFieldKey
