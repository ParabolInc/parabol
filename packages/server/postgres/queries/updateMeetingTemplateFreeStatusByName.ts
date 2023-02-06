import getRethink from '../../database/rethinkDriver'
import getPg from '../getPg'

const updateMeetingTemplateFreeStatusByName = async (templateNames: string[], isFree: boolean) => {
  const r = await getRethink()
  const now = new Date()
  const pg = getPg()
  const [rRes] = await Promise.allSettled([
    r
      .table('MeetingTemplate')
      .getAll('aGhostTeam', {index: 'teamId'})
      .filter((row) => r.expr(templateNames).contains(row('name')))
      .update(
        {isFree, updatedAt: now},
        {returnChanges: true}
      )('changes')('new_val')('id')
      .default([])
      .run(),
    pg.query(
      `UPDATE "MeetingTemplate" SET "isFree" = $1 WHERE "teamId" = 'aGhostTeam' AND name LIKE ANY($2) RETURNING id;`,
      [isFree, templateNames]
    )
  ])
  if (rRes.status === 'rejected') throw rRes.reason
  return rRes.value as string[]
}

export default updateMeetingTemplateFreeStatusByName
