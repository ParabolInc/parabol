const TeamMemberId = {
  join: (teamId: string, userId: string) => `${userId}::${teamId}`,
  split: (id: string) => {
    const [userId, teamId] = id.split('::') as [string, string]
    return {teamId, userId}
  }
}

export default TeamMemberId
