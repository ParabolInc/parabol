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
  const [isVoteRemovedFromGroup, isVoteRemovedFromGroupPG] = await Promise.all([
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
        voterIds: sql`ARRAY_CAT("voterIds"[1:ARRAY_POS("voterIds",${userId})-1)],"voterIds"[ARRAY_POS("voterIds",${userId})+1:]`
      })
      .where('id', '=', reflectionGroupId)
      .where(sql`ANY("voterIds"`, '=', userId)
      .executeTakeFirst()
  ])
  console.log({
    isVoteRemovedFromGroup,
    isVoteRemovedFromGroupPG: isVoteRemovedFromGroupPG.numUpdatedRows
  })
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
