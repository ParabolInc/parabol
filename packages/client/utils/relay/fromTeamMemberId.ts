const fromTeamMemberId = (teamMemberId: string) => {
  const [userId, teamId] = teamMemberId.split('::')
  return {userId, teamId} as {userId: string; teamId: string}
}

export default fromTeamMemberId
