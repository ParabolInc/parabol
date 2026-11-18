import {GraphQLError} from 'graphql'
import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import getKysely from '../../../postgres/getKysely'
import type {MeetingSettings} from '../../../postgres/types'
import publish from '../../../utils/publish'
import type {MutationResolvers} from '../resolverTypes'
import getNextMeetingSettings from './helpers/getNextMeetingSettings'

const setMeetingSettings: MutationResolvers['setMeetingSettings'] = async (
  _source,
  {settingsId, checkinEnabled, teamHealthEnabled, reviewPastTasksEnabled, disableAnonymity},
  {dataLoader, socketId: mutatorId}
) => {
  const operationId = dataLoader.share()
  const subOptions = {operationId, mutatorId}

  // AUTH
  const settings = (await dataLoader.get('meetingSettings').load(settingsId)) as MeetingSettings
  if (!settings) {
    throw new GraphQLError('Settings not found', {extensions: {code: 'NOT_FOUND'}})
  }

  // RESOLUTION
  const nextSettings = getNextMeetingSettings(settings, {
    checkinEnabled,
    teamHealthEnabled,
    reviewPastTasksEnabled,
    disableAnonymity
  })
  await getKysely()
    .updateTable('MeetingSettings')
    .set(nextSettings)
    .where('id', '=', settings.id)
    .execute()
  dataLoader.clearAll('meetingSettings')

  const data = {settingsId}
  publish(SubscriptionChannel.TEAM, settings.teamId, 'SetMeetingSettingsPayload', data, subOptions)
  return data
}

export default setMeetingSettings
