import logError from '../../utils/logError'
import type {IssueReadCtx} from '../platform/ServerIntegrationDefinition'
import LinearServerManager from './LinearServerManager'

const resolveLinearTaskIntegration = async ({
  task,
  dataLoader,
  context,
  info,
  fieldsToFetch
}: IssueReadCtx) => {
  const {integration, teamId} = task
  if (integration?.service !== 'linear') return null
  const {accessUserId} = integration
  const linearAuth = await dataLoader
    .get('freshAuth')
    .load({service: 'linear', teamId, userId: accessUserId})
  if (!linearAuth?.accessToken) return null
  const {issueId} = integration
  const query = `
          query {
            issue(id: "${issueId}"){
              ${fieldsToFetch}
            }
          }
        `
  const manager = new LinearServerManager(linearAuth, context, info)
  const linearRequest = manager.getLinearRequest(info, context)
  const [data, error] = await linearRequest(query, {})
  if (error) {
    logError(error, {userId: accessUserId})
  }
  // Ensure the returned object has a standard prototype
  return data ? {...data} : null
}

export default resolveLinearTaskIntegration
