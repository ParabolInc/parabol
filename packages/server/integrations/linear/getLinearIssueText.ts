import logError from '../../utils/logError'
import type {IssueText} from '../platform/InspirationIssue'
import type {IssueTextCtx} from '../platform/ServerIntegrationDefinition'
import LinearServerManager from './LinearServerManager'

const getLinearIssueText = async ({
  task,
  dataLoader,
  context,
  info
}: IssueTextCtx): Promise<IssueText | null> => {
  const {integration, teamId} = task
  if (integration?.service !== 'linear') return null
  const {accessUserId, issueId} = integration
  const auth = await dataLoader
    .get('freshAuth')
    .load({service: 'linear', teamId, userId: accessUserId})
  if (!auth?.accessToken) return null
  const manager = new LinearServerManager(auth, context, info)
  const [data, error] = await manager.getIssue({id: issueId})
  if (error) {
    logError(error, {userId: accessUserId})
    return null
  }
  const issue = data?.issue
  if (!issue) return null
  return {title: issue.title, reference: issue.identifier, description: issue.description ?? ''}
}

export default getLinearIssueText
