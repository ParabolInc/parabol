import getRedis from '../../../utils/getRedis'
import {UserPresence} from '../../intranetSchema/mutations/connectSocket'

// finds all the users who are at the same url
const getUsersToIgnore = async (viewerId: string, teamId: string) => {
  const redis = getRedis()
  let userPresence
  let activeTeamMemberIds
  await redis
    .multi()
    .lrange(`presence:${viewerId}`, 0, -1)
    .smembers(`team:${teamId}`)
    .exec((err, res) => {
      if (err) throw new Error('Failed to execute redis command')
      userPresence = res.shift()?.pop()
      activeTeamMemberIds = res.pop()?.pop()
    })
  const parsedUserPresence = userPresence.map((socket) => JSON.parse(socket)) as UserPresence[]
  const userLastSeenAtURLs = parsedUserPresence.map((socket) => socket.lastSeenAtURL)
  const usersAtSameURL = [] as string[]
  for (const id of activeTeamMemberIds) {
    const teamMemberPresence = await redis.lrange(`presence:${id}`, 0, -1)
    const parsedTeamMemberPresence = teamMemberPresence.map((socket) =>
      JSON.parse(socket)
    ) as UserPresence[]
    const teamMemberLastSeenAtURLs = parsedTeamMemberPresence.map((socket) => socket.lastSeenAtURL)
    const isAtSameURL = teamMemberLastSeenAtURLs.find((url) => userLastSeenAtURLs.includes(url))
    if (isAtSameURL) {
      usersAtSameURL.push(id)
    }
  }
  return usersAtSameURL
}

export default getUsersToIgnore
