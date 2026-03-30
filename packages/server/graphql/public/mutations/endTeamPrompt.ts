import {getUserId, isTeamMemberAsync} from '../../../utils/authorization'
import standardError from '../../../utils/standardError'
import safeEndTeamPrompt from '../../mutations/helpers/safeEndTeamPrompt'
import type {MutationResolvers} from '../resolverTypes'

const endTeamPrompt: MutationResolvers['endTeamPrompt'] = async (
  _source,
  {meetingId},
  context,
  info
) => {
  const {authToken, dataLoader} = context
  const viewerId = getUserId(authToken)

  // AUTH
  const meeting = await dataLoader.get('newMeetings').load(meetingId)
  if (!meeting) return standardError(new Error('Meeting not found'), {userId: viewerId})
  if (meeting.meetingType !== 'teamPrompt') {
    return {error: {message: 'Meeting type is not teamPrompt'}}
  }
  const {teamId} = meeting

  // VALIDATION
  if (!(await isTeamMemberAsync(viewerId, teamId, dataLoader)) && authToken.rol !== 'su') {
    return standardError(new Error('Team not found'), {userId: viewerId})
  }
  return safeEndTeamPrompt({meeting, context, info})
}

export default endTeamPrompt
