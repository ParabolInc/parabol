import {GraphQLID, GraphQLNonNull} from 'graphql'
import getRethink from '../../database/rethinkDriver'
import ArchiveTeamPayload from '../types/ArchiveTeamPayload'
import {updateAuth0TMS} from '../../utils/auth0Helpers'
import {getUserId, isTeamLead} from '../../utils/authorization'
import publish from '../../utils/publish'
import sendSegmentEvent from '../../utils/sendSegmentEvent'
import shortid from 'shortid'
import standardError from '../../utils/standardError'
import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import {NotificationEnum} from 'parabol-client/types/graphql'
import AuthTokenPayload from '../types/AuthTokenPayload'

export default {
  type: ArchiveTeamPayload,
  args: {
    teamId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The teamId to archive (or delete, if team is unused)'
    }
  },
  async resolve(_source, {teamId}, {authToken, dataLoader, socketId: mutatorId}) {
    const r = getRethink()
    const now = new Date()
    const operationId = dataLoader.share()
    const subOptions = {operationId, mutatorId}

    // AUTH
    const viewerId = getUserId(authToken)
    if (!(await isTeamLead(viewerId, teamId))) {
      return standardError(new Error('Not team lead'), {userId: viewerId})
    }

    // RESOLUTION
    sendSegmentEvent('Archive Team', viewerId, {teamId}).catch()
    const {team, users, removedTeamNotifications, removedSuggestedActionIds} = await r({
      team: r
        .table('Team')
        .get(teamId)
        .update({isArchived: true}, {returnChanges: true})('changes')(0)('new_val')
        .default(null),
      users: r
        .table('TeamMember')
        .getAll(teamId, {index: 'teamId'})
        .filter({isNotRemoved: true})('userId')
        .coerceTo('array')
        .do((userIds) => {
          return r
            .table('User')
            .getAll(r.args(userIds), {index: 'id'})
            .update((user) => ({tms: user('tms').difference([teamId])}), {
              returnChanges: true
            })('changes')('new_val')
            .default([])
        }),
      invitations: r
        .table('TeamInvitation')
        .getAll(teamId, {index: 'teamId'})
        .filter({acceptedAt: null})
        .update((invitation) => ({
          expiresAt: r.min([invitation('expiresAt'), now])
        })),
      removedTeamNotifications: r
        .table('Notification')
        // TODO index
        .filter({teamId})
        .delete({returnChanges: true})('changes')('new_val')
        .default([]),
      removedSuggestedActionIds: r
        .table('SuggestedAction')
        // NOTE: this isn't 100% correct because the person removing the team may not be the
        // person who has the suggested actions, but it saves us from needing an extra index
        .getAll(viewerId, {index: 'userId'})
        .filter({teamId})
        .update(
          {
            removedAt: now
          },
          {returnChanges: true}
        )('changes')('new_val')('id')
        .default([])
    })

    if (!team) {
      return standardError(new Error('Already archived team'), {userId: viewerId})
    }

    const notifications = users
      .map(({id}) => id)
      .filter((userId) => userId !== viewerId)
      .map((notifiedUserId) => ({
        id: shortid.generate(),
        startAt: now,
        type: NotificationEnum.TEAM_ARCHIVED,
        userIds: [notifiedUserId],
        teamId
      }))
    if (notifications.length) {
      await r.table('Notification').insert(notifications)
    }

    const data = {
      teamId,
      notificationIds: notifications.map(({id}) => id),
      removedTeamNotifications,
      removedSuggestedActionIds
    }
    publish(SubscriptionChannel.TEAM, teamId, ArchiveTeamPayload, data, subOptions)

    users.forEach((user) => {
      const {id, tms} = user
      updateAuth0TMS(id, tms)
      publish(SubscriptionChannel.NOTIFICATION, id, AuthTokenPayload, {tms})
    })

    return data
  }
}
