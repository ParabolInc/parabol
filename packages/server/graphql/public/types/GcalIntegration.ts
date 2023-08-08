import {GcalIntegrationResolvers} from '../resolverTypes'

export type GcalIntegrationSource = {
  teamId: string
  userId: string
}

const GcalIntegration: GcalIntegrationResolvers = {
  auth: async ({teamId, userId}, _args, {dataLoader}) => {
    return await dataLoader.get('freshGcalAuth').load({teamId, userId})
  },
  cloudProvider: async (_source, _args, {dataLoader}) => {
    const [globalProvider] = await dataLoader
      .get('sharedIntegrationProviders')
      .load({service: 'gcal', orgTeamIds: ['aGhostTeam'], teamIds: []})
    return globalProvider
  }
}

export default GcalIntegration
