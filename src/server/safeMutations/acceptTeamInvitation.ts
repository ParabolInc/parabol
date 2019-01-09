import adjustUserCount from 'server/billing/helpers/adjustUserCount'
import getRethink from 'server/database/rethinkDriver'
import addTeamMemberToNewMeeting from 'server/graphql/mutations/helpers/addTeamMemberToNewMeeting'
import insertNewTeamMember from 'server/safeMutations/insertNewTeamMember'
import {auth0ManagementClient} from 'server/utils/auth0Helpers'
import {ADD_USER} from 'server/utils/serverConstants'
import {TEAM_INVITATION} from 'universal/utils/constants'
import addTeamIdToTMS from './addTeamIdToTMS'

const acceptTeamInvitation = async (
  teamId: string,
  userId: string,
  invitationId: string,
  dataLoader: any
) => {
  const r = getRethink()
  const now = new Date()
  const {
    team: {orgId},
    user
  } = await r({
    team: r.table('Team').get(teamId),
    user: r
      .table('User')
      .get(userId)
      .merge({
        organizationUsers: r
          .table('OrganizationUser')
          .getAll(userId, {index: 'userId'})
          .filter({removedAt: null})
          .coerceTo('array')
      })
  })
  const userInOrg = Boolean(
    user.organizationUsers.find((organizationUser) => organizationUser.orgId === orgId)
  )
  const {removedNotificationIds, teamMember} = await r({
    // add the team to the user doc
    userUpdate: addTeamIdToTMS(userId, teamId),
    teamMember: insertNewTeamMember(userId, teamId),
    // only redeem 1 invitation. any others will expire
    redeemedInvitation: r
      .table('TeamInvitation')
      .get(invitationId)
      .update({
        acceptedAt: now,
        acceptedBy: userId
      }),
    removedNotificationIds: r
      .table('Notification')
      .getAll(userId, {index: 'userIds'})
      .filter({
        type: TEAM_INVITATION,
        teamId
      })
      .update({isArchived: true}, {returnChanges: true})('changes')('new_val')('id')
      .default([])
  })
  if (!userInOrg) {
    await adjustUserCount(userId, orgId, ADD_USER)
  }

  // if a meeting is going on right now, add them
  await addTeamMemberToNewMeeting(teamMember, teamId, dataLoader)

  // update auth0
  const tms = user.tms ? user.tms.concat(teamId) : [teamId]
  auth0ManagementClient.users.updateAppMetadata({id: userId}, {tms})
  return removedNotificationIds as Array<string>
}

export default acceptTeamInvitation
