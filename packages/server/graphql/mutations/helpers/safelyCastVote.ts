import {sql} from 'kysely'
import toTeamMemberId from 'parabol-client/utils/relay/toTeamMemberId'
import getRethink from '../../../database/rethinkDriver'
import {RValue} from '../../../database/stricterR'
import AuthToken from '../../../database/types/AuthToken'
import getKysely from '../../../postgres/getKysely'
import {getUserId} from '../../../utils/authorization'
import standardError from '../../../utils/standardError'

const safelyCastVote = async (
  authToken: AuthToken,
  meetingId: string,
  userId: string,
  reflectionGroupId: string,
  maxVotesPerGroup: number
) => {
  const meetingMemberId = toTeamMemberId(meetingId, userId)
  const r = await getRethink()
  const pg = getKysely()
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

  // in a transaction add to the reflection group and the meeting member
  try {
    await pg.transaction().execute(async (trx) => {
      const res = await trx
        .with('MeetingMemberUpdate', (qb) =>
          qb
            .updateTable('MeetingMember')
            .set((eb) => ({votesRemaining: eb('votesRemaining', '-', 1)}))
            .where('id', '=', meetingMemberId)
            .returning('id')
        )
        .updateTable('RetroReflectionGroup')
        .set({voterIds: sql`ARRAY_APPEND("voterIds",${userId})`})
        .where('id', '=', reflectionGroupId)
        .where(
          sql`COALESCE(array_length(array_positions("voterIds", ${userId}),1),0)`,
          '<',
          maxVotesPerGroup
        )
        .returning((eb) => [
          'id',
          eb.selectFrom('MeetingMemberUpdate').select('id').as('meetingMemberUpdate')
        ])
        .executeTakeFirst()

      if (!res) {
        await r
          .table('MeetingMember')
          .get(meetingMemberId)
          .update((member: RValue) => ({
            votesRemaining: member('votesRemaining').add(1)
          }))
          .run()
        throw new Error('Max votes per group exceeded')
      }
      if (!res.meetingMemberUpdate) {
        // just for phase 2, make sure the row exists in the DB
        const hasMember = await trx
          .selectFrom('MeetingMember')
          .select('id')
          .where('id', '=', meetingMemberId)
          .executeTakeFirst()
        if (hasMember) throw new Error('No votes remaining')
      }
    })
  } catch (e) {
    return {error: {message: (e as Error).message}}
  }
  return undefined
}

export default safelyCastVote
