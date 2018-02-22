import {GraphQLID, GraphQLInterfaceType, GraphQLList, GraphQLNonNull} from 'graphql';
import connectionDefinitions from 'server/graphql/connectionDefinitions';
import GraphQLISO8601Type from 'server/graphql/types/GraphQLISO8601Type';
import NotificationEnum from 'server/graphql/types/NotificationEnum';
import NotifyAddedToTeam from 'server/graphql/types/NotifyAddedToTeam';
import NotifyDenial from 'server/graphql/types/NotifyDenial';
import NotifyFacilitatorDisconnected from 'server/graphql/types/NotifyFacilitatorDisconnected';
import NotifyInviteeApproved from 'server/graphql/types/NotifyInviteeApproved';
import NotifyKickedOut from 'server/graphql/types/NotifyKickedOut';
import NotifyNewTeamMember from 'server/graphql/types/NotifyNewTeamMember';
import NotifyPaymentRejected from 'server/graphql/types/NotifyPaymentRejected';
import NotifyTaskInvolves from 'server/graphql/types/NotifyTaskInvolves';
import NotifyPromoteToOrgLeader from 'server/graphql/types/NotifyPromoteToOrgLeader';
import NotifyRequestNewUser from 'server/graphql/types/NotifyRequestNewUser';
import NotifyTeamArchived from 'server/graphql/types/NotifyTeamArchived';
import NotifyTeamInvite from 'server/graphql/types/NotifyTeamInvite';
import PageInfoDateCursor from 'server/graphql/types/PageInfoDateCursor';

import {
  ADD_TO_TEAM,
  DENY_NEW_USER,
  FACILITATOR_DISCONNECTED,
  INVITEE_APPROVED,
  JOIN_TEAM,
  KICKED_OUT,
  PAYMENT_REJECTED,
  TASK_INVOLVES,
  PROMOTE_TO_BILLING_LEADER,
  REJOIN_TEAM,
  REQUEST_NEW_USER,
  TEAM_ARCHIVED,
  TEAM_INVITE
} from 'universal/utils/constants';

export const notificationInterfaceFields = {
  id: {
    type: GraphQLID,
    description: 'A shortid for the notification'
  },
  orgId: {
    type: GraphQLID,
    description: '*The unique organization ID for this notification. Can be blank for targeted notifications'
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
};

const Notification = new GraphQLInterfaceType({
  name: 'Notification',
  fields: () => notificationInterfaceFields,
  resolveType(value) {
    // type lookup needs to be resolved in a thunk since there is a circular reference when loading
    // alternative to treating it like a DB driver if GCing is an issue
    const resolveTypeLookup = {
      [ADD_TO_TEAM]: NotifyAddedToTeam,
      [DENY_NEW_USER]: NotifyDenial,
      [FACILITATOR_DISCONNECTED]: NotifyFacilitatorDisconnected,
      [INVITEE_APPROVED]: NotifyInviteeApproved,
      [JOIN_TEAM]: NotifyNewTeamMember,
      [KICKED_OUT]: NotifyKickedOut,
      [PAYMENT_REJECTED]: NotifyPaymentRejected,
      [TASK_INVOLVES]: NotifyTaskInvolves,
      [REJOIN_TEAM]: NotifyNewTeamMember,
      [REQUEST_NEW_USER]: NotifyRequestNewUser,
      [TEAM_INVITE]: NotifyTeamInvite,
      [PROMOTE_TO_BILLING_LEADER]: NotifyPromoteToOrgLeader,
      [TEAM_ARCHIVED]: NotifyTeamArchived
    };

    return resolveTypeLookup[value.type];
  }
});

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
});

export const NotificationConnection = connectionType;
export const NotificationEdge = edgeType;
export default Notification;
