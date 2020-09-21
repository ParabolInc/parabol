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
    .exec((execErr, results) => {
      if (execErr) throw new Error(`Failed to execute redis command: ${execErr}`)
      results.forEach((res, index) => {
        if (index === 0 && !res[0]) {
          userPresence = res[1]
        } else if (index === 1 && !res[0]) {
          activeTeamMemberIds = res[1]
        }
      })
    })
  const parsedUserPresence = userPresence.map((socket) => JSON.parse(socket)) as UserPresence[]
  const userLastSeenAtURLs = parsedUserPresence.map(({lastSeenAtURL}) => lastSeenAtURL)
  const usersAtSameURL = [] as string[]
  for (const id of activeTeamMemberIds) {
    const teamMemberPresence = await redis.lrange(`presence:${id}`, 0, -1)
    const parsedTeamMemberPresence = teamMemberPresence.map((socket) =>
      JSON.parse(socket)
    ) as UserPresence[]
    const teamMemberLastSeenAtURLs = parsedTeamMemberPresence.map(
      ({lastSeenAtURL}) => lastSeenAtURL
    )
    const isAtSameURL = teamMemberLastSeenAtURLs.find((url) => userLastSeenAtURLs.includes(url))
    if (isAtSameURL) {
      usersAtSameURL.push(id)
    }
  }
  return usersAtSameURL
}

export default getUsersToIgnore
