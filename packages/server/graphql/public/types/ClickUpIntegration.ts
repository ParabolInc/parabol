import makeClickUpTaskConnection from '../../../integrations/clickup/makeClickUpTaskConnection'
import type {ClickUpIntegrationResolvers} from '../resolverTypes'

export type ClickUpIntegrationSource = {
  teamId: string
  userId: string
}

const ClickUpIntegration: ClickUpIntegrationResolvers = {
  id: ({teamId, userId}) => `clickup:${teamId}:${userId}`,

  tasks: ({teamId, userId}, args, context, info) =>
    makeClickUpTaskConnection({dataLoader: context.dataLoader, teamId, userId, context, info}, args)
}

export default ClickUpIntegration
