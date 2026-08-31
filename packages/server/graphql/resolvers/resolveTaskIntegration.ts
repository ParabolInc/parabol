import type {GraphQLResolveInfo} from 'graphql'
import {getServerIntegration} from '../../integrations/platform/registry'
import type {Task} from '../../postgres/types'
import {getUserId} from '../../utils/authorization'
import type {InternalContext} from '../graphql'

export const resolveTaskIntegration = async (
  task: Task,
  context: InternalContext,
  info: GraphQLResolveInfo,
  fieldsToFetch = '...info'
) => {
  const {integration, teamId} = task
  if (!integration) return null
  const {dataLoader, authToken} = context
  const viewerId = getUserId(authToken)
  const {issueRead} = getServerIntegration(integration.service).capabilities
  return issueRead.getIssue({
    dataLoader,
    teamId,
    userId: integration.accessUserId,
    context,
    info,
    task,
    viewerId,
    fieldsToFetch
  })
}
