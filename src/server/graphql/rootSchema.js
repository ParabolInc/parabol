/* eslint-disable no-undef */
import {GraphQLSchema} from 'graphql';
import NotifyAddedToTeam from 'server/graphql/types/NotifyAddedToTeam';
import NotifyFacilitatorRequest from 'server/graphql/types/NotifyFacilitatorRequest';
import mutation from './rootMutation';
import query from './rootQuery';
import subscription from './rootSubscription';
import NotifyInvitation from 'server/graphql/types/NotifyInvitation';
import NotifyTeamArchived from 'server/graphql/types/NotifyTeamArchived';
import NotifyPromotion from 'server/graphql/types/NotifyPromotion';
import NotifyPayment from 'server/graphql/types/NotifyPayment';
import NotifyDenial from 'server/graphql/types/NotifyDenial';
import NotifyTrial from 'server/graphql/types/NotifyTrial';

export default new GraphQLSchema({
  query,
  mutation,
  subscription,
  types: [
    NotifyAddedToTeam,
    NotifyDenial,
    NotifyFacilitatorRequest,
    NotifyInvitation,
    NotifyPayment,
    NotifyPromotion,
    NotifyTeamArchived,
    NotifyTrial
  ]
});
