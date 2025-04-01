import {LinearIntegrationResolvers} from '../resolverTypes'

export type LinearIntegrationSource = {
  teamId: string
  userId: string
}

const LinearIntegration: LinearIntegrationResolvers = {
  auth: async ({teamId, userId}, _args, {dataLoader}) => {
    return dataLoader.get('freshLinearAuth').load({teamId, userId})
  },

  clientId: async (): Promise<string | null> => {
    return process.env.LINEAR_CLIENT_ID || null
  }

  // TODO: Add other Linear-specific resolvers here later if needed (e.g., fetching issues)
}

export default LinearIntegration
