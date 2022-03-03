import getRethink from '../../../../database/rethinkDriver'
import {RValue} from '../../../../database/stricterR'

const updateSmartGroupTitle = async (reflectionGroupId: string, smartTitle: string) => {
  const r = await getRethink()
  const now = new Date()
  return r
    .table('RetroReflectionGroup')
    .get(reflectionGroupId)
    .update((g: RValue) => ({
      smartTitle,
      title: r.branch(g('smartTitle').eq(g('title')), smartTitle, g('title')),
      updatedAt: now
    }))
    .run()
}

export default updateSmartGroupTitle
