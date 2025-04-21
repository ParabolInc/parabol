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

  linearSearchQueries: async () => []
}

export default LinearIntegration
