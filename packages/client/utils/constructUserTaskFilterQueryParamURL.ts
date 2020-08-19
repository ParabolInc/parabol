const constructUserTaskFilterQueryParamURL = (teamIds?: string[], userIds?: string[], showArchived?: boolean) => {
  const filters = [] as string[]
  if (teamIds) {
    filters.push(`teamId=${teamIds.join(',')}`)
  }
  if (userIds) {
    filters.push(`userId=${userIds.join(',')}`)
  }
  if (showArchived) {
    filters.push(`archived=true`)
  }
  const prefix = `/me/tasks${filters.length > 0 ? '?' : ''}`

  return `${prefix}${filters.join('&')}`
}

export default constructUserTaskFilterQueryParamURL