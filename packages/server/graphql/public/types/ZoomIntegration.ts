import type {ZoomIntegrationResolvers} from '../resolverTypes'

export type ZoomIntegrationSource = {
  teamId: string
  userId: string
}

const ZoomIntegration: ZoomIntegrationResolvers = {
  cloudProvider: async (_source, _args, {dataLoader}) => {
    const [globalProvider] = await dataLoader
      .get('sharedIntegrationProviders')
      .load({service: 'zoom', orgIds: [], teamIds: []})
    return globalProvider ?? null
  },

  isActive: async ({teamId, userId}, _args, {dataLoader}) => {
    const auth = await dataLoader.get('freshZoomAuth').load({teamId, userId})
    return !!auth?.isActive
  }
}

export default ZoomIntegration
