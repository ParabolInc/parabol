import TeamMemberId from 'parabol-client/shared/gqlIds/TeamMemberId'
import getRethink from '../../../database/rethinkDriver'
// import executeGraphQL from '../../executeGraphQL'
import AuthToken from '../../../database/types/AuthToken'
import removeAtlassianAuth from '../../../postgres/queries/removeAtlassianAuth'
import removeGitHubAuth from '../../../postgres/queries/removeGitHubAuth'
import getDeletedEmail from '../../../utils/getDeletedEmail'
import segmentIo from '../../../utils/segmentIo'
import {DataLoaderWorker} from '../../graphql'
import removeFromOrg from './removeFromOrg'
import removeSlackAuths from './removeSlackAuths'

const removeGitHubAuths = async (userId: string, teamIds: string[]) =>
  Promise.all(teamIds.map((teamId) => removeGitHubAuth(userId, teamId)))

const removeAtlassianAuths = async (userId: string, teamIds: string[]) =>
  Promise.all(teamIds.map((teamId) => removeAtlassianAuth(userId, teamId)))

const softDeleteUser = async (
  userIdToDelete: string,
  dataLoader: DataLoaderWorker,
  authToken: AuthToken,
  validReason?: string
) => {
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
  const executeGraphQL = require('../../executeGraphQL').default

  const [parabolPayload] = await Promise.all([
    executeGraphQL({
      authToken,
      dataLoaderId: dataLoader.share(),
      query: `
        query AccountRemoved($userId: ID!) {
          user(userId: $userId) {
            email
            isRemoved
            company {
              userCount
              activeUserCount
            }
          }
        }
      `,
      variables: {userId: userIdToDelete},
      isPrivate: true
    }),
    removeAtlassianAuths(userIdToDelete, teamIds),
    removeGitHubAuths(userIdToDelete, teamIds),
    removeSlackAuths(userIdToDelete, teamIds, true)
  ])
  /*
   * eagerly pass in parabolPayload to segment track method instead of
   * lazily querying for it so we can promptly delete user on our side without
   * worrying about hubspot needing that data and not finding it
   */
  segmentIo.track({
    userId: userIdToDelete,
    event: 'Account Removed',
    properties: {
      reason: validReason,
      parabolPayload: parabolPayload.data
    }
  })

  return getDeletedEmail(userIdToDelete)
}

export default softDeleteUser
