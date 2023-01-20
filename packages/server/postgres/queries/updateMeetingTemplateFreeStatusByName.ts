import getRethink from '../../database/rethinkDriver'
import getPg from '../getPg'

const updateMeetingTemplateFreeStatusByName = async (templateNames: string[], isFree: boolean) => {
  const r = await getRethink()
  const now = new Date()
  const pg = getPg()
  const rPromise = r
    .table('MeetingTemplate')
    .getAll('aGhostTeam', {index: 'teamId'})
    .filter((row) => r.expr(templateNames).contains(row('name')))
    .update(
      {isFree, updatedAt: now},
      {returnChanges: true}
    )('changes')('new_val')('id')
    .default([])
    .run()

  try {
    await pg.query(
      `UPDATE "MeetingTemplate" SET "isFree" = $1 WHERE "teamId" = 'aGhostTeam' AND name LIKE ANY($2) RETURNING id;`,
      [isFree, templateNames]
    )
  } catch {}

  const updatedTemplateIds = await rPromise
  return updatedTemplateIds as string[]
}

export default updateMeetingTemplateFreeStatusByName
