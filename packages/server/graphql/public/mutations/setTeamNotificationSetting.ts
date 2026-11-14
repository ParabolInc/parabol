import {GraphQLError} from 'graphql'
import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import TeamNotificationSettingsId from '../../../../client/shared/gqlIds/TeamNotificationSettingsId'
import getKysely from '../../../postgres/getKysely'
import {isTeamMember} from '../../../utils/authorization'
import publish from '../../../utils/publish'
import type {MutationResolvers} from '../resolverTypes'

const setTeamNotificationSetting: MutationResolvers['setTeamNotificationSetting'] = async (
  _source,
  {id: gqlId, event, isEnabled},
  context
) => {
  const {authToken, dataLoader, socketId: mutatorId} = context
  const operationId = dataLoader.share()
  const subOptions = {mutatorId, operationId}
  const pg = getKysely()
  const id = TeamNotificationSettingsId.split(gqlId)

  // AUTH
  const setting = await dataLoader.get('teamNotificationSettings').load(id)
  if (!setting) {
    throw new GraphQLError('TeamNotificationSetting not found', {extensions: {code: 'NOT_FOUND'}})
  }
  const {teamId} = setting
  if (!isTeamMember(authToken, teamId)) {
    throw new GraphQLError('Attempted teamId spoof', {extensions: {code: 'FORBIDDEN'}})
  }
  if (context.resourceGrants && !(await context.resourceGrants.hasTeam(teamId))) {
    throw new GraphQLError('PAT does not grant access to this team', {
      extensions: {code: 'FORBIDDEN'}
    })
  }

  // RESOLUTION
  if (isEnabled) {
    await pg
      .updateTable('TeamNotificationSettings')
      .set(({fn, val}) => ({
        events: fn('arr_append_uniq', ['events', val(event)])
      }))
      .where('id', '=', id)
      .execute()
  } else {
    await pg
      .updateTable('TeamNotificationSettings')
      .set(({fn, val}) => ({
        events: fn('array_remove', ['events', val(event)])
      }))
      .where('id', '=', id)
      .execute()
  }
  // update dataLoader
  setting.events = isEnabled
    ? [...setting.events, event]
    : setting.events.filter((e: any) => e !== event)

  const data = {id}
  publish(SubscriptionChannel.TEAM, teamId, 'SetTeamNotificationSettingSuccess', data, subOptions)
  return data
}

export default setTeamNotificationSetting
