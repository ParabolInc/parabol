import adjustUserCount from 'server/billing/helpers/adjustUserCount'
import getRethink from 'server/database/rethinkDriver'
import addTeamMemberToNewMeeting from 'server/graphql/mutations/helpers/addTeamMemberToNewMeeting'
import addUserToTMSUserOrg from 'server/safeMutations/addUserToTMSUserOrg'
import insertNewTeamMember from 'server/safeMutations/insertNewTeamMember'
import {ADD_USER} from 'server/utils/serverConstants'
import {TEAM_INVITATION} from 'universal/utils/constants'
import {auth0ManagementClient} from 'server/utils/auth0Helpers'

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
    user: r.table('User').get(userId)
  })
  const userOrgs = user.userOrgs || []
  const userInOrg = Boolean(userOrgs.find((org) => org.id === orgId))
  const {removedNotificationIds, teamMember} = await r({
    // add the team to the user doc
    userUpdate: addUserToTMSUserOrg(userId, teamId, orgId),
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
  })
  if (!userInOrg) {
    await adjustUserCount(userId, orgId, ADD_USER)
  }

  // if a meeting is going on right now, add them
  await addTeamMemberToNewMeeting(teamMember, teamId, dataLoader)

  // update auth0
  const tms = user.tms ? user.tms.concat(teamId) : [teamId]
  auth0ManagementClient.users.updateAppMetadata({id: userId}, {tms})
  return removedNotificationIds
}

export default acceptTeamInvitation
