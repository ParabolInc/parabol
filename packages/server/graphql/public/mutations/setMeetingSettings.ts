import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import {isNotNull} from 'parabol-client/utils/predicates'
import getRethink from '../../../database/rethinkDriver'
import {RValue} from '../../../database/stricterR'
import {analytics, MeetingSettings} from '../../../utils/analytics/analytics'
import {getUserId} from '../../../utils/authorization'
import publish from '../../../utils/publish'
import RecallAIServerManager from '../../../utils/RecallAIServerManager'
import standardError from '../../../utils/standardError'

const getBotId = async (videoMeetingURL?: string | null) => {
  if (!videoMeetingURL) return null
  const manager = new RecallAIServerManager()
  const botId = await manager.createBot(videoMeetingURL)
  return botId
}

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
  const {teamId, meetingType} = settings
  const team = await dataLoader.get('teams').loadNonNull(teamId)
  const organization = await dataLoader.get('organizations').load(team.orgId)
  const {featureFlags} = organization
  const hasTranscriptFlag = featureFlags?.includes('zoomTranscription')
  const recallBotId = hasTranscriptFlag ? await getBotId(videoMeetingURL) : null

  // RESOLUTION
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
      }

      if (isNotNull(disableAnonymity)) {
        updatedSettings.disableAnonymity = disableAnonymity
        meetingSettings.disableAnonymity = disableAnonymity
      }

      if (isNotNull(videoMeetingURL) && isNotNull(recallBotId)) {
        updatedSettings.videoMeetingURL = videoMeetingURL
        updatedSettings.recallBotId = recallBotId
        meetingSettings.videoMeetingURL = videoMeetingURL
        meetingSettings.recallBotId = recallBotId
      }

      return updatedSettings
    })
    .run()

  const data = {settingsId}
  analytics.meetingSettingsChanged(viewerId, teamId, meetingType, meetingSettings)
  publish(SubscriptionChannel.TEAM, teamId, 'SetMeetingSettingsPayload', data, subOptions)
  return data
}

export default setMeetingSettings
