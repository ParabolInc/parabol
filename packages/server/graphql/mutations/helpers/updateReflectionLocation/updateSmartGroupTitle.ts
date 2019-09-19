import getRethink from '../../../../database/rethinkDriver'

const updateSmartGroupTitle = (reflectionGroupId: string, smartTitle: string) => {
  const r = getRethink()
  const now = new Date()
  return r
    .table('RetroReflectionGroup')
    .get(reflectionGroupId)
    .update({
      smartTitle,
      updatedAt: now
    })
}

export default updateSmartGroupTitle
