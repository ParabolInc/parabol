import getRedis from './getRedis'

export const enum RedisCommand {
  ADD = 'sadd',
  REMOVE = 'srem'
}

const getListeningUserIds = async (command: RedisCommand, tms: string[], userId: string) => {
  const redis = getRedis()
  const listeningUserIds = new Set()
  for (const teamId of tms) {
    const commands = [
      [command, `team:${teamId}`, userId],
      ['smembers', `team:${teamId}`]
    ]
    let teamMembers
    await redis.multi(commands).exec((execErr, results) => {
      if (execErr) throw new Error('Failed to execute redis command in getListeningUserIds.ts')
      results.forEach((res, index) => {
        if (index === 1 && !res[0]) {
          teamMembers = res[1]
        }
      })
    })
    for (const teamMemberUserId of teamMembers) {
      listeningUserIds.add(teamMemberUserId)
    }
  }
  return Array.from(listeningUserIds) as string[]
}

export default getListeningUserIds
