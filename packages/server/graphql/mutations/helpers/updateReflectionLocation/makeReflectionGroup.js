import getRethink from '../../../../database/rethinkDriver'
import * as shortid from 'shortid'

const makeReflectionGroup = async (meetingId, retroPhaseItemId, sortOrder) => {
  const r = getRethink()
  const now = new Date()
  // the reflection was dragged out on its own, create a new group
  const reflectionGroup = {
    id: shortid.generate(),
    createdAt: now,
    isActive: true,
    meetingId,
    retroPhaseItemId,
    sortOrder,
    updatedAt: now,
    voterIds: []
  }
  await r.table('RetroReflectionGroup').insert(reflectionGroup)
  return reflectionGroup
}

export default makeReflectionGroup
