import {DataLoaderWorker} from '../../graphql'
import {LinearIntegrationResolvers} from '../resolverTypes'

const fetchAuth = async (teamId: string, userId: string, dataLoader: DataLoaderWorker) => {
  return dataLoader
    .get('teamMemberIntegrationAuthsByServiceTeamAndUserId')
    .load({service: 'linear', teamId, userId})
}

const LinearIntegration: LinearIntegrationResolvers = {
  auth: async ({teamId, userId}, _args, {dataLoader}) => {
    return fetchAuth(teamId, userId, dataLoader)
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
  },

  linearSearchQueries: async () => []
}

export default LinearIntegration
