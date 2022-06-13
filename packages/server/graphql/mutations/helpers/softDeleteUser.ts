import TeamMemberId from 'parabol-client/shared/gqlIds/TeamMemberId'
import getRethink from '../../../database/rethinkDriver'
import removeAtlassianAuth from '../../../postgres/queries/removeAtlassianAuth'
import removeGitHubAuth from '../../../postgres/queries/removeGitHubAuth'
import getDeletedEmail from '../../../utils/getDeletedEmail'
import {DataLoaderWorker} from '../../graphql'
import removeFromOrg from './removeFromOrg'
import removeSlackAuths from './removeSlackAuths'

const removeGitHubAuths = async (userId: string, teamIds: string[]) =>
  Promise.all(teamIds.map((teamId) => removeGitHubAuth(userId, teamId)))

const removeAtlassianAuths = async (userId: string, teamIds: string[]) =>
  Promise.all(teamIds.map((teamId) => removeAtlassianAuth(userId, teamId)))

const softDeleteUser = async (userIdToDelete: string, dataLoader: DataLoaderWorker) => {
  const r = await getRethink()
  const orgUsers = await dataLoader.get('organizationUsersByUserId').load(userIdToDelete)
  const orgIds = orgUsers.map((orgUser) => orgUser.orgId)

  await Promise.all(
    orgIds.map((orgId) => removeFromOrg(userIdToDelete, orgId, undefined, dataLoader))
  )
  const teamMemberIds = await r
    .table('TeamMember')
    .getAll(userIdToDelete, {index: 'userId'})
    .getField('id')
    .coerceTo('array')
    .run()
  const teamIds = teamMemberIds.map((id) => TeamMemberId.split(id).teamId)

  await Promise.all([
    removeAtlassianAuths(userIdToDelete, teamIds),
    removeGitHubAuths(userIdToDelete, teamIds),
    removeSlackAuths(userIdToDelete, teamIds, true)
  ])

  return getDeletedEmail(userIdToDelete)
}

export default softDeleteUser
