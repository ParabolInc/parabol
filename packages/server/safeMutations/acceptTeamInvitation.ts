import {sql} from 'kysely'
import {InvoiceItemType} from 'parabol-client/types/constEnums'
import TeamMemberId from '../../client/shared/gqlIds/TeamMemberId'
import adjustUserCount from '../billing/helpers/adjustUserCount'
import {DataLoaderInstance} from '../dataloader/RootDataLoader'
import generateUID from '../generateUID'
import {DataLoaderWorker} from '../graphql/graphql'
import getKysely from '../postgres/getKysely'
import {Team} from '../postgres/types'
import {Logger} from '../utils/Logger'
import setUserTierForUserIds from '../utils/setUserTierForUserIds'

const handleFirstAcceptedInvitation = async (
  team: Team,
  dataLoader: DataLoaderInstance
): Promise<string | null> => {
  const now = new Date()
  const {id: teamId, isOnboardTeam} = team
  if (!isOnboardTeam) return null
  const teamMembers = await dataLoader.get('teamMembersByTeamId').load(teamId)
  const teamLead = teamMembers.find((tm) => tm.isLead)!
  const {userId} = teamLead
  const suggestedActions = await dataLoader.get('suggestedActionsByUserId').load(userId)
  const hasTryRetro = suggestedActions.some((sa) => sa.type === 'tryRetroMeeting')
  if (hasTryRetro) return null
  const actions = [
    {
      id: generateUID(),
      createdAt: now,
      priority: 3,
      removedAt: null,
      teamId,
      type: 'tryRetroMeeting' as const,
      userId
    },
    {
      id: generateUID(),
      createdAt: now,
      priority: 4,
      removedAt: null,
      type: 'createNewTeam' as const,
      userId
    },
    {
      id: generateUID(),
      createdAt: now,
      priority: 5,
      removedAt: null,
      teamId,
      type: 'tryActionMeeting' as const,
      userId
    }
  ]
  await getKysely()
    .insertInto('SuggestedAction')
    .values(actions)
    .onConflict((oc) => oc.columns(['userId', 'type']).doNothing())
    .execute()
  return userId
}

const acceptTeamInvitation = async (team: Team, userId: string, dataLoader: DataLoaderWorker) => {
  const pg = getKysely()
  const {id: teamId, orgId} = team
  const [user, organizationUser] = await Promise.all([
    dataLoader.get('users').loadNonNull(userId),
    dataLoader.get('organizationUsersByUserIdOrgId').load({userId, orgId})
  ])
  const {email} = user
  const teamLeadUserIdWithNewActions = await handleFirstAcceptedInvitation(team, dataLoader)
  const invitationNotifications = await pg
    .with('TeamMemberInsert', (qc) =>
      qc
        .insertInto('TeamMember')
        .values({
          id: TeamMemberId.join(teamId, userId),
          teamId,
          userId,
          openDrawer: 'manageTeam'
        })
        .onConflict((oc) => oc.column('id').doUpdateSet({isNotRemoved: true, isLead: false}))
    )
    .with('UserUpdate', (qc) =>
      qc
        .updateTable('User')
        .set({tms: sql`arr_append_uniq("tms", ${teamId})`})
        .where('id', '=', userId)
    )
    .with('TeamInvitationUpdate', (qb) =>
      // redeem all invitations, otherwise if they have 2 someone could join after they've been kicked out
      qb
        .updateTable('TeamInvitation')
        .set({acceptedAt: sql`CURRENT_TIMESTAMP`, acceptedBy: userId})
        .where('email', '=', email)
        .where('teamId', '=', teamId)
    )
    .updateTable('Notification')
    .set({status: 'CLICKED'})
    .where('userId', '=', userId)
    .where('teamId', '=', teamId)
    .where('type', '=', 'TEAM_INVITATION')
    .returning('id')
    .execute()
  dataLoader.clearAll(['teamMembers', 'users', 'notifications'])
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
  const invitationNotificationIds = invitationNotifications.map(({id}) => id)
  // if accepted to team, don't count it towards the global denial count
  await pg
    .deleteFrom('PushInvitation')
    .where('userId', '=', userId)
    .where('teamId', '=', teamId)
    .execute()
  return {
    teamLeadUserIdWithNewActions,
    invitationNotificationIds
  }
}

export default acceptTeamInvitation
