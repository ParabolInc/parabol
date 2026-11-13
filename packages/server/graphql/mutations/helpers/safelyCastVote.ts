import {GraphQLError} from 'graphql'
import {sql} from 'kysely'
import toTeamMemberId from 'parabol-client/utils/relay/toTeamMemberId'
import getKysely from '../../../postgres/getKysely'

const safelyCastVote = async (meetingId: string, userId: string, reflectionGroupId: string) => {
  const meetingMemberId = toTeamMemberId(meetingId, userId)
  const pg = getKysely()
  await pg.transaction().execute(async (trx) => {
    // Lock the rows here in case updateRetroMaxVotes gets called, which could use stale values
    const [meetingMember, reflectionGroup] = await Promise.all([
      trx
        .selectFrom('MeetingMember')
        .select('id')
        .where('id', '=', meetingMemberId)
        .where('votesRemaining', '>', 0)
        .forUpdate()
        .executeTakeFirst(),
      trx
        .selectFrom('RetroReflectionGroup')
        .select('id')
        .where('id', '=', reflectionGroupId)
        .where('isActive', '=', true)
        .where(({eb, selectFrom}) =>
          eb(
            sql`COALESCE(array_length(array_positions("voterIds", ${userId}),1),0)`,
            '<',
            selectFrom('NewMeeting').select('maxVotesPerGroup').where('id', '=', meetingId)
          )
        )
        .forUpdate()
        .executeTakeFirst()
    ])
    if (!meetingMember)
      throw new GraphQLError('No votes remaining', {extensions: {code: 'CONFLICT'}})
    if (!reflectionGroup)
      throw new GraphQLError('Max votes per group reached', {extensions: {code: 'CONFLICT'}})
    await trx
      .with('MeetingMemberUpdate', (qb) =>
        qb
          .updateTable('MeetingMember')
          .set((eb) => ({votesRemaining: eb('votesRemaining', '-', 1)}))
          .where('id', '=', meetingMemberId)
      )
      .updateTable('RetroReflectionGroup')
      .set({voterIds: sql`ARRAY_APPEND("voterIds",${userId})`})
      .where('id', '=', reflectionGroupId)
      .executeTakeFirst()
  })
}

export default safelyCastVote
