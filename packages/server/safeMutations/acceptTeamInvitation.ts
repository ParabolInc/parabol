import {sql} from 'kysely'
import {InvoiceItemType} from 'parabol-client/types/constEnums'
import TeamMemberId from '../../client/shared/gqlIds/TeamMemberId'
import adjustUserCount from '../billing/helpers/adjustUserCount'
import getRethink from '../database/rethinkDriver'
import SuggestedActionCreateNewTeam from '../database/types/SuggestedActionCreateNewTeam'
import {DataLoaderInstance} from '../dataloader/RootDataLoader'
import generateUID from '../generateUID'
import {DataLoaderWorker} from '../graphql/graphql'
import {TeamSource} from '../graphql/public/types/Team'
import getKysely from '../postgres/getKysely'
import {Logger} from '../utils/Logger'
import setUserTierForUserIds from '../utils/setUserTierForUserIds'
import insertNewTeamMember from './insertNewTeamMember'

const handleFirstAcceptedInvitation = async (
  team: TeamSource,
  dataLoader: DataLoaderInstance
): Promise<string | null> => {
  const r = await getRethink()
  const now = new Date()
  const {id: teamId, isOnboardTeam} = team
  if (!isOnboardTeam) return null
  const teamMembers = await dataLoader.get('teamMembersByTeamId').load(teamId)
  const teamLead = teamMembers.find((tm) => tm.isLead)!
  const {userId} = teamLead
  const isNewTeamLead = await r
    .table('SuggestedAction')
    .getAll(userId, {index: 'userId'})
    .filter({type: 'tryRetroMeeting'})
    .count()
    .eq(0)
    .run()
  if (!isNewTeamLead) return null
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
        userId
      },
      new SuggestedActionCreateNewTeam({userId}),
      {
        id: generateUID(),
        createdAt: now,
        priority: 5,
        removedAt: null,
        teamId,
        type: 'tryActionMeeting',
        userId
      }
    ])
    .run()
  return userId
}

const acceptTeamInvitation = async (
  team: TeamSource,
  userId: string,
  dataLoader: DataLoaderWorker
) => {
  const r = await getRethink()
  const pg = getKysely()
  const now = new Date()
  const {id: teamId, orgId} = team
  const [user, organizationUser] = await Promise.all([
    dataLoader.get('users').loadNonNull(userId),
    dataLoader.get('organizationUsersByUserIdOrgId').load({userId, orgId})
  ])
  const {email, picture, preferredName} = user
  const teamLeadUserIdWithNewActions = await handleFirstAcceptedInvitation(team, dataLoader)
  const [invitationNotificationIds] = await Promise.all([
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
    pg
      .with('UserUpdate', (qc) =>
        qc
          .updateTable('User')
          .set({tms: sql`arr_append_uniq("tms", ${teamId})`})
          .where('id', '=', userId)
      )
      .insertInto('TeamMember')
      .values({
        id: TeamMemberId.join(teamId, userId),
        teamId,
        userId,
        picture,
        preferredName,
        email,
        openDrawer: 'manageTeam'
      })
      .onConflict((oc) => oc.column('id').doUpdateSet({isNotRemoved: true}))
      .execute(),
    insertNewTeamMember(user, teamId, dataLoader),
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
  dataLoader.clearAll(['teamMembers', 'users'])
  if (!organizationUser) {
    // clear the cache, adjustUserCount will mutate these
    dataLoader.get('organizationUsersByUserIdOrgId').clear({userId, orgId})
    dataLoader.get('users').clear(userId)
    try {
      await adjustUserCount(userId, orgId, InvoiceItemType.ADD_USER, dataLoader)
    } catch (e) {
      Logger.log(e)
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
