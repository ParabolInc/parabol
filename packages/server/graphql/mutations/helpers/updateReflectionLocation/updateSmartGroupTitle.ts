import getRethink from '../../../../database/rethinkDriver'

const updateSmartGroupTitle = (reflectionGroupId: string, smartTitle: string) => {
  const r = getRethink()
  const now = new Date()
  return r
    .table('RetroReflectionGroup')
    .get(reflectionGroupId)
    .update((g) => ({
      smartTitle,
      title: r.branch(
        g('smartTitle').eq(g('title')),
        smartTitle,
        g('title'),
      ),
      updatedAt: now
    }))
}

export default updateSmartGroupTitle
