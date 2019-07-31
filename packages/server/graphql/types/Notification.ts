import {GraphQLBoolean, GraphQLID, GraphQLInterfaceType, GraphQLList, GraphQLNonNull} from 'graphql'
import connectionDefinitions from '../connectionDefinitions'
import GraphQLISO8601Type from './GraphQLISO8601Type'
import NotificationEnum from './NotificationEnum'
import NotifyKickedOut from './NotifyKickedOut'
import NotifyPaymentRejected from './NotifyPaymentRejected'
import NotifyTaskInvolves from './NotifyTaskInvolves'
import NotifyPromoteToOrgLeader from './NotifyPromoteToOrgLeader'
import NotifyTeamArchived from './NotifyTeamArchived'
import PageInfoDateCursor from './PageInfoDateCursor'
import NotificationTeamInvitation from './NotificationTeamInvitation'
import NotificationMeetingStageTimeLimitEnd from './NotificationMeetingStageTimeLimitEnd'

export const notificationInterfaceFields = {
  id: {
    type: new GraphQLNonNull(GraphQLID),
    description: 'A shortid for the notification'
  },
  isArchived: {
    type: GraphQLBoolean,
    description: 'true if the notification has been archived, else false (or null)'
  },
  orgId: {
    type: GraphQLID,
    description:
      '*The unique organization ID for this notification. Can be blank for targeted notifications'
  },
  startAt: {
    type: new GraphQLNonNull(GraphQLISO8601Type),
    description: 'The datetime to activate the notification & send it to the client'
  },
  type: {
    type: new GraphQLNonNull(NotificationEnum)
  },
  userIds: {
    type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(GraphQLID))),
    description: '*The userId that should see this notification'
  }
}

const Notification = new GraphQLInterfaceType({
  name: 'Notification',
  fields: () => notificationInterfaceFields,
  resolveType (value) {
    // type lookup needs to be resolved in a thunk since there is a circular reference when loading
    // alternative to treating it like a DB driver if GCing is an issue
    const resolveTypeLookup = {
      KICKED_OUT: NotifyKickedOut,
      PAYMENT_REJECTED: NotifyPaymentRejected,
      TASK_INVOLVES: NotifyTaskInvolves,
      PROMOTE_TO_BILLING_LEADER: NotifyPromoteToOrgLeader,
      TEAM_ARCHIVED: NotifyTeamArchived,
      TEAM_INVITATION: NotificationTeamInvitation,
      MEETING_STAGE_TIME_LIMIT_END: NotificationMeetingStageTimeLimitEnd
    }

    return resolveTypeLookup[value.type]
  }
})

const {connectionType, edgeType} = connectionDefinitions({
  nodeType: Notification,
  edgeFields: () => ({
    cursor: {
      type: GraphQLISO8601Type
    }
  }),
  connectionFields: () => ({
    pageInfo: {
      type: PageInfoDateCursor,
      description: 'Page info with cursors coerced to ISO8601 dates'
    }
  })
})

export const NotificationConnection = connectionType
export const NotificationEdge = edgeType
export default Notification
