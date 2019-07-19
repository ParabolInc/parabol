const fromTeamMemberId = (teamMemberId: string) => {
  const [userId, teamId] = teamMemberId.split('::')
  return {userId, teamId}
}

export default fromTeamMemberId
