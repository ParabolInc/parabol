import {DataLoaderWorker} from './graphql'

/**
 * Gets a list of team IDs that the given user has access to.
 *
 * @param userId - The ID of the user to check team access for
 * @param includeArchived - Whether to include archived teams
 * @param dataLoader - The dataloader
 *
 * @returns A list of team IDs that the user has access to
 */
export const getAccessibleTeamIdsForUser = async (
  userId: string,
  includeArchived: boolean,
  dataLoader: DataLoaderWorker
) => {
  const user = await dataLoader.get('users').loadNonNull(userId)
  if (!includeArchived) {
    return user.tms
  }
  const userTeamMembers = await dataLoader.get('teamMembersByUserId').load(userId)
  return userTeamMembers.map(({teamId}) => teamId)
}
