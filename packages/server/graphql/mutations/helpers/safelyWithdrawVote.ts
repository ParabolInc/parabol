import {sql} from 'kysely'
import toTeamMemberId from 'parabol-client/utils/relay/toTeamMemberId'
import getKysely from '../../../postgres/getKysely'

const safelyWithdrawVote = async (meetingId: string, userId: string, reflectionGroupId: string) => {
  const meetingMemberId = toTeamMemberId(meetingId, userId)
  const pg = getKysely()
  try {
    await pg.transaction().execute(async (trx) => {
      // Lock the rows here in case updateRetroMaxVotes gets called, which could use stale values
      const [meetingMember, reflectionGroup] = await Promise.all([
        trx
          .selectFrom('MeetingMember')
          .select('id')
          .where('id', '=', meetingMemberId)
          .where(({eb, selectFrom}) =>
            eb(
              'votesRemaining',
              '<',
              selectFrom('NewMeeting').select('totalVotes').where('id', '=', meetingId)
            )
          )
          .forUpdate()
          .executeTakeFirst(),
        trx
          .selectFrom('RetroReflectionGroup')
          .select('id')
          .where('id', '=', reflectionGroupId)
          .where('isActive', '=', true)
          .where(sql`${userId}`, '=', sql`ANY("voterIds")`)
          .forUpdate()
          .executeTakeFirst()
      ])
      if (!meetingMember) throw new Error('Vote already withdrawn')
      if (!reflectionGroup) throw new Error('Group vote already withdrawn')
      await trx
        .with('MeetingMemberUpdate', (qb) =>
          qb
            .updateTable('MeetingMember')
            .set((eb) => ({votesRemaining: eb('votesRemaining', '+', 1)}))
            .where('id', '=', meetingMemberId)
        )
        .updateTable('RetroReflectionGroup')
        .set({
          voterIds: sql`array_cat(
          "voterIds"[1:array_position("voterIds",${userId})-1],
          "voterIds"[array_position("voterIds",${userId})+1:]
        )`
        })
        .where('id', '=', reflectionGroupId)
        .execute()
    })
  } catch (e) {
    return {error: {message: (e as Error).message}}
  }
  return undefined
}

export default safelyWithdrawVote
