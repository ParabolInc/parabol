import {GraphQLSchema} from 'graphql';
//import UserMemoPayload from 'server/graphql/types/UserMemoPayload';
import NotifyAddedToTeam from 'server/graphql/types/NotifyAddedToTeam';
import NotifyFacilitatorRequest from 'server/graphql/types/NotifyFacilitatorRequest';
import mutation from './rootMutation';
import query from './rootQuery';
import subscription from './rootSubscription';

export default new GraphQLSchema({
  query,
  mutation,
  subscription,
  types: [
    NotifyAddedToTeam,
    NotifyFacilitatorRequest
  ]
});
