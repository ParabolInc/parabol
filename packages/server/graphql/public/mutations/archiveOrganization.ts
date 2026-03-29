import {sql} from 'kysely'
import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import removeTeamsLimitObjects from '../../../billing/helpers/removeTeamsLimitObjects'
import type Team from '../../../database/types/Team'
import getKysely from '../../../postgres/getKysely'
import type {User} from '../../../postgres/types'
import safeArchiveTeam from '../../../safeMutations/safeArchiveTeam'
import {analytics} from '../../../utils/analytics/analytics'
import {getUserId} from '../../../utils/authorization'
import publish from '../../../utils/publish'
import standardError from '../../../utils/standardError'
import type {MutationResolvers} from '../resolverTypes'

const archiveOrganization: MutationResolvers['archiveOrganization'] = async (
  _source,
  {orgId},
  {authToken, dataLoader, socketId: mutatorId}
) => {
  const operationId = dataLoader.share()
  const subOptions = {operationId, mutatorId}

  const viewerId = getUserId(authToken)
  const [organization, viewer] = await Promise.all([
    dataLoader.get('organizations').loadNonNull(orgId),
    dataLoader.get('users').loadNonNull(viewerId)
  ])
  const {tier} = organization
  if (tier !== 'starter') {
    return standardError(new Error('You must first downgrade before archiving'), {
      userId: viewerId
    })
  }

  // RESOLUTION
  analytics.archiveOrganization(viewer, orgId)
  const teams = await dataLoader.get('teamsByOrgIds').load(orgId)
  const teamIds = teams.map(({id}) => id)
  const teamArchiveResults = (await Promise.all(
    teamIds.map((teamId: string) => safeArchiveTeam(teamId, dataLoader))
  )) as any
  const allRemovedSuggestedActionIds = [] as string[]
  const allUserIds = new Set<string>()

  teamArchiveResults.forEach(
    ({
      team,
      users,
      removedSuggestedActionIds
    }: {
      team: Team
      users: User[]
      removedSuggestedActionIds: string[]
    }) => {
      if (!team) return
      allRemovedSuggestedActionIds.push(...removedSuggestedActionIds)
      users.forEach((user) => {
        if (user) allUserIds.add(user.id)
      })
    }
  )

  await Promise.all([
    getKysely()
      .updateTable('OrganizationUser')
      .set({removedAt: sql`CURRENT_TIMESTAMP`})
      .where('orgId', '=', orgId)
      .where('removedAt', 'is', null)
      .execute(),
    removeTeamsLimitObjects(orgId, dataLoader)
  ])

  const data = {
    orgId,
    teamIds,
    removedSuggestedActionIds: allRemovedSuggestedActionIds
  }
  publish(SubscriptionChannel.ORGANIZATION, orgId, 'ArchiveOrganizationPayload', data, subOptions)

  teamIds.forEach((teamId) => {
    allUserIds.forEach((userId) => {
      publish(SubscriptionChannel.NOTIFICATION, userId, 'TeamMembershipChangedPayload', {
        teamId,
        action: 'REMOVED'
      })
    })
  })

  return data
}

export default archiveOrganization
