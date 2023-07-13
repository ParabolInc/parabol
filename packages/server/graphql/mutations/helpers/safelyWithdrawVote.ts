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
  const [isVoteRemovedFromGroup, voteRemovedResult] = await Promise.all([
    r
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
      .run(),
    pg
      .updateTable('RetroReflectionGroup')
      .set({
        voterIds: sql`array_cat(
          "voterIds"[1:array_position("voterIds",'google-oauth2|ohlApAJnXy')-1],
          "voterIds"[array_position("voterIds",'google-oauth2|ohlApAJnXy')+1:]
        )`
      })
      .where('id', '=', reflectionGroupId)
      .where(sql`${userId}`, '=', sql`ANY("voterIds")`)
      .executeTakeFirst()
  ])
  const isVoteRemovedFromGroupPG = voteRemovedResult.numUpdatedRows === BigInt(1)
  if (isVoteRemovedFromGroup !== isVoteRemovedFromGroupPG)
    console.log('MISMATCH VOTE REMOVED LOGIC')
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
