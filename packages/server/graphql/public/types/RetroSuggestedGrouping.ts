import type {RetroSuggestedGroupingResolvers} from '../resolverTypes'

const RetroSuggestedGrouping: RetroSuggestedGroupingResolvers = {
  id: ({meetingId}) => `suggestedGrouping:${meetingId}`,
  createdByUser: ({createdByUserId}, _args, {dataLoader}) =>
    dataLoader.get('users').loadNonNull(createdByUserId),
  isStale: async ({meetingId, createdAt}, _args, {dataLoader}) => {
    const reflections = await dataLoader.get('retroReflectionsByMeetingId').load(meetingId)
    // A reflection added since generation is caught by the same test: RetroReflection.updatedAt is
    // set on insert, so it is necessarily newer than the suggestions
    return reflections.some(({updatedAt}) => updatedAt.getTime() > createdAt.getTime())
  },
  groups: async ({meetingId, createdAt, groups}, _args, {dataLoader}) => {
    const reflections = await dataLoader.get('retroReflectionsByMeetingId').load(meetingId)
    const liveIds = new Set(reflections.map(({id}) => id))
    // Prune reflections deleted since generation. Without this, applying would throw partway
    // through and leave a half-rearranged board with an undo snapshot that no longer matches.
    return groups.flatMap(({groupTitle, reflectionIds}, index) => {
      const liveReflectionIds = reflectionIds.filter((id) => liveIds.has(id))
      if (liveReflectionIds.length === 0) return []
      return [
        {
          id: `${meetingId}:${createdAt.getTime()}:${index}`,
          title: groupTitle || null,
          reflectionIds: liveReflectionIds
        }
      ]
    })
  }
}

export default RetroSuggestedGrouping
