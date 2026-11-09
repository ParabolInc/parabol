import type {IssueReadCtx} from '../platform/ServerIntegrationDefinition'

const resolveClickUpTaskIntegration = async ({task, dataLoader}: IssueReadCtx) => {
  const {integration, teamId} = task
  if (integration?.service !== 'clickup') return null
  const {accessUserId, taskId} = integration
  return dataLoader.get('clickUpTask').load({teamId, userId: accessUserId, taskId})
}

export default resolveClickUpTaskIntegration
