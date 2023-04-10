import {GraphQLID, GraphQLNonNull, GraphQLObjectType} from 'graphql'
import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import {maybeRemoveRestrictions} from '../../billing/helpers/teamLimitsCheck'
import getRethink from '../../database/rethinkDriver'
import NotificationTeamArchived from '../../database/types/NotificationTeamArchived'
import removeMeetingTemplatesForTeam from '../../postgres/queries/removeMeetingTemplatesForTeam'
import safeArchiveTeam from '../../safeMutations/safeArchiveTeam'
import {getUserId, isSuperUser, isTeamLead} from '../../utils/authorization'
import publish from '../../utils/publish'
import segmentIo from '../../utils/segmentIo'
import standardError from '../../utils/standardError'
import {GQLContext} from '../graphql'

export default {
  type: new GraphQLNonNull(
    new GraphQLObjectType({
      name: 'ArchiveTeamPayload',
      fields: {}
    })
  ),
  args: {
    teamId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The teamId to archive (or delete, if team is unused)'
    }
  },
  async resolve(
    _source: unknown,
    {teamId}: {teamId: string},
    {authToken, dataLoader, socketId: mutatorId}: GQLContext
  ) {
    const r = await getRethink()
    const operationId = dataLoader.share()
    const subOptions = {operationId, mutatorId}

    // AUTH
    const viewerId = getUserId(authToken)
    if (!(await isTeamLead(viewerId, teamId)) && !isSuperUser(authToken)) {
      return standardError(new Error('Not team lead'), {userId: viewerId})
    }

    // RESOLUTION
    segmentIo.track({
      userId: viewerId,
      event: 'Archive Team',
      properties: {
        teamId
      }
    })
    const {team, users, removedSuggestedActionIds} = await safeArchiveTeam(teamId, dataLoader)

    if (!team) {
      return standardError(new Error('Already archived team'), {userId: viewerId})
    }

    // Will convert to PG by Mar 1, 2023
    const teamTemplateIds = (await r
      .table('MeetingTemplate')
      .getAll(teamId, {index: 'teamId'})
      .filter({isActive: true})('id')
      .coerceTo('array')
      .run()) as string[]

    await removeMeetingTemplatesForTeam(teamId)

    const notifications = users
      .map((user) => user?.id)
      .filter((userId) => userId !== undefined && userId !== viewerId)
      .map(
        (notifiedUserId) =>
          new NotificationTeamArchived({userId: notifiedUserId!, teamId, archivorUserId: viewerId})
      )

    if (notifications.length) {
      await r.table('Notification').insert(notifications).run()
    }

    const data = {
      teamId,
      notificationIds: notifications.map(({id}) => id),
      teamTemplateIds,
      removedSuggestedActionIds
    }
    publish(SubscriptionChannel.TEAM, teamId, 'ArchiveTeamPayload', data, subOptions)

    users.forEach((user) => {
      if (!user) return
      const {id, tms} = user
      publish(SubscriptionChannel.NOTIFICATION, id, 'AuthTokenPayload', {tms})
    })

    await maybeRemoveRestrictions(team.orgId, dataLoader)

    return data
  }
}
