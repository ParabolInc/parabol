import {GraphQLSchema} from 'graphql';
import mutation from './rootMutation';
import query from './rootQuery';
import subscription from './rootSubscription';
import FacilitatorRequestMemo from 'server/graphql/types/FacilitatorRequestMemo';

export default new GraphQLSchema({query, mutation, subscription, types: [FacilitatorRequestMemo]});
