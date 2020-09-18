import getRedis from './getRedis'

const getListeningUserIds = async (tms: string[], userId: string) => {
  const redis = getRedis()
  const listeningUserIds = new Set()
  await redis.srem('onlineUserIds', userId)
  for (const teamId of tms) {
    const teamMembers = await redis.smembers(`team:${teamId}`)
    await redis.srem(`team:${teamId}`, userId)
    if ((await redis.llen(`team:${teamId}`)) === 0) {
      await redis.srem(`onlineTeamIds`, teamId)
    }
    for (const teamMemberUserId of teamMembers) {
      listeningUserIds.add(teamMemberUserId)
    }
  }
  return Array.from(listeningUserIds) as string[]
}

export default getListeningUserIds
