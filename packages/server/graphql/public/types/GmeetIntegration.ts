import type {GmeetIntegrationResolvers} from '../resolverTypes'

export type GmeetIntegrationSource = {
  teamId: string
  userId: string
}

const GmeetIntegration: GmeetIntegrationResolvers = {
  auth: ({teamId, userId}, _args, {dataLoader}) => {
    return dataLoader.get('freshAuth').load({service: 'gmeet', teamId, userId})
  },

  cloudProvider: async (_source, _args, {dataLoader}) => {
    const [globalProvider] = await dataLoader
      .get('sharedIntegrationProviders')
      .load({service: 'gmeet', orgIds: [], teamIds: []})
    return globalProvider ?? null
  },

  isActive: async ({teamId, userId}, _args, {dataLoader}) => {
    const auth = await dataLoader.get('freshAuth').load({service: 'gmeet', teamId, userId})
    return !!auth?.isActive
  }
}

export default GmeetIntegration
