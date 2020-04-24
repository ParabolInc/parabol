import {IRetroReflectionGroup} from '../types/graphql'

const mapGroupsToStages = (reflectionGroups: IRetroReflectionGroup[]) => {
  const sortedReflectionGroups = reflectionGroups.sort((a, b) =>
    a.voterIds.length < b.voterIds.length ? 1 : -1
  )
  return sortedReflectionGroups
}

export default mapGroupsToStages
