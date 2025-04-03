import {isNotNull} from '../../../../client/utils/predicates'
import {DataLoaderWorker} from '../../graphql'
import {MattermostIntegrationResolvers} from '../resolverTypes'

export type MattermostIntegrationSource = {
  teamId: string
  userId: string
}

const loadActiveProvider = async (teamId: string, dataLoader: DataLoaderWorker) => {
  const [mattermostProvider] = await dataLoader
    .get('sharedIntegrationProviders')
    .load({service: 'mattermost', orgIds: [], teamIds: []})
  if (mattermostProvider && mattermostProvider.authStrategy === 'sharedSecret') {
    return mattermostProvider
  }

  const auths = await dataLoader
    .get('teamMemberIntegrationAuthsByTeamIdAndService')
    .load({teamId, service: 'mattermost'})
  if (!auths || auths.length !== 1) return null
  const {providerId} = auths[0]!
  return await dataLoader.get('integrationProviders').loadNonNull(providerId)
}

const MattermostIntegration: MattermostIntegrationResolvers = {
  auth: async ({teamId, userId}, _args, {dataLoader}) => {
    const res = await dataLoader
      .get('teamMemberIntegrationAuthsByServiceTeamAndUserId')
      .load({service: 'mattermost', teamId, userId})
    return res!
  },

  sharedProviders: async ({teamId}, _args, {dataLoader}) => {
    const team = await dataLoader.get('teams').loadNonNull(teamId)
    const {orgId} = team
    return dataLoader
      .get('sharedIntegrationProviders')
      .load({service: 'mattermost', orgIds: [orgId], teamIds: [teamId]})
  },

  isActive: async ({teamId}, _args, {dataLoader}) => {
    const auths = await dataLoader
      .get('teamMemberIntegrationAuthsByTeamIdAndService')
      .load({teamId, service: 'mattermost'})
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
  },

  linkedChannels: async ({teamId}, _args, {dataLoader}) => {
    const [mattermostProvider] = await dataLoader
      .get('sharedIntegrationProviders')
      .load({service: 'mattermost', orgIds: [], teamIds: []})
    if (!mattermostProvider || mattermostProvider.authStrategy !== 'sharedSecret') {
      return []
    }
    const {id: providerId} = mattermostProvider
    const settings = await dataLoader
      .get('teamNotificationSettingsByProviderIdAndTeamId')
      .load({providerId, teamId})
    return settings.map(({channelId}) => channelId).filter(isNotNull)
  }
}

export default MattermostIntegration
