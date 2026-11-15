import type {IssueReadCtx} from '../platform/ServerIntegrationDefinition'

const resolveClickUpTaskIntegration = async ({task, dataLoader}: IssueReadCtx) => {
  const {integration, teamId} = task
  if (integration?.service !== 'clickup') return null
  return dataLoader.get('integrationIssue').load({teamId, integration})
}

export default resolveClickUpTaskIntegration
