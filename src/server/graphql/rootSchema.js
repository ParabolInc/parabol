/* eslint-disable no-undef */
import {GraphQLSchema} from 'graphql';
import NotifyDenial from 'server/graphql/types/NotifyDenial';
import NotifyFacilitatorRequest from 'server/graphql/types/NotifyFacilitatorRequest';
import NotifyInvitation from 'server/graphql/types/NotifyInvitation';
import NotifyNewTeamMember from 'server/graphql/types/NotifyNewTeamMember';
import NotifyPayment from 'server/graphql/types/NotifyPayment';
import NotifyPromotion from 'server/graphql/types/NotifyPromotion';
import NotifyTeamArchived from 'server/graphql/types/NotifyTeamArchived';
import mutation from './rootMutation';
import query from './rootQuery';
import subscription from './rootSubscription';
import NotifyKickedOut from 'server/graphql/types/NotifyKickedOut';

export default new GraphQLSchema({
  query,
  mutation,
  subscription,
  types: [
    NotifyDenial,
    NotifyFacilitatorRequest,
    NotifyInvitation,
    NotifyKickedOut,
    NotifyNewTeamMember,
    NotifyPayment,
    NotifyPromotion,
    NotifyTeamArchived
  ]
});
