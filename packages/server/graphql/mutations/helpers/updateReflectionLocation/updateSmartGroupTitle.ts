import {sql} from 'kysely'
import getKysely from '../../../../postgres/getKysely'

const updateSmartGroupTitle = async (reflectionGroupId: string, smartTitle: string) => {
  const pg = getKysely()
  await pg
    .updateTable('RetroReflectionGroup')
    .set({
      smartTitle,
      title: sql`CASE WHEN "smartTitle" = "title" OR "title" IS NULL THEN ${smartTitle} ELSE "title" END`
    })
    .where('id', '=', reflectionGroupId)
    .execute()
}

export default updateSmartGroupTitle
