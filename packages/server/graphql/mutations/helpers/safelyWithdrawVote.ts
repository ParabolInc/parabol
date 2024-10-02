import {sql} from 'kysely'
import toTeamMemberId from 'parabol-client/utils/relay/toTeamMemberId'
import getRethink from '../../../database/rethinkDriver'
import {RValue} from '../../../database/stricterR'
import AuthToken from '../../../database/types/AuthToken'
import getKysely from '../../../postgres/getKysely'
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
  const pg = getKysely()
  const now = new Date()
  const viewerId = getUserId(authToken)
  const voteRemovedResult = await pg
    .updateTable('RetroReflectionGroup')
    .set({
      voterIds: sql`array_cat(
          "voterIds"[1:array_position("voterIds",${userId})-1],
          "voterIds"[array_position("voterIds",${userId})+1:]
        )`
    })
    .where('id', '=', reflectionGroupId)
    .where(sql`${userId}`, '=', sql`ANY("voterIds")`)
    .executeTakeFirst()
  const isVoteRemovedFromGroup = voteRemovedResult.numUpdatedRows === BigInt(1)
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
  await pg
    .updateTable('MeetingMember')
    .set((eb) => ({votesRemaining: eb('votesRemaining', '+', 1)}))
    .where('id', '=', meetingMemberId)
    .execute()
  return undefined
}

export default safelyWithdrawVote
