import {getUserId, isTeamMember} from '../../../utils/authorization'
import standardError from '../../../utils/standardError'
import safeEndRetrospective from '../../mutations/helpers/safeEndRetrospective'
import type {MutationResolvers} from '../resolverTypes'

const endRetrospective: MutationResolvers['endRetrospective'] = async (
  _source,
  {meetingId},
  context
) => {
  const {authToken, dataLoader} = context
  const now = new Date()
  const viewerId = getUserId(authToken)

  // AUTH
  const meeting = await dataLoader.get('newMeetings').load(meetingId)
  if (!meeting) return standardError(new Error('Meeting not found'), {userId: viewerId})
  if (meeting.meetingType !== 'retrospective') {
    return standardError(new Error('Meeting not found'), {userId: viewerId})
  }
  const {endedAt, teamId} = meeting

  // VALIDATION
  if (!isTeamMember(authToken, teamId) && authToken.rol !== 'su') {
    return standardError(new Error('Team not found'), {userId: viewerId})
  }
  if (endedAt)
    return standardError(new Error('Meeting already ended'), {
      userId: viewerId
    })

  // RESOLUTION
  const res = await safeEndRetrospective({meeting, now, context})
  return res
}

export default endRetrospective
