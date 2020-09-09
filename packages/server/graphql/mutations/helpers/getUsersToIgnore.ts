import {DataLoaderWorker} from '../../graphql'
import getRedis from '../../../utils/getRedis'

// finds all the users who are at the same url
const getUsersToIgnore = async (viewerId: string, teamId: string, dataLoader: DataLoaderWorker) => {
  const redis = getRedis()
  const userPresence = await redis.lrange(`presence:${viewerId}`, 0, -1)
  const userLastSeenAtURLs = userPresence.map((socket) => JSON.parse(socket).lastSeenAtURL)
  console.log('getUsersToIgnore -> userLastSeenAtURLs', userLastSeenAtURLs)
  const activeTeamMemberIds = await redis.smembers(`team:${teamId}`)
  const usersAtSameURL = [] as string[]

  for (const id of activeTeamMemberIds) {
    const userPresence = await redis.lrange(`presence:${id}`, 0, -1)
    const teamMemberLastSeenAtURLs = userPresence.map((socket) => JSON.parse(socket).lastSeenAtURL)
    console.log('getUsersToIgnore -> teamMemberLastSeenAtURLs', teamMemberLastSeenAtURLs)
    const isAtSameURL = teamMemberLastSeenAtURLs.find((url) => userLastSeenAtURLs.includes(url))
    if (isAtSameURL) {
      usersAtSameURL.push(id)
    }
  }

  console.log('getUsersToIgnore -> usersAtSameURL', usersAtSameURL)
  return usersAtSameURL

  // const r = await getRethink()
  // const viewer = await dataLoader.get('users').load(viewerId)
  // const lastSeenAtURL = viewer.lastSeenAtURL || ''
  // if (!lastSeenAtURL.startsWith('/meet')) return []
  // return (r
  //   .table('TeamMember')
  //   .getAll(teamId, {index: 'teamId'})
  //   .filter({isNotRemoved: true})
  //   .merge((teamMember) => ({
  //     lastSeenAtURL: r
  //       .table('User')
  //       .get(teamMember('userId'))('lastSeenAtURL')
  //       .default('~')
  //   }))
  //   .filter({lastSeenAtURL})('userId')
  //   .run() as unknown) as string[]
}

export default getUsersToIgnore
