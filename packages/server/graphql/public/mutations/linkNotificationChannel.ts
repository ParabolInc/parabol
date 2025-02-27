import {sql} from 'kysely'
import IntegrationProviderId from '~/shared/gqlIds/IntegrationProviderId'
import getKysely from '../../../postgres/getKysely'
import {getUserId, isTeamMember} from '../../../utils/authorization'
import standardError from '../../../utils/standardError'
import {MutationResolvers} from '../resolverTypes'

const linkNotificationChannel: MutationResolvers['linkNotificationChannel'] = async (
  _source,
  {providerId, teamId, channelId},
  context
) => {
  const {authToken, dataLoader} = context
  const viewerId = getUserId(authToken)
  const pg = getKysely()

  //AUTH
  if (!isTeamMember(authToken, teamId)) {
    return standardError(new Error('Attempted teamId spoof'), {userId: viewerId})
  }

  // VALIDATION
  const providerDbId = IntegrationProviderId.split(providerId)
  const integrationProvider = await dataLoader.get('integrationProviders').load(providerDbId)

  if (!integrationProvider) {
    return standardError(
      new Error(`Unable to find appropriate integration provider for providerId ${providerId}`),
      {
        userId: viewerId
      }
    )
  }

  const {service} = integrationProvider
  if (service !== 'msTeams' && service !== 'mattermost') {
    return standardError(
      new Error(`Unsupported notification service`), {userId: viewerId, tags: {service}}
    )
  }

  // RESOLUTION
  await pg
    .insertInto('TeamNotificationSettings')
    .columns(['providerId', 'teamId', 'events', 'channelId'])
    .values(() => ({
      providerId: providerDbId,
      teamId,
      events: sql`enum_range(NULL::"SlackNotificationEventEnum")`,
      channelId
    }))
    .onConflict((oc) => oc.doNothing())
    .execute()

  const data = {userId: viewerId, teamId, service}
  return data
}

export default linkNotificationChannel
