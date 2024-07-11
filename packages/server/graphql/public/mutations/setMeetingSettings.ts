import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import {isNotNull} from 'parabol-client/utils/predicates'
import getRethink from '../../../database/rethinkDriver'
import {RValue} from '../../../database/stricterR'
import {analytics, MeetingSettings} from '../../../utils/analytics/analytics'
import {getUserId} from '../../../utils/authorization'
import publish from '../../../utils/publish'
import standardError from '../../../utils/standardError'
import {MutationResolvers} from '../resolverTypes'

const setMeetingSettings: MutationResolvers['setMeetingSettings'] = async (
  _source,
  {settingsId, checkinEnabled, teamHealthEnabled, disableAnonymity, videoMeetingURL},
  {authToken, dataLoader, socketId: mutatorId}
) => {
  const r = await getRethink()
  const operationId = dataLoader.share()
  const subOptions = {operationId, mutatorId}

  // AUTH
  const viewerId = getUserId(authToken)
  const settings = await r.table('MeetingSettings').get(settingsId).run()
  if (!settings) {
    return standardError(new Error('Settings not found'), {userId: viewerId})
  }

  // RESOLUTION
  const {teamId, meetingType} = settings
  const [team, viewer] = await Promise.all([
    dataLoader.get('teams').loadNonNull(teamId),
    dataLoader.get('users').loadNonNull(viewerId)
  ])
  const organization = await dataLoader.get('organizations').loadNonNull(team.orgId)
  const {featureFlags} = organization
  const hasTranscriptFlag = featureFlags?.includes('zoomTranscription')

  const meetingSettings = {} as MeetingSettings
  await r
    .table('MeetingSettings')
    .get(settingsId)
    .update((row: RValue) => {
      const updatedSettings: {[key: string]: any} = {}
      if (isNotNull(checkinEnabled)) {
        updatedSettings.phaseTypes = r.branch(
          row('phaseTypes').contains('checkin'),
          checkinEnabled ? row('phaseTypes') : row('phaseTypes').difference(['checkin']),
          checkinEnabled ? row('phaseTypes').prepend('checkin') : row('phaseTypes')
        )
        meetingSettings.hasIcebreaker = checkinEnabled
      }

      if (isNotNull(teamHealthEnabled)) {
        updatedSettings.phaseTypes = r.branch(
          row('phaseTypes').contains('TEAM_HEALTH'),
          teamHealthEnabled ? row('phaseTypes') : row('phaseTypes').difference(['TEAM_HEALTH']),
          row('phaseTypes').contains('checkin'),
          teamHealthEnabled ? row('phaseTypes').insertAt(1, 'TEAM_HEALTH') : row('phaseTypes'),
          teamHealthEnabled ? row('phaseTypes').prepend('TEAM_HEALTH') : row('phaseTypes')
        )
        meetingSettings.hasTeamHealth = teamHealthEnabled
      }

      if (isNotNull(disableAnonymity)) {
        updatedSettings.disableAnonymity = disableAnonymity
        meetingSettings.disableAnonymity = disableAnonymity
      }

      if (hasTranscriptFlag) {
        updatedSettings.videoMeetingURL = videoMeetingURL
        meetingSettings.videoMeetingURL = videoMeetingURL
      }

      return updatedSettings
    })
    .run()

  const data = {settingsId}
  analytics.meetingSettingsChanged(viewer, teamId, meetingType, meetingSettings)
  publish(SubscriptionChannel.TEAM, teamId, 'SetMeetingSettingsPayload', data, subOptions)
  return data
}

export default setMeetingSettings
