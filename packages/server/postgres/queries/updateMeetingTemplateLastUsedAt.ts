import {sql} from 'kysely'
import getKysely from '../getKysely'

const updateMeetingTemplateLastUsedAt = async (templateId: string, teamId: string) => {
  const pg = getKysely()

  await Promise.all([
    pg
      .updateTable('MeetingTemplate')
      .set({lastUsedAt: sql`CURRENT_TIMESTAMP`})
      .where('id', '=', templateId)
      .execute(),
    pg
      .insertInto('TeamMeetingTemplate')
      .values({teamId, templateId, lastUsedAt: sql`CURRENT_TIMESTAMP`})
      .onConflict((oc) =>
        oc.columns(['teamId', 'templateId']).doUpdateSet({lastUsedAt: sql`CURRENT_TIMESTAMP`})
      )
      .execute()
  ])
}

export default updateMeetingTemplateLastUsedAt
