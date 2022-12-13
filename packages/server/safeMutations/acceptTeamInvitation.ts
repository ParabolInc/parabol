import {InvoiceItemType} from 'parabol-client/types/constEnums'
import adjustUserCount from '../billing/helpers/adjustUserCount'
import getRethink from '../database/rethinkDriver'
import SuggestedActionCreateNewTeam from '../database/types/SuggestedActionCreateNewTeam'
import generateUID from '../generateUID'
import {DataLoaderWorker} from '../graphql/graphql'
import {Team} from '../postgres/queries/getTeamsByIds'
import getNewTeamLeadUserId from '../safeQueries/getNewTeamLeadUserId'
import setUserTierForUserIds from '../utils/setUserTierForUserIds'
import addTeamIdToTMS from './addTeamIdToTMS'
import insertNewTeamMember from './insertNewTeamMember'

const handleFirstAcceptedInvitation = async (team: Team): Promise<string | null> => {
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
          id: generateUID(),
          createdAt: now,
          priority: 3,
          removedAt: null,
          teamId,
          type: 'tryRetroMeeting',
          userId: newTeamLeadUserId
        },
        new SuggestedActionCreateNewTeam({userId: newTeamLeadUserId}),
        {
          id: generateUID(),
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

const acceptTeamInvitation = async (team: Team, userId: string, dataLoader: DataLoaderWorker) => {
  const r = await getRethink()
  const now = new Date()
  const {id: teamId, orgId} = team
  const [user, organizationUser] = await Promise.all([
    dataLoader.get('users').load(userId),
    dataLoader.get('organizationUsersByUserIdOrgId').load({userId, orgId})
  ])
  if (!user) {
    throw new Error('User not found')
  }
  const {email} = user
  const teamLeadUserIdWithNewActions = await handleFirstAcceptedInvitation(team)
  const [, invitationNotificationIds] = await Promise.all([
    insertNewTeamMember(user, teamId),
    r
      .table('Notification')
      .getAll(userId, {index: 'userId'})
      .filter({
        type: 'TEAM_INVITATION',
        teamId
      })
      .update(
        // not really clicked, but no longer important
        {status: 'CLICKED'},
        {returnChanges: true}
      )('changes')('new_val')('id')
      .default([])
      .run(),
    // add the team to the user doc
    addTeamIdToTMS(userId, teamId),
    r
      .table('TeamInvitation')
      .getAll(teamId, {index: 'teamId'})
      // redeem all invitations, otherwise if they have 2 someone could join after they've been kicked out
      .filter({email})
      .update({
        acceptedAt: now,
        acceptedBy: userId
      })
      .run()
  ])

  if (!organizationUser) {
    // clear the cache, adjustUserCount will mutate these
    dataLoader.get('organizationUsersByUserIdOrgId').clear({userId, orgId})
    dataLoader.get('users').clear(userId)
    try {
      await adjustUserCount(userId, orgId, InvoiceItemType.ADD_USER, dataLoader)
    } catch (e) {
      console.log(e)
    }
    await setUserTierForUserIds([userId])
  }

  // if accepted to team, don't count it towards the global denial count
  await r.table('PushInvitation').getAll(userId, {index: 'userId'}).filter({teamId}).delete().run()
  return {
    teamLeadUserIdWithNewActions,
    invitationNotificationIds: invitationNotificationIds as string[]
  }
}

export default acceptTeamInvitation
