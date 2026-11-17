import {GraphQLError} from 'graphql'
import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import removeTeamsLimitObjects from '../../../billing/helpers/removeTeamsLimitObjects'
import type Team from '../../../database/types/Team'
import type {User} from '../../../postgres/types'
import safeArchiveTeam from '../../../safeMutations/safeArchiveTeam'
import publish from '../../../utils/publish'
import isValid from '../../isValid'
import removeAllUsersFromOrg from '../../mutations/helpers/removeAllUsersFromOrg'
import type {MutationResolvers} from '../resolverTypes'

const archiveOrganization: MutationResolvers['archiveOrganization'] = async (
  _source,
  {orgId},
  {dataLoader, socketId: mutatorId}
) => {
  const operationId = dataLoader.share()
  const subOptions = {operationId, mutatorId}

  const organization = await dataLoader.get('organizations').loadNonNull(orgId)
  const {tier} = organization
  if (tier !== 'starter') {
    throw new GraphQLError('You must first downgrade before archiving', {
      extensions: {code: 'CONFLICT'}
    })
  }

  // RESOLUTION
  const teams = await dataLoader.get('teamsByOrgIds').load(orgId)
  const teamIds = teams.map(({id}) => id)
  const teamArchiveResults = (await Promise.all(
    teamIds.map((teamId: string) => safeArchiveTeam(teamId, dataLoader))
  )) as any
  const allRemovedSuggestedActionIds = [] as string[]
  const allUserIds = [] as string[]

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
      const userIds = users.map(({id}) => id)
      allUserIds.push(...userIds)
      allRemovedSuggestedActionIds.push(...removedSuggestedActionIds)
    }
  )

  const uniqueUserIds = Array.from(new Set(allUserIds))

  await Promise.all([removeAllUsersFromOrg(orgId), removeTeamsLimitObjects(orgId, dataLoader)])

  const data = {
    orgId,
    teamIds,
    removedSuggestedActionIds: allRemovedSuggestedActionIds
  }
  publish(SubscriptionChannel.ORGANIZATION, orgId, 'ArchiveOrganizationPayload', data, subOptions)
  const users = await dataLoader.get('users').loadMany(uniqueUserIds)
  await Promise.all(
    users.filter(isValid).map(async (user) => {
      const tms = await dataLoader.get('teamIdsByUserId').load(user.id)
      publish(SubscriptionChannel.NOTIFICATION, user.id, 'AuthTokenPayload', {tms})
    })
  )

  return data
}

export default archiveOrganization
