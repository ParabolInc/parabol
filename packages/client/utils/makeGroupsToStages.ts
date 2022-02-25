const mapGroupsToStages = <T extends {id: string; voterIds: string[]}[]>(reflectionGroups: T) => {
  return reflectionGroups.sort((a, b) => (a.voterIds.length < b.voterIds.length ? 1 : -1))
}

export default mapGroupsToStages
