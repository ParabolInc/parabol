import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import MeetingSeriesId from '../../../../client/shared/gqlIds/MeetingSeriesId'
import getRethink from '../../../database/rethinkDriver'
import updateMeetingSeries from '../../../postgres/queries/updateMeetingSeries'
import {analytics} from '../../../utils/analytics/analytics'
import {getUserId, isTeamMember} from '../../../utils/authorization'
import publish from '../../../utils/publish'
import standardError from '../../../utils/standardError'
import {MutationResolvers} from '../resolverTypes'

const stopRecurrence: MutationResolvers['stopRecurrence'] = async (
  _source,
  {meetingSeriesId},
  {authToken, dataLoader, socketId: mutatorId}
) => {
  const r = await getRethink()
  const viewerId = getUserId(authToken)
  const operationId = dataLoader.share()
  const subOptions = {mutatorId, operationId}
  const now = new Date()

  // VALIDATION
  const meetingSeriesDbId = MeetingSeriesId.split(meetingSeriesId)
  const meetingSeries = await dataLoader.get('meetingSeries').load(meetingSeriesDbId)
  if (!meetingSeries) {
    return standardError(new Error('Meeting Series not found'), {userId: viewerId})
  }

  const {teamId, meetingType} = meetingSeries
  if (!isTeamMember(authToken, teamId)) {
    return standardError(new Error('Team not found'), {userId: viewerId})
  }

  if (meetingType !== 'teamPrompt') {
    return standardError(new Error('Meeting is not a team prompt meeting'), {userId: viewerId})
  }

  await updateMeetingSeries({cancelledAt: now}, meetingSeriesDbId)
  dataLoader.get('meetingSeries').clear(meetingSeriesDbId)
  analytics.recurrenceStopped(viewerId, meetingSeries)

  await r
    .table('NewMeeting')
    .getAll(meetingSeriesDbId, {index: 'meetingSeriesId'})
    .filter({endedAt: null}, {default: true})
    .update({
      scheduledEndTime: null
    })
    .run()

  // RESOLUTION
  const data = {meetingSeriesId: meetingSeriesDbId}
  publish(SubscriptionChannel.TEAM, teamId, 'StopRecurrenceSuccess', data, subOptions)
  return data
}

export default stopRecurrence
