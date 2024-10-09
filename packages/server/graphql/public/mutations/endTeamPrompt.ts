import {getUserId, isTeamMember} from '../../../utils/authorization'
import standardError from '../../../utils/standardError'
import safeEndTeamPrompt from '../../mutations/helpers/safeEndTeamPrompt'
import {MutationResolvers} from '../resolverTypes'

const endTeamPrompt: MutationResolvers['endTeamPrompt'] = async (_source, {meetingId}, context) => {
  const {authToken, dataLoader, socketId: mutatorId} = context
  const viewerId = getUserId(authToken)
  const operationId = dataLoader.share()
  const subOptions = {mutatorId, operationId}

  // AUTH
  const meeting = await dataLoader.get('newMeetings').load(meetingId)
  if (!meeting) return standardError(new Error('Meeting not found'), {userId: viewerId})
  if (meeting.meetingType !== 'teamPrompt') {
    return {error: {message: 'Meeting type is not teamPrompt'}}
  }
  const {teamId} = meeting

  // VALIDATION
  if (!isTeamMember(authToken, teamId) && authToken.rol !== 'su') {
    return standardError(new Error('Team not found'), {userId: viewerId})
  }
  return safeEndTeamPrompt({meeting, context, subOptions, viewerId})
}

export default endTeamPrompt
