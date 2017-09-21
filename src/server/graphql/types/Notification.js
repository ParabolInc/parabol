import {GraphQLID, GraphQLInterfaceType, GraphQLList, GraphQLNonNull} from 'graphql';
import {globalIdField} from 'graphql-relay';
import connectionDefinitions from 'server/graphql/connectionDefinitions';
import GraphQLISO8601Type from 'server/graphql/types/GraphQLISO8601Type';
import NotificationEnum from 'server/graphql/types/NotificationEnum';
import NotifyDenial from 'server/graphql/types/NotifyDenial';
import NotifyFacilitatorRequest from 'server/graphql/types/NotifyFacilitatorRequest';
import NotifyInvitation from 'server/graphql/types/NotifyInvitation';
import NotifyNewTeamMember from 'server/graphql/types/NotifyNewTeamMember';
import NotifyPayment from 'server/graphql/types/NotifyPayment';
import NotifyPromotion from 'server/graphql/types/NotifyPromotion';
import NotifyTeamArchived from 'server/graphql/types/NotifyTeamArchived';
import NotifyTrial from 'server/graphql/types/NotifyTrial';
import NotifyAddedToTeam from 'server/graphql/types/NotifyAddedToTeam';

import {
  ADD_TO_TEAM,
  DENY_NEW_USER,
  FACILITATOR_REQUEST,
  INVITEE_APPROVED,
  JOIN_TEAM,
  KICKED_OUT,
  PAYMENT_REJECTED,
  PROMOTE_TO_BILLING_LEADER,
  REJOIN_TEAM,
  REQUEST_NEW_USER,
  TEAM_ARCHIVED,
  TEAM_INVITE,
  TRIAL_EXPIRED,
  TRIAL_EXPIRES_SOON
} from 'universal/utils/constants';
import NotifyKickedOut from 'server/graphql/types/NotifyKickedOut';

const resolveTypeLookup = {
  [ADD_TO_TEAM]: NotifyAddedToTeam,
  [DENY_NEW_USER]: NotifyDenial,
  [FACILITATOR_REQUEST]: NotifyFacilitatorRequest,
  [INVITEE_APPROVED]: NotifyInvitation,
  [JOIN_TEAM]: NotifyNewTeamMember,
  [KICKED_OUT]: NotifyKickedOut,
  [PAYMENT_REJECTED]: NotifyPayment,
  [REJOIN_TEAM]: NotifyNewTeamMember,
  [REQUEST_NEW_USER]: NotifyInvitation,
  [TEAM_INVITE]: NotifyInvitation,
  [TRIAL_EXPIRES_SOON]: NotifyTrial,
  [TRIAL_EXPIRED]: NotifyTrial,
  [PROMOTE_TO_BILLING_LEADER]: NotifyPromotion,
  [TEAM_ARCHIVED]: NotifyTeamArchived
};

export const notificationInterfaceFields = {
  id: globalIdField('Notification', ({id}) => id),
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
    return resolveTypeLookup[value.type];
  }
});

const {connectionType, edgeType} = connectionDefinitions({
  nodeType: Notification,
  edgeFields: () => ({
    cursor: {
      type: GraphQLISO8601Type
    }
  })
});

export const NotificationConnection = connectionType;
export const NotificationEdge = edgeType;
export default Notification;
