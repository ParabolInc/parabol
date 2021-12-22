const mapGroupsToStages = (reflectionGroups: {id: string; voterIds: string[]}[]) => {
  return reflectionGroups.sort((a, b) => (a.voterIds.length < b.voterIds.length ? 1 : -1))
}

export default mapGroupsToStages
