import {GraphQLID, GraphQLList, GraphQLNonNull, GraphQLString} from 'graphql'
import {InvoiceItemType} from 'parabol-client/types/constEnums'
import adjustUserCount from '../../billing/helpers/adjustUserCount'
import getKysely from '../../postgres/getKysely'
import safeArchiveEmptyStarterOrganization from '../../safeMutations/safeArchiveEmptyStarterOrganization'
import {Logger} from '../../utils/Logger'
import {getUserId, isSuperUser} from '../../utils/authorization'
import standardError from '../../utils/standardError'
import {DataLoaderWorker, GQLContext} from '../graphql'
import isValid from '../isValid'

const MAX_NUM_TEAMS = 40

const moveToOrg = async (
  teamId: string,
  orgId: string,
  authToken: any,
  dataLoader: DataLoaderWorker
) => {
  const pg = getKysely()

  // AUTH
  const su = isSuperUser(authToken)
  // VALIDATION
  const [org, team, isPaidResult] = await Promise.all([
    dataLoader.get('organizations').loadNonNull(orgId),
    dataLoader.get('teams').load(teamId),
    pg
      .selectFrom('Team')
      .select('isPaid')
      .where('orgId', '=', orgId)
      .where('isArchived', '!=', true)
      .limit(1)
      .executeTakeFirst()
  ])
  if (!team) {
    return standardError(new Error('Did not find the team'))
  }
  const {orgId: currentOrgId} = team
  if (!su) {
    const userId = getUserId(authToken)
    if (!userId) {
      return standardError(new Error('No userId provided'))
    }
    const [newOrganizationUser, oldOrganizationUser] = await Promise.all([
      dataLoader.get('organizationUsersByUserIdOrgId').load({orgId, userId}),
      dataLoader.get('organizationUsersByUserIdOrgId').load({orgId: currentOrgId, userId})
    ])

    if (!newOrganizationUser) {
      return standardError(new Error('Not on organization'), {userId})
    }
    const isBillingLeaderForOrg =
      newOrganizationUser.role === 'BILLING_LEADER' || newOrganizationUser.role === 'ORG_ADMIN'
    if (!isBillingLeaderForOrg) {
      return standardError(new Error('Not organization leader'), {userId})
    }

    const isBillingLeaderForTeam =
      oldOrganizationUser?.role === 'BILLING_LEADER' || oldOrganizationUser?.role === 'ORG_ADMIN'
    if (!isBillingLeaderForTeam) {
      return standardError(new Error('Not organization leader'), {userId})
    }

    if (orgId === currentOrgId) {
      return standardError(new Error('Team already on organization'), {userId})
    }
  }

  // RESOLUTION
  const updates = {
    orgId,
    isPaid: isPaidResult?.isPaid ?? true,
    tier: org.tier,
    trialStartDate: org.trialStartDate,
    updatedAt: new Date()
  }
  const teamMembers = await dataLoader.get('teamMembersByTeamId').load(teamId)
  const teamMemberUserIds = teamMembers.map(({userId}) => userId)
  const orgUserKeys = teamMemberUserIds.map((userId) => ({userId, orgId}))
  const existingOrgUsers = (
    await dataLoader.get('organizationUsersByUserIdOrgId').loadMany(orgUserKeys)
  ).filter(isValid)
  const newToOrgUserIds = teamMemberUserIds.filter(
    (userId) => !existingOrgUsers.find((orgUser) => orgUser.userId === userId)
  )
  await pg
    .with('NotificationUpdate', (qb) =>
      qb
        .updateTable('Notification')
        .set({orgId})
        .where('teamId', '=', teamId)
        .where('orgId', 'is not', null)
    )
    .with('MeetingTemplateUpdate', (qb) =>
      qb.updateTable('MeetingTemplate').set({orgId}).where('orgId', '=', currentOrgId)
    )
    .updateTable('Team')
    .set(updates)
    .where('id', '=', teamId)
    .execute()
  dataLoader.clearAll('teams')
  // if no teams remain on the org, remove it
  await safeArchiveEmptyStarterOrganization(currentOrgId, dataLoader)

  await Promise.all(
    newToOrgUserIds.map((newUserId) => {
      return adjustUserCount(newUserId, orgId, InvoiceItemType.ADD_USER, dataLoader)
    })
  )

  const newUsers = (await dataLoader.get('users').loadMany(newToOrgUserIds)).filter(isValid)

  const inactiveUserIds = newUsers.filter((user) => user.inactive).map((user) => user!.id)
  inactiveUserIds.map((newInactiveUserId) => {
    return adjustUserCount(newInactiveUserId, orgId, InvoiceItemType.AUTO_PAUSE_USER, dataLoader)
  })

  const inactiveAdded = inactiveUserIds.length
  const activeAdded = newToOrgUserIds.length - inactiveAdded
  return `${teamId}: ${inactiveAdded} inactive users and ${activeAdded} active users added to org ${orgId}`
}

export default {
  type: GraphQLString,
  description: 'Move a team to a different org. Requires billing leader rights on both orgs!',
  args: {
    teamIds: {
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(GraphQLID))),
      description: 'The teamId that you want to move'
    },
    orgId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The ID of the organization you want to move the team to'
    }
  },
  async resolve(
    _source: unknown,
    {teamIds, orgId}: {teamIds: string[]; orgId: string},
    {authToken, dataLoader}: GQLContext
  ) {
    if (teamIds.length > MAX_NUM_TEAMS) {
      // Running this mutation with more than ~50 team IDs usually times out on prod. Splitting into
      // batches is the workaround, so fail quickly with a descriptive error when this is the case.
      return `Error: Can only move ${MAX_NUM_TEAMS} teams at once. Please split team IDs into batches.`
    }
    const results = [] as (string | any)[]
    for (let i = 0; i < teamIds.length; i++) {
      const teamId = teamIds[i]!
      const result = await moveToOrg(teamId, orgId, authToken, dataLoader)
      results.push(result)
    }
    const successes = results.filter((result) => typeof result === 'string')
    const failures = results.filter((result) => typeof result !== 'string')
    const successStr = successes.join('\n')
    Logger.error('failures', failures)
    return successStr
  }
}
