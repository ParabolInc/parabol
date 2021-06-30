
const TeamMemberId = {
  join: (teamId: string, userId: string) => `${userId}:${teamId}`,
  split: (id: string) => {
    const [userId, teamId] = id.split(':')
    return {teamId, userId}
  }
}

export default TeamMemberId
