import {DataLoaderWorker} from './graphql'

/**
 * Gets a list of team IDs that the given user has access to.
 *
 * @param userId - The ID of the user to check team access for
 * @param teamIds - An optional array of team IDs to filter the results by
 * @param dataLoader - The dataloader
 *
 * @returns A list of team IDs that the user has access to
 */
export const getAccessibleTeamIdsForUser = async (
  userId: string,
  teamIds: null | string[],
  dataLoader: DataLoaderWorker
) => {
  const user = await dataLoader.get('users').loadNonNull(userId)
  return teamIds?.length ? teamIds.filter((teamId) => user.tms.includes(teamId)) : user.tms
}
