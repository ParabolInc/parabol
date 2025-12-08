import getKysely from '../../../postgres/getKysely'
import getDeletedEmail from '../../../utils/getDeletedEmail'
import type {DataLoaderWorker} from '../../graphql'
import removeFromOrg from './removeFromOrg'
import removeSlackAuths from './removeSlackAuths'

const removeGitHubAuths = async (userId: string, teamIds: string[]) =>
  Promise.all(
    teamIds.map((teamId) => {
      return getKysely()
        .updateTable('GitHubAuth')
        .set({isActive: false})
        .where('userId', '=', userId)
        .where('teamId', '=', teamId)
        .where('isActive', '=', true)
        .execute()
    })
  )

const removeAtlassianAuths = async (userId: string, teamIds: string[]) => {
  if (teamIds.length === 0) return
  const pg = getKysely()
  return pg
    .updateTable('AtlassianAuth')
    .set({isActive: false})
    .where('userId', '=', userId)
    .where('teamId', 'in', teamIds)
    .where('isActive', '=', true)
    .execute()
}

const removePageAcces = async (userId: string) => {
  const pg = getKysely()
  // Do this first because deleting from PageAccess will cause n triggers & we want to do it all at once
  await pg.deleteFrom('PageUserSortOrder').where('userId', '=', userId).execute()
  await Promise.all([
    pg.deleteFrom('PageAccess').where('userId', '=', userId).execute(),
    pg.deleteFrom('PageUserAccess').where('userId', '=', userId).execute(),
    pg.deleteFrom('PageAccessRequest').where('userId', '=', userId).execute()
  ])
}

const softDeleteUser = async (userIdToDelete: string, dataLoader: DataLoaderWorker) => {
  const orgUsers = await dataLoader.get('organizationUsersByUserId').load(userIdToDelete)
  const orgIds = orgUsers.map((orgUser) => orgUser.orgId)

  await Promise.all(
    orgIds.map((orgId) => removeFromOrg(userIdToDelete, orgId, undefined, dataLoader))
  )
  const teamMembers = await dataLoader.get('teamMembersByUserId').load(userIdToDelete)
  const teamIds = teamMembers.map(({teamId}) => teamId)

  await Promise.all([
    removeAtlassianAuths(userIdToDelete, teamIds),
    removeGitHubAuths(userIdToDelete, teamIds),
    removeSlackAuths(userIdToDelete, teamIds, true),
    removePageAcces(userIdToDelete)
  ])

  return getDeletedEmail(userIdToDelete)
}

export default softDeleteUser
