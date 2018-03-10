import {GraphQLSchema} from 'graphql';
import NotifyPromoteToOrgLeader from 'server/graphql/types/NotifyPromoteToOrgLeader';
import mutation from './rootMutation';
import query from './rootQuery';
import subscription from './rootSubscription';
import RetroPhaseItem from 'server/graphql/types/RetroPhaseItem';
import RetrospectiveMeeting from 'server/graphql/types/RetrospectiveMeeting';

export default new GraphQLSchema({
  query,
  mutation,
  subscription,
  types: [
    NotifyPromoteToOrgLeader,
    RetroPhaseItem,
    RetrospectiveMeeting
  ]
});
