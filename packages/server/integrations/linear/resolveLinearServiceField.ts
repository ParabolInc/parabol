import LinearProjectId from 'parabol-client/shared/gqlIds/LinearProjectId'
import {SprintPokerDefaults} from 'parabol-client/types/constEnums'
import logError from '../../utils/logError'
import type {ServiceField, ServiceFieldCtx} from '../platform/ServerIntegrationDefinition'
import LinearServerManager from './LinearServerManager'

const resolveLinearServiceField = async ({
  task,
  dataLoader,
  teamId,
  dimensionName,
  viewerId,
  context,
  info
}: ServiceFieldCtx): Promise<ServiceField | null> => {
  const {integration} = task
  if (integration?.service !== 'linear') return null
  const {issueId, accessUserId} = integration
  const auth = await dataLoader
    .get('freshAuth')
    .load({service: 'linear', teamId, userId: accessUserId})
  if (!auth?.accessToken) return null
  const manager = new LinearServerManager(auth, context, info)
  const [issueData, issueError] = await manager.getIssue({id: issueId})
  if (issueError) {
    logError(issueError, {userId: viewerId, tags: {teamId, id: issueId}})
    return null
  }
  const {issue} = issueData
  if (!issue) return null
  const {
    team: {id: linearTeamId},
    project
  } = issue
  const linearProjectId = project?.id
  if (!linearTeamId) return null
  const calcRepoId = LinearProjectId.join(linearTeamId, linearProjectId)
  const linearFieldMap = await dataLoader
    .get('linearDimensionFieldMaps')
    .load({teamId, dimensionName, repoId: calcRepoId})
  if (linearFieldMap) {
    return {name: linearFieldMap.labelTemplate ?? '', type: 'string'}
  }
  return {name: SprintPokerDefaults.SERVICE_FIELD_COMMENT, type: 'string'}
}

export default resolveLinearServiceField
