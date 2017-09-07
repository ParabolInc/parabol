import {GraphQLID, GraphQLInterfaceType, GraphQLList, GraphQLNonNull} from 'graphql';
import {connectionDefinitions} from 'graphql-relay';
import GraphQLISO8601Type from 'server/graphql/types/GraphQLISO8601Type';
import NotificationEnum from 'server/graphql/types/NotificationEnum';
import NotifyAddedToTeam from 'server/graphql/types/NotifyAddedToTeam';
import NotifyDenial from 'server/graphql/types/NotifyDenial';
import NotifyFacilitatorRequest from 'server/graphql/types/NotifyFacilitatorRequest';
import NotifyInvitation from 'server/graphql/types/NotifyInvitation';
import NotifyPayment from 'server/graphql/types/NotifyPayment';
import NotifyPromotion from 'server/graphql/types/NotifyPromotion';
import NotifyTeamArchived from 'server/graphql/types/NotifyTeamArchived';
import NotifyTrial from 'server/graphql/types/NotifyTrial';
import {
  ADD_TO_TEAM,
  DENY_NEW_USER,
  FACILITATOR_REQUEST,
  PAYMENT_REJECTED,
  PROMOTE_TO_BILLING_LEADER,
  REQUEST_NEW_USER,
  TEAM_ARCHIVED,
  TEAM_INVITE,
  TRIAL_EXPIRED,
  TRIAL_EXPIRES_SOON
} from 'universal/utils/constants';

const resolveTypeLookup = {
  [ADD_TO_TEAM]: NotifyAddedToTeam,
  [DENY_NEW_USER]: NotifyDenial,
  [FACILITATOR_REQUEST]: NotifyFacilitatorRequest,
  [PAYMENT_REJECTED]: NotifyPayment,
  [REQUEST_NEW_USER]: NotifyInvitation,
  [TEAM_INVITE]: NotifyInvitation,
  [TRIAL_EXPIRES_SOON]: NotifyTrial,
  [TRIAL_EXPIRED]: NotifyTrial,
  [PROMOTE_TO_BILLING_LEADER]: NotifyPromotion,
  [TEAM_ARCHIVED]: NotifyTeamArchived
};

const Notification = new GraphQLInterfaceType({
  name: 'Notification',
  fields: () => ({
    id: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The unique notification id (shortid)'
    },
    type: {
      type: NotificationEnum
    },
    orgId: {
      type: GraphQLID,
      description: '*The unique organization ID for this notification. Can be blank for targeted notifications'
    },
    startAt: {
      type: GraphQLISO8601Type,
      description: 'The datetime to activate the notification & send it to the client'
    },
    userIds: {
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(GraphQLID))),
      description: '*The userId that should see this notification'
    }
  }),
  resolveType(value) {
    return resolveTypeLookup[value.type];
  }
});

const {connectionType, edgeType} = connectionDefinitions({
  nodeType: Notification
});

export const NotificationConnection = connectionType;
export const NotificationEdge = edgeType;
export default Notification;
