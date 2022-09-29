import toTeamMemberId from 'parabol-client/utils/relay/toTeamMemberId'
import getRethink from '../../../database/rethinkDriver'
import {RValue} from '../../../database/stricterR'
import AuthToken from '../../../database/types/AuthToken'
import {getUserId} from '../../../utils/authorization'
import standardError from '../../../utils/standardError'

const safelyWithdrawVote = async (
  authToken: AuthToken,
  meetingId: string,
  userId: string,
  reflectionGroupId: string
) => {
  const meetingMemberId = toTeamMemberId(meetingId, userId)
  const r = await getRethink()
  const now = new Date()
  const viewerId = getUserId(authToken)
  const isVoteRemovedFromGroup = await r
    .table('RetroReflectionGroup')
    .get(reflectionGroupId)
    .update((group: RValue) => {
      return r.branch(
        group('voterIds').offsetsOf(userId).count().ge(1),
        {
          updatedAt: now,
          voterIds: group('voterIds').deleteAt(group('voterIds').offsetsOf(userId).nth(0))
        },
        {}
      )
    })('replaced')
    .eq(1)
    .run()
  if (!isVoteRemovedFromGroup) {
    return standardError(new Error('Already removed vote'), {userId: viewerId})
  }
  await r
    .table('MeetingMember')
    .get(meetingMemberId)
    .update((member: RValue) => ({
      updatedAt: now,
      votesRemaining: member('votesRemaining').add(1)
    }))
    .run()
  return undefined
}

export default safelyWithdrawVote
