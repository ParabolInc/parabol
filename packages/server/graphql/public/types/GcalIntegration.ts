import {GcalIntegrationResolvers} from '../resolverTypes'

export type GcalIntegrationSource = {
  teamId: string
  userId: string
}

const GcalIntegration: GcalIntegrationResolvers = {
  auth: async ({teamId, userId}, _args, {dataLoader}) => {
    const gcalAuth = await dataLoader.get('freshGcalAuth').load({teamId, userId})
    if (!gcalAuth) throw new Error('No auth found')
    return gcalAuth
  },
  cloudProvider: async (_source, _args, {dataLoader}) => {
    const [globalProvider] = await dataLoader
      .get('sharedIntegrationProviders')
      .load({service: 'gcal', orgTeamIds: ['aGhostTeam'], teamIds: []})
    if (!globalProvider) throw new Error('No global provider found')
    return globalProvider
  }
}

export default GcalIntegration
