import {GraphQLSchema} from 'graphql';
import NotifyPromoteToOrgLeader from 'server/graphql/types/NotifyPromoteToOrgLeader';
import mutation from './rootMutation';
import query from './rootQuery';
import subscription from './rootSubscription';

export default new GraphQLSchema({
  query,
  mutation,
  subscription,
  types: [
    NotifyPromoteToOrgLeader
  ]
});
