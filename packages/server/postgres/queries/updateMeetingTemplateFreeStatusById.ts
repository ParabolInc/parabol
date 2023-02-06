import getRethink from '../../database/rethinkDriver'
import getPg from '../getPg'

const updateMeetingTemplateFreeStatusById = async (templateIds: string[], isFree: boolean) => {
  const r = await getRethink()
  const now = new Date()
  const pg = getPg()
  const [rRes] = await Promise.allSettled([
    r
      .table('MeetingTemplate')
      .getAll(r.args(templateIds))
      .update(
        {isFree, updatedAt: now},
        {returnChanges: true}
      )('changes')('new_val')('id')
      .default([])
      .run(),
    pg.query(`UPDATE "MeetingTemplate" SET "isFree" = $1 WHERE id in $2 RETURNING id;`, [
      isFree,
      templateIds
    ])
  ])
  if (rRes.status === 'rejected') throw rRes.reason
  return rRes.value as string[]
}

export default updateMeetingTemplateFreeStatusById
