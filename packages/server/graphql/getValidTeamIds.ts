export const getValidTeamIds = (teamIds: null | string[], tms: string[]) => {
  // the following comments can be removed pending #4070
  // const viewerTeamMembers = await dataLoader.get('teamMembersByUserId').load(viewerId)
  // const viewerTeamIds = viewerTeamMembers.map(({teamId}) => teamId)
  if (teamIds?.length) return teamIds!.filter((teamId) => tms.includes(teamId))
  // filter the teamIds array to only teams the user has a team member for
  return tms
}
