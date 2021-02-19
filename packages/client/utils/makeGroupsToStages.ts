import IRetroReflectionGroup from '../../server/graphql/types/RetroReflectionGroup'

const mapGroupsToStages = (reflectionGroups: typeof IRetroReflectionGroup[]) => {
  const sortedReflectionGroups = reflectionGroups.sort((a, b) =>
    a.voterIds.length < b.voterIds.length ? 1 : -1
  )
  return sortedReflectionGroups
}

export default mapGroupsToStages
