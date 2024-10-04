import {sql} from 'kysely'
import toTeamMemberId from 'parabol-client/utils/relay/toTeamMemberId'
import getKysely from '../../../postgres/getKysely'

const safelyCastVote = async (
  meetingId: string,
  userId: string,
  reflectionGroupId: string,
  maxVotesPerGroup: number
) => {
  const meetingMemberId = toTeamMemberId(meetingId, userId)
  const pg = getKysely()

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

      if (!res) throw new Error('Max votes per group exceeded')
      if (!res.meetingMemberUpdate) throw new Error('No votes remaining')
    })
  } catch (e) {
    return {error: {message: (e as Error).message}}
  }
  return undefined
}

export default safelyCastVote
