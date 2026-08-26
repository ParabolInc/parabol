import {SprintPokerDefaults} from 'parabol-client/types/constEnums'
import logError from '../../utils/logError'
import type {ServiceField, ServiceFieldCtx} from '../platform/ServerIntegrationDefinition'
import GitLabServerManager from './GitLabServerManager'

const resolveGitLabServiceField = async ({
  task,
  dataLoader,
  teamId,
  dimensionName,
  viewerId,
  context,
  info
}: ServiceFieldCtx): Promise<ServiceField | null> => {
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
  const gitlabFieldMap = await dataLoader
    .get('gitlabDimensionFieldMaps')
    .load({teamId, dimensionName, projectId, providerId})
  if (gitlabFieldMap) {
    return {name: gitlabFieldMap.labelTemplate ?? '', type: 'string'}
  }
  return {name: SprintPokerDefaults.SERVICE_FIELD_COMMENT, type: 'string'}
}

export default resolveGitLabServiceField
