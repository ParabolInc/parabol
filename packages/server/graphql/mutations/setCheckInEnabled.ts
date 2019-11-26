import {GraphQLBoolean, GraphQLID, GraphQLNonNull} from 'graphql'
import getRethink from '../../database/rethinkDriver'
import {getUserId} from '../../utils/authorization'
import SetCheckInEnabledPayload from '../types/SetCheckInEnabledPayload'
import standardError from '../../utils/standardError'
import {NewMeetingPhaseTypeEnum} from 'parabol-client/types/graphql'
import publish from '../../utils/publish'
import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import MeetingSettings from '../../database/types/MeetingSettings'

const setCheckInEnabled = {
  type: SetCheckInEnabledPayload,
  description: 'Enabled or disable the check-in round',
  args: {
    settingsId: {
      type: new GraphQLNonNull(GraphQLID)
    },
    isEnabled: {
      type: new GraphQLNonNull(GraphQLBoolean),
      description: 'true to turn check-in phase on, false to turn it off'
    }
  },
  resolve: async (
    _source,
    {settingsId, isEnabled},
    {authToken, dataLoader, socketId: mutatorId}
  ) => {
    const r = await getRethink()
    const operationId = dataLoader.share()
    const subOptions = {operationId, mutatorId}

    // AUTH
    const viewerId = getUserId(authToken)
    const settings = await r
      .table('MeetingSettings')
      .get(settingsId)
      .run()
    if (!settings) {
      return standardError(new Error('Settings not found'), {userId: viewerId})
    }
    const {teamId} = settings
    // RESOLUTION
    await r
      .table<MeetingSettings>('MeetingSettings')
      .get(settingsId)
      .update((row) => ({
        phaseTypes: r.branch(
          row('phaseTypes').contains(NewMeetingPhaseTypeEnum.checkin),
          isEnabled
            ? row('phaseTypes')
            : row('phaseTypes').without(NewMeetingPhaseTypeEnum.checkin),
          isEnabled ? row('phaseTypes').prepend(NewMeetingPhaseTypeEnum.checkin) : row('phaseTypes')
        )
      }))
      .run()

    const data = {settingsId}
    publish(SubscriptionChannel.TEAM, teamId, 'SetCheckInEnabledPayload', data, subOptions)
    return data
  }
}

export default setCheckInEnabled
