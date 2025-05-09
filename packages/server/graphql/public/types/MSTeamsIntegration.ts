import {DataLoaderWorker} from '../../graphql'
import {MsTeamsIntegrationResolvers} from '../resolverTypes'

export type MSTeamsIntegrationSource = {
  teamId: string
  userId: string
}

const loadActiveProvider = async (teamId: string, dataLoader: DataLoaderWorker) => {
  const auths = await dataLoader
    .get('teamMemberIntegrationAuthsByTeamIdAndService')
    .load({teamId, service: 'msTeams'})
  if (!auths || auths.length !== 1) return null
  const {providerId} = auths[0]!
  return await dataLoader.get('integrationProviders').loadNonNull(providerId)
}

const MSTeamsIntegration: MsTeamsIntegrationResolvers = {
  auth: async ({teamId, userId}, _args, {dataLoader}) => {
    return dataLoader
      .get('teamMemberIntegrationAuthsByServiceTeamAndUserId')
      .load({service: 'msTeams', teamId, userId})
  },

  sharedProviders: async ({teamId}, _args, {dataLoader}) => {
    const team = await dataLoader.get('teams').loadNonNull(teamId)
    const {orgId} = team
    return dataLoader
      .get('sharedIntegrationProviders')
      .load({service: 'msTeams', orgIds: [orgId], teamIds: [teamId]})
  },

  isActive: async ({teamId}, _args, {dataLoader}) => {
    const auths = await dataLoader
      .get('teamMemberIntegrationAuthsByTeamIdAndService')
      .load({teamId, service: 'msTeams'})
    return auths && auths.length > 1
  },

  activeProvider: async ({teamId}, _args, {dataLoader}) => {
    return loadActiveProvider(teamId, dataLoader)
  },

  teamNotificationSettings: async ({teamId}, {channel}, {dataLoader}) => {
    const activeProvider = await loadActiveProvider(teamId, dataLoader)
    if (!activeProvider) return null
    const {id} = activeProvider
    const settings = await dataLoader
      .get('teamNotificationSettingsByProviderIdAndTeamId')
      .load({providerId: id, teamId})
    return settings.find(({channelId}) => (!channelId && !channel) || channelId === channel) || null
  }
}

export default MSTeamsIntegration
