import {sql} from 'kysely'
import getKysely from '../../../../postgres/getKysely'

// Summaries inherit the Meeting Summaries page's access, so leaving the team removes your direct access to it.
// The page belongs to the team, so an owner who leaves hands it to the team lead
export const removeMeetingTOCAccess = async (
  teamId: string,
  userId: string,
  teamLeadId: string
) => {
  const pg = getKysely()
  const team = await pg
    .selectFrom('Team')
    .select('meetingTOCpageId')
    .where('id', '=', teamId)
    .executeTakeFirst()
  const pageId = team?.meetingTOCpageId
  if (!pageId) return
  await pg.transaction().execute(async (trx) => {
    const removedAccess = await trx
      .deleteFrom('PageUserAccess')
      .where('pageId', '=', pageId)
      .where('userId', '=', userId)
      .returning('role')
      .executeTakeFirst()
    if (!removedAccess) return
    if (removedAccess.role === 'owner') {
      await trx
        .insertInto('PageUserAccess')
        .values({pageId, userId: teamLeadId, role: 'owner'})
        .onConflict((oc) => oc.columns(['pageId', 'userId']).doUpdateSet({role: 'owner'}))
        .execute()
    }
    await sql`SELECT "updatePageAccess"(${[userId, teamLeadId]}::VARCHAR[], ${[pageId]}::INT[])`.execute(
      trx
    )
  })
}
