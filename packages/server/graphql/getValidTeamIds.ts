import {DataLoaderWorker} from './graphql'

export const getValidTeamIds = async (
  viewerId: string,
  teamIds: null | string[],
  dataLoader: DataLoaderWorker
) => {
  const viewerTeamMembers = await dataLoader.get('teamMembersByUserId').load(viewerId)
  const viewerTeamIds = viewerTeamMembers.map(({teamId}) => teamId)
  if (teamIds?.length) return teamIds.filter((teamId) => viewerTeamIds.includes(teamId))
  // filter the teamIds array to only teams the user has a team member for
  return viewerTeamIds
}
