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
    removeSlackAuths(userIdToDelete, teamIds, true)
  ])

  return getDeletedEmail(userIdToDelete)
}

export default softDeleteUser
