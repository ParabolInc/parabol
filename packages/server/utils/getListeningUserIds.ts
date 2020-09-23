import getRedis from './getRedis'

export const enum RedisCommand {
  ADD = 'sadd',
  REMOVE = 'srem'
}

const getListeningUserIds = async (command: RedisCommand, tms: string[], userId: string) => {
  const redis = getRedis()
  const listeningUserIds = new Set()
  const commands = [] as string[][]
  for (const teamId of tms) {
    commands.push([command, `team:${teamId}`, userId], ['smembers', `team:${teamId}`])
  }
  const response = await redis.multi(commands).exec((execErr) => {
    if (execErr) {
      throw new Error(`Failed to execute redis command: ${execErr}`)
    }
  })
  const sMembersRes = response[1]
  const teamMembers = sMembersRes[1]
  for (const teamMemberUserId of teamMembers) {
    listeningUserIds.add(teamMemberUserId)
  }
  return Array.from(listeningUserIds) as string[]
}

export default getListeningUserIds
