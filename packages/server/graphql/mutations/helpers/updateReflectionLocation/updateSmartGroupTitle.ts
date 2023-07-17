import {sql} from 'kysely'
import getRethink from '../../../../database/rethinkDriver'
import {RValue} from '../../../../database/stricterR'
import getKysely from '../../../../postgres/getKysely'

const updateSmartGroupTitle = async (reflectionGroupId: string, smartTitle: string) => {
  const r = await getRethink()
  const pg = getKysely()
  const now = new Date()
  await Promise.all([
    pg
      .updateTable('RetroReflectionGroup')
      .set({
        smartTitle,
        title: sql`CASE WHEN "smartTitle" = "title" THEN ${smartTitle} ELSE "title" END`
      })
      .where('id', '=', reflectionGroupId)
      .execute(),
    r
      .table('RetroReflectionGroup')
      .get(reflectionGroupId)
      .update((g: RValue) => ({
        smartTitle,
        title: r.branch(g('smartTitle').eq(g('title')), smartTitle, g('title')),
        updatedAt: now
      }))
      .run()
  ])
}

export default updateSmartGroupTitle
