import {GraphQLBoolean, GraphQLID, GraphQLInterfaceType, GraphQLList, GraphQLNonNull} from 'graphql'
import connectionDefinitions from 'server/graphql/connectionDefinitions'
import GraphQLISO8601Type from 'server/graphql/types/GraphQLISO8601Type'
import NotificationEnum from 'server/graphql/types/NotificationEnum'
import NotifyFacilitatorDisconnected from 'server/graphql/types/NotifyFacilitatorDisconnected'
import NotifyKickedOut from 'server/graphql/types/NotifyKickedOut'
import NotifyPaymentRejected from 'server/graphql/types/NotifyPaymentRejected'
import NotifyTaskInvolves from 'server/graphql/types/NotifyTaskInvolves'
import NotifyPromoteToOrgLeader from 'server/graphql/types/NotifyPromoteToOrgLeader'
import NotifyTeamArchived from 'server/graphql/types/NotifyTeamArchived'
import PageInfoDateCursor from 'server/graphql/types/PageInfoDateCursor'

import {
  FACILITATOR_DISCONNECTED,
  KICKED_OUT,
  PAYMENT_REJECTED,
  PROMOTE_TO_BILLING_LEADER,
  TASK_INVOLVES,
  TEAM_ARCHIVED,
  TEAM_INVITATION
} from 'universal/utils/constants'
import NotificationTeamInvitation from 'server/graphql/types/NotificationTeamInvitation'

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
    type: GraphQLISO8601Type,
    description: 'The datetime to activate the notification & send it to the client'
  },
  type: {
    type: NotificationEnum
  },
  userIds: {
    type: new GraphQLList(new GraphQLNonNull(GraphQLID)),
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
      [FACILITATOR_DISCONNECTED]: NotifyFacilitatorDisconnected,
      [KICKED_OUT]: NotifyKickedOut,
      [PAYMENT_REJECTED]: NotifyPaymentRejected,
      [TASK_INVOLVES]: NotifyTaskInvolves,
      [PROMOTE_TO_BILLING_LEADER]: NotifyPromoteToOrgLeader,
      [TEAM_ARCHIVED]: NotifyTeamArchived,
      [TEAM_INVITATION]: NotificationTeamInvitation
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
