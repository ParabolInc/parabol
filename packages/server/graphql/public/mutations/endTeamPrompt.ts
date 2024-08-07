import getRethink from '../../../database/rethinkDriver'
import MeetingTeamPrompt from '../../../database/types/MeetingTeamPrompt'
import {getUserId, isTeamMember} from '../../../utils/authorization'
import standardError from '../../../utils/standardError'
import safeEndTeamPrompt from '../../mutations/helpers/safeEndTeamPrompt'
import {MutationResolvers} from '../resolverTypes'

const endTeamPrompt: MutationResolvers['endTeamPrompt'] = async (_source, {meetingId}, context) => {
  const {authToken, dataLoader, socketId: mutatorId} = context
  const r = await getRethink()
  const viewerId = getUserId(authToken)
  const now = new Date()
  const operationId = dataLoader.share()
  const subOptions = {mutatorId, operationId}

  // AUTH
  const meeting = (await dataLoader.get('newMeetings').load(meetingId)) as MeetingTeamPrompt | null
  if (!meeting) return standardError(new Error('Meeting not found'), {userId: viewerId})
  const {teamId} = meeting

  // VALIDATION
  if (!isTeamMember(authToken, teamId) && authToken.rol !== 'su') {
    return standardError(new Error('Team not found'), {userId: viewerId})
  }
  return safeEndTeamPrompt({meeting, now, r, context, subOptions, viewerId})
}

export default endTeamPrompt
