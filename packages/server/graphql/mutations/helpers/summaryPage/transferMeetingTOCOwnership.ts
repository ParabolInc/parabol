import getKysely from '../../../../postgres/getKysely'
import {updatePageAccessTable} from '../../../../postgres/updatePageAccessTable'

// The Meeting Summaries page belongs to the team, so an owner who leaves hands it to the team lead
export const transferMeetingTOCOwnership = async (
  teamId: string,
  fromUserId: string,
  toUserId: string
) => {
  if (fromUserId === toUserId) return
  const pg = getKysely()
  const team = await pg
    .selectFrom('Team')
    .select('meetingTOCpageId')
    .where('id', '=', teamId)
    .executeTakeFirst()
  const pageId = team?.meetingTOCpageId
  if (!pageId) return
  await pg.transaction().execute(async (trx) => {
    const {numDeletedRows} = await trx
      .deleteFrom('PageUserAccess')
      .where('pageId', '=', pageId)
      .where('userId', '=', fromUserId)
      .where('role', '=', 'owner')
      .executeTakeFirst()
    if (numDeletedRows === 0n) return
    await trx
      .insertInto('PageUserAccess')
      .values({pageId, userId: toUserId, role: 'owner'})
      .onConflict((oc) => oc.columns(['pageId', 'userId']).doUpdateSet({role: 'owner'}))
      .execute()
    await updatePageAccessTable(trx, pageId)
  })
}
