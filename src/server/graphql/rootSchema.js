import {GraphQLSchema} from 'graphql';
//import UserMemoPayload from 'server/graphql/types/UserMemoPayload';
import AddToTeamMemo from 'server/graphql/types/AddToTeamMemo';
import FacilitatorRequestMemo from 'server/graphql/types/FacilitatorRequestMemo';
import mutation from './rootMutation';
import query from './rootQuery';
import subscription from './rootSubscription';

export default new GraphQLSchema({
  query,
  mutation,
  subscription,
  types: [
    AddToTeamMemo,
    FacilitatorRequestMemo
  ]
});
