import toTeamMemberId from 'parabol-client/utils/relay/toTeamMemberId'
import getRethink from '../../../database/rethinkDriver'
import standardError from '../../../utils/standardError'
import {getUserId} from '../../../utils/authorization'
import AuthToken from '../../../database/types/AuthToken'
import {RValue} from '../../../database/stricterR'

const safelyCastVote = async (
  authToken: AuthToken,
  meetingId: string,
  userId: string,
  reflectionGroupId: string,
  maxVotesPerGroup: number
) => {
  const meetingMemberId = toTeamMemberId(meetingId, userId)
  const r = await getRethink()
  const now = new Date()
  const viewerId = getUserId(authToken)
  const isVoteRemovedFromUser = await r
    .table('MeetingMember')
    .get(meetingMemberId)
    .update((member: RValue) => {
      // go atomic. no cheating allowed
      return r.branch(
        member('votesRemaining').ge(1),
        {
          updatedAt: now,
          votesRemaining: member('votesRemaining').sub(1)
        },
        {}
      )
    })('replaced')
    .eq(1)
    .run()
  if (!isVoteRemovedFromUser) {
    return standardError(new Error('No votes remaining'), {userId: viewerId})
  }
  const isVoteAddedToGroup = await r
    .table('RetroReflectionGroup')
    .get(reflectionGroupId)
    .update((group: RValue) => {
      return r.branch(
        group('voterIds').count(userId).lt(maxVotesPerGroup),
        {
          updatedAt: now,
          voterIds: group('voterIds').append(userId)
        },
        {}
      )
    })('replaced')
    .eq(1)
    .run()
  if (!isVoteAddedToGroup) {
    await r
      .table('MeetingMember')
      .get(meetingMemberId)
      .update((member: RValue) => ({
        votesRemaining: member('votesRemaining').add(1)
      }))
      .run()
    return standardError(new Error('Max votes per group exceeded'), {userId: viewerId})
  }
  return undefined
}

export default safelyCastVote
