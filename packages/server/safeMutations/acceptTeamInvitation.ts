import adjustUserCount from '../billing/helpers/adjustUserCount'
import getRethink from '../database/rethinkDriver'
import addTeamMemberToNewMeeting from '../graphql/mutations/helpers/addTeamMemberToNewMeeting'
import insertNewTeamMember from './insertNewTeamMember'
import {updateAuth0TMS} from '../utils/auth0Helpers'
import shortid from 'shortid'
import {TEAM_INVITATION} from '../../client/utils/constants'
import getNewTeamLeadUserId from '../safeQueries/getNewTeamLeadUserId'
import addTeamIdToTMS from './addTeamIdToTMS'
import {InvoiceItemType} from 'parabol-client/types/constEnums'
import SuggestedActionCreateNewTeam from '../database/types/SuggestedActionCreateNewTeam'
import {ITeam} from 'parabol-client/types/graphql'
import User from '../database/types/User'
import OrganizationUser from '../database/types/OrganizationUser'

const handleFirstAcceptedInvitation = async (team): Promise<string | null> => {
  const r = await getRethink()
  const now = new Date()
  const {id: teamId, isOnboardTeam} = team
  if (!isOnboardTeam) return null
  const newTeamLeadUserId = await getNewTeamLeadUserId(teamId)
  if (newTeamLeadUserId) {
    await r
      .table('SuggestedAction')
      .insert([
        {
          id: shortid.generate(),
          createdAt: now,
          priority: 3,
          removedAt: null,
          teamId,
          type: 'tryRetroMeeting',
          userId: newTeamLeadUserId
        },
        new SuggestedActionCreateNewTeam({userId: newTeamLeadUserId}),
        {
          id: shortid.generate(),
          createdAt: now,
          priority: 5,
          removedAt: null,
          teamId,
          type: 'tryActionMeeting',
          userId: newTeamLeadUserId
        }
      ])
      .run()
  }
  return newTeamLeadUserId
}

const acceptTeamInvitation = async (
  teamId: string,
  userId: string,
  invitationId: string,
  dataLoader: any
) => {
  const r = await getRethink()
  const now = new Date()
  const {team, user} = await r({
    team: (r.table('Team').get(teamId) as unknown) as ITeam,
    user: (r
      .table('User')
      .get(userId)
      .merge({
        organizationUsers: r
          .table('OrganizationUser')
          .getAll(userId, {index: 'userId'})
          .filter({removedAt: null})
          .coerceTo('array')
      }) as unknown) as User & {organizationUsers: OrganizationUser[]}
  }).run()
  const {orgId} = team
  const teamLeadUserIdWithNewActions = await handleFirstAcceptedInvitation(team)
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
    removedNotificationIds: (r
      .table('Notification')
      .getAll(userId, {index: 'userIds'})
      .filter({
        type: TEAM_INVITATION,
        teamId
      })
      .update({isArchived: true}, {returnChanges: true})('changes')('new_val')('id')
      .default([]) as unknown) as string[]
  }).run()
  if (!userInOrg) {
    try {
      await adjustUserCount(userId, orgId, InvoiceItemType.ADD_USER)
    } catch (e) {
      console.log(e)
    }
  }

  // if a meeting is going on right now, add them
  await addTeamMemberToNewMeeting(teamMember, teamId, dataLoader)

  // update auth0
  const tms = user.tms ? user.tms.concat(teamId) : [teamId]
  updateAuth0TMS(userId, tms)

  // if accepted to team, don't count it towards the global denial count
  await r
    .table('PushInvitation')
    .getAll(userId, {index: 'userId'})
    .filter({teamId})
    .delete()
    .run()
  return {
    teamLeadUserIdWithNewActions,
    removedNotificationIds: removedNotificationIds as string[]
  }
}

export default acceptTeamInvitation
