import {GcalIntegrationResolvers} from '../resolverTypes'

export type GcalIntegrationSource = {
  teamId: string
  userId: string
}

const GcalIntegration: GcalIntegrationResolvers = {
  auth: ({teamId, userId}, _args, {dataLoader}) => {
    return dataLoader.get('freshGcalAuth').load({teamId, userId})
  },
  cloudProvider: async (_source, _args, {dataLoader}) => {
    const [globalProvider] = await dataLoader
      .get('sharedIntegrationProviders')
      .load({service: 'gcal', orgTeamIds: ['aGhostTeam'], teamIds: []})
    if (!globalProvider) return null
    return globalProvider
  }
}

export default GcalIntegration
