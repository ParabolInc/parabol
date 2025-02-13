import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import TeamMemberIntegrationAuthId from '../../../../client/shared/gqlIds/TeamMemberIntegrationAuthId'
import getKysely from '../../../postgres/getKysely'
import {getUserId, isTeamMember} from '../../../utils/authorization'
import publish from '../../../utils/publish'
import standardError from '../../../utils/standardError'
import {MutationResolvers} from '../resolverTypes'

const setNotificationSetting: MutationResolvers['setNotificationSetting'] = async (
  _source,
  {authId: gqlAuthId, event, isEnabled},
  {authToken, dataLoader, socketId: mutatorId}
) => {
  const viewerId = getUserId(authToken)
  const operationId = dataLoader.share()
  const subOptions = {mutatorId, operationId}
  const pg = getKysely()

  // AUTH
  const authId = TeamMemberIntegrationAuthId.split(gqlAuthId)
  const auth = await dataLoader.get('teamMemberIntegrationAuths').load(authId)
  if (!auth) {
    return standardError(new Error('Integration auth not found'), {userId: viewerId})
  }
  const {teamId, service} = auth
  if (!isTeamMember(authToken, teamId)) {
    return standardError(new Error('Attempted teamId spoof'), {userId: viewerId})
  }

  // VALIDATION
  if (service !== 'mattermost' && service !== 'msTeams') {
    return standardError(new Error('Invalid integration provider'), {userId: viewerId})
  }

  // RESOLUTION
  if (isEnabled) {
    await pg
      .insertInto('NotificationSettings')
      .values({authId, event})
      .onConflict((oc) => oc.doNothing())
      .execute()
  } else {
    await pg
      .deleteFrom('NotificationSettings')
      .where('authId', '=', authId)
      .where('event', '=', event)
      .execute()
  }
  const data = {authId}
  publish(SubscriptionChannel.TEAM, teamId, 'SetNotificationSettingSuccess', data, subOptions)
  return data
}

export default setNotificationSetting
