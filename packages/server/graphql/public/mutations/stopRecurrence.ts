import MeetingSeriesId from '../../../../client/shared/gqlIds/MeetingSeriesId'
import getRethink from '../../../database/rethinkDriver'
import updateMeetingSeries from '../../../postgres/queries/updateMeetingSeries'
import {analytics} from '../../../utils/analytics/analytics'
import {getUserId, isTeamMember} from '../../../utils/authorization'
import standardError from '../../../utils/standardError'
import {MutationResolvers} from '../resolverTypes'

const stopRecurrence: MutationResolvers['stopRecurrence'] = async (
  _source,
  {meetingSeriesId},
  {authToken, dataLoader}
) => {
  const r = await getRethink()
  const viewerId = getUserId(authToken)
  const now = new Date()

  // VALIDATION
  const id = MeetingSeriesId.split(meetingSeriesId)
  const meetingSeries = await dataLoader.get('meetingSeries').load(id)
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

  await updateMeetingSeries({cancelledAt: now}, id)
  dataLoader.get('meetingSeries').clear(id)
  analytics.recurrenceStopped(viewerId, meetingSeries)

  const updatedMeeting = await r
    .table('NewMeeting')
    .getAll(id, {index: 'meetingSeriesId'})
    .filter({endedAt: null}, {default: true})
    .update(
      {
        scheduledEndTime: null
      },
      {returnChanges: true}
    )('changes')(0)('new_val')
    .run()

  // RESOLUTION
  const data = {meetingId: updatedMeeting.id}
  return data
}

export default stopRecurrence
