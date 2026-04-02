import {sql} from 'kysely'
import {isNotNull} from '../../../../client/utils/predicates'
import getKysely from '../../../postgres/getKysely'
import logError from '../../../utils/logError'
import type {MutationResolvers} from '../resolverTypes'

const linkMattermostChannel: MutationResolvers['linkMattermostChannel'] = async (
  _source,
  {teamId, channelId},
  context
) => {
  const {dataLoader} = context
  const pg = getKysely()

  // VALIDATION
  const [mattermostProvider] = await dataLoader
    .get('sharedIntegrationProviders')
    .load({service: 'mattermost', orgIds: [], teamIds: []})
  if (!mattermostProvider || mattermostProvider.authStrategy !== 'sharedSecret') {
    return {error: {message: 'Mattermost integration not found'}}
  }
  const {id: providerId} = mattermostProvider

  // TODO: we could verify the channel exists in Mattermost here

  // RESOLUTION
  const teamNotificationSettings = await pg
    .insertInto('TeamNotificationSettings')
    .columns(['providerId', 'teamId', 'events', 'channelId'])
    .values(() => ({
      providerId,
      teamId,
      events: sql`enum_range(NULL::"SlackNotificationEventEnum")`,
      channelId
    }))
    .onConflict((oc) =>
      oc.columns(['providerId', 'teamId', 'channelId']).doUpdateSet({
        events: (eb) => eb.ref('excluded.events')
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
