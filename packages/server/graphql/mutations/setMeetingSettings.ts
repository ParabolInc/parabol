import {GraphQLBoolean, GraphQLID, GraphQLNonNull} from 'graphql'
import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import {isNotNull} from 'parabol-client/utils/predicates'
import getRethink from '../../database/rethinkDriver'
import {RValue} from '../../database/stricterR'
import {analytics, MeetingSettings} from '../../utils/analytics/analytics'
import {getUserId} from '../../utils/authorization'
import publish from '../../utils/publish'
import standardError from '../../utils/standardError'
import {GQLContext} from '../graphql'
import SetMeetingSettingsPayload from '../types/SetMeetingSettingsPayload'

const setMeetingSettings = {
  type: new GraphQLNonNull(SetMeetingSettingsPayload),
  description: 'Set default meeting settings',
  args: {
    settingsId: {
      type: new GraphQLNonNull(GraphQLID)
    },
    checkinEnabled: {
      type: GraphQLBoolean,
      description: 'true to turn icebreaker phase on, false to turn it off'
    },
    teamHealthEnabled: {
      type: GraphQLBoolean,
      description: 'true to turn team health phase on, false to turn it off'
    },
    disableAnonymity: {
      type: GraphQLBoolean,
      description: 'disables anonymity of reflections'
    }
  },
  resolve: async (
    _source: unknown,
    {
      settingsId,
      checkinEnabled,
      teamHealthEnabled,
      disableAnonymity
    }: {
      settingsId: string
      checkinEnabled?: boolean
      teamHealthEnabled: boolean
      disableAnonymity?: boolean
    },
    {authToken, dataLoader, socketId: mutatorId}: GQLContext
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

    const meetingSettings = {} as MeetingSettings
    // RESOLUTION
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

        return updatedSettings
      })
      .run()

    const data = {settingsId}
    analytics.meetingSettingsChanged(viewerId, teamId, meetingType, meetingSettings)
    publish(SubscriptionChannel.TEAM, teamId, 'SetMeetingSettingsPayload', data, subOptions)
    return data
  }
}

export default setMeetingSettings
