const TeamInsightsId = {
  join: (teamId: string) => `teamInsights:${teamId}`,
  split: (id: string) => {
    const [, teamId] = id.split(':')
    return teamId
  }
}

export default TeamInsightsId
