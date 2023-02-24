import {GraphQLID, GraphQLNonNull} from 'graphql'
import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import removeTeamsLimitObjects from '../../billing/helpers/removeTeamsLimitObjects'
import getRethink from '../../database/rethinkDriver'
import Team from '../../database/types/Team'
import User from '../../database/types/User'
import IUser from '../../postgres/types/IUser'
import safeArchiveTeam from '../../safeMutations/safeArchiveTeam'
import {getUserId, isSuperUser, isUserBillingLeader} from '../../utils/authorization'
import publish from '../../utils/publish'
import segmentIo from '../../utils/segmentIo'
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
    const r = await getRethink()
    const operationId = dataLoader.share()
    const subOptions = {operationId, mutatorId}
    const now = new Date()

    // AUTH
    const viewerId = getUserId(authToken)
    if (!isSuperUser(authToken)) {
      if (!(await isUserBillingLeader(viewerId, orgId, dataLoader))) {
        return standardError(new Error('Not organization leader'), {userId: viewerId})
      }
    }

    const organization = await dataLoader.get('organizations').load(orgId)
    const {tier} = organization
    if (tier !== 'starter') {
      return standardError(new Error('You must first downgrade before archiving'), {
        userId: viewerId
      })
    }

    // RESOLUTION
    segmentIo.track({
      userId: viewerId,
      event: 'Archive Organization',
      properties: {
        orgId
      }
    })
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
      r
        .table('OrganizationUser')
        .getAll(orgId, {index: 'orgId'})
        .filter({removedAt: null})
        .update({
          removedAt: now
        })
        .run(),
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
