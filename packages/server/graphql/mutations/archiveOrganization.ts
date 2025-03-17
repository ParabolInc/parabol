import {GraphQLID, GraphQLNonNull} from 'graphql'
import {sql} from 'kysely'
import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import removeTeamsLimitObjects from '../../billing/helpers/removeTeamsLimitObjects'
import Team from '../../database/types/Team'
import User from '../../database/types/User'
import getKysely from '../../postgres/getKysely'
import IUser from '../../postgres/types/IUser'
import safeArchiveTeam from '../../safeMutations/safeArchiveTeam'
import {analytics} from '../../utils/analytics/analytics'
import {getUserId, isSuperUser, isUserBillingLeader} from '../../utils/authorization'
import publish from '../../utils/publish'
import standardError from '../../utils/standardError'
import {GQLContext} from '../graphql'
import isValid from '../isValid'
import ArchiveOrganizationPayload from '../types/ArchiveOrganizationPayload'

export default {
  type: new GraphQLNonNull(ArchiveOrganizationPayload),
  args: {
    orgId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The orgId to archive'
    }
  },
  async resolve(
    _source: unknown,
    {orgId}: {orgId: string},
    {authToken, dataLoader, socketId: mutatorId}: GQLContext
  ) {
    const operationId = dataLoader.share()
    const subOptions = {operationId, mutatorId}

    // AUTH
    const viewerId = getUserId(authToken)
    if (!isSuperUser(authToken)) {
      if (!(await isUserBillingLeader(viewerId, orgId, dataLoader))) {
        return standardError(new Error('Not organization leader'), {userId: viewerId})
      }
    }

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
    const users = await dataLoader.get('users').loadMany(uniqueUserIds)
    users.filter(isValid).forEach((user?: IUser) => {
      if (!user) return
      const {id, tms} = user
      publish(SubscriptionChannel.NOTIFICATION, id, 'AuthTokenPayload', {tms})
    })

    return data
  }
}
