import getRethink from '../../database/rethinkDriver'
import getPg from '../getPg'

const updateMeetingTemplateFreeStatusById = async (templateIds: string[], isFree: boolean) => {
  const r = await getRethink()
  const now = new Date()
  const pg = getPg()
  const rPromise = r
    .table('MeetingTemplate')
    .getAll(r.args(templateIds))
    .update(
      {isFree, updatedAt: now},
      {returnChanges: true}
    )('changes')('new_val')('id')
    .default([])
    .run()

  try {
    await pg.query(`UPDATE "MeetingTemplate" SET "isFree" = $1 WHERE id in $2 RETURNING id;`, [
      isFree,
      templateIds
    ])
  } catch {}

  const updatedTemplateIds = await rPromise
  return updatedTemplateIds as string[]
}

export default updateMeetingTemplateFreeStatusById
