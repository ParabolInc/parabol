import getRedis from '../../../utils/getRedis'

// finds all the users who are at the same url
const getUsersToIgnore = async (viewerId: string, teamId: string) => {
  const redis = getRedis()
  const userPresence = await redis.lrange(`presence:${viewerId}`, 0, -1)
  const userLastSeenAtURLs = userPresence.map((socket) => JSON.parse(socket).lastSeenAtURL)
  const activeTeamMemberIds = await redis.smembers(`team:${teamId}`)
  const usersAtSameURL = [] as string[]

  for (const id of activeTeamMemberIds) {
    const userPresence = await redis.lrange(`presence:${id}`, 0, -1)
    const teamMemberLastSeenAtURLs = userPresence.map((socket) => JSON.parse(socket).lastSeenAtURL)
    const isAtSameURL = teamMemberLastSeenAtURLs.find((url) => userLastSeenAtURLs.includes(url))
    if (isAtSameURL) {
      usersAtSameURL.push(id)
    }
  }

  return usersAtSameURL
}

export default getUsersToIgnore
