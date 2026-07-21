import {sql} from 'kysely'
import {isNotNull} from '../../../../client/utils/predicates'
import getKysely from '../../../postgres/getKysely'
import logError from '../../../utils/logError'
import type {MutationResolvers} from '../resolverTypes'

const linkMattermostChannel: MutationResolvers['linkMattermostChannel'] = async (
  _source,
  {teamId, channelId, webhookToken},
  context
) => {
  const {dataLoader} = context
  const pg = getKysely()

  // VALIDATION
  const team = await dataLoader.get('teams').load(teamId)
  if (!team) return {error: {message: 'Team not found'}}
  const {orgId} = team
  const [mattermostProvider] = await dataLoader
    .get('sharedIntegrationProviders')
    .load({service: 'mattermost', orgIds: [orgId], teamIds: []})
  if (!mattermostProvider || mattermostProvider.authStrategy !== 'sharedSecret') {
    return {error: {message: 'Mattermost integration not found'}}
  }
  const {id: providerId} = mattermostProvider

  // TODO: we could verify the channel exists in Mattermost here

  // RESOLUTION
  const teamNotificationSettings = await pg
    .insertInto('TeamNotificationSettings')
    .columns(['providerId', 'teamId', 'events', 'channelId', 'webhookToken'])
    .values(() => ({
      providerId,
      teamId,
      events: sql`enum_range(NULL::"SlackNotificationEventEnum")`,
      channelId,
      webhookToken: webhookToken ?? null
    }))
    .onConflict((oc) =>
      oc.columns(['providerId', 'teamId', 'channelId']).doUpdateSet({
        events: (eb) => eb.ref('excluded.events'),
        // preserve existing token when mutation is called without a new one
        webhookToken: (eb) =>
          eb.fn.coalesce(
            eb.ref('excluded.webhookToken'),
            eb.ref('TeamNotificationSettings.webhookToken')
          )
      })
    )
    .returningAll()
    .executeTakeFirst()

  if (!teamNotificationSettings) {
    logError(new Error('Linking Mattermost Channel failed'), {
      tags: {teamId, channelId}
    })
    return {error: {message: 'Linking failed'}}
  }

  const settings = await dataLoader
    .get('teamNotificationSettingsByProviderIdAndTeamId')
    .load({providerId, teamId})
  const linkedChannels = settings.map(({channelId}) => channelId).filter(isNotNull)

  const data = {teamId, linkedChannels, teamNotificationSettings}
  return data
}

export default linkMattermostChannel
