const constructFilterQueryParamURL = (
  teamIds: string[] | null,
  userIds: string[] | null,
  showArchived?: boolean,
  eventTypes?: string[] | null
) => {
  const filters = [] as string[]
  const {pathname} = location
  if (teamIds) {
    filters.push(`teamIds=${teamIds.join(',')}`)
  }
  if (userIds) {
    filters.push(`userIds=${userIds.join(',')}`)
  }
  if (showArchived) {
    filters.push(`archived=true`)
  }
  if (eventTypes) {
    filters.push(`eventTypes=${eventTypes.join(',')}`)
  }
  const prefix = `${pathname}${filters.length > 0 ? '?' : ''}`

  return `${prefix}${filters.join('&')}`
}

export default constructFilterQueryParamURL
