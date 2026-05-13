import type {GdriveIntegrationResolvers} from '../resolverTypes'

export type GdriveIntegrationSource = {
  teamId: string
  userId: string
}

const GdriveIntegration: GdriveIntegrationResolvers = {
  auth: ({teamId, userId}, _args, {dataLoader}) => {
    return dataLoader.get('freshGdriveAuth').load({teamId, userId})
  },

  cloudProvider: async (_source, _args, {dataLoader}) => {
    const [globalProvider] = await dataLoader
      .get('sharedIntegrationProviders')
      .load({service: 'gdrive', orgIds: [], teamIds: []})
    return globalProvider ?? null
  },

  isActive: async ({teamId, userId}, _args, {dataLoader}) => {
    const auth = await dataLoader.get('freshGdriveAuth').load({teamId, userId})
    return !!auth?.isActive
  },

}

export default GdriveIntegration
