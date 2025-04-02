import {LinearIntegrationResolvers} from '../resolverTypes'

export type LinearIntegrationSource = {
  teamId: string
  userId: string
}

const LinearIntegration: LinearIntegrationResolvers = {
  auth: async ({teamId, userId}, _args, {dataLoader}) => {
    return dataLoader
      .get('teamMemberIntegrationAuthsByServiceTeamAndUserId')
      .load({service: 'linear', teamId, userId})
  },

  cloudProvider: async (_source, _args, {dataLoader}) => {
    const [globalProvider] = await dataLoader
      .get('sharedIntegrationProviders')
      .load({service: 'linear', orgIds: [], teamIds: []})
    return globalProvider!
  },

  id: ({teamId, userId}) => `linear:${teamId}:${userId}`,

  sharedProviders: async ({teamId}, _args, {dataLoader}) => {
    const team = await dataLoader.get('teams').loadNonNull(teamId)
    const {orgId} = team
    return dataLoader
      .get('sharedIntegrationProviders')
      .load({service: 'linear', orgIds: [orgId], teamIds: [teamId]})
  }

  // TODO: Add other Linear-specific resolvers here later if needed (e.g., fetching issues)
}

export default LinearIntegration
