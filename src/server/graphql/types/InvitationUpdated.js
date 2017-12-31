import {GraphQLObjectType} from 'graphql';
import {resolveInvitation, resolveSub} from 'server/graphql/resolvers';
import Invitation from 'server/graphql/types/Invitation';
import {UPDATED} from 'universal/utils/constants';

const InvitationUpdated = new GraphQLObjectType({
  name: 'InvitationUpdated',
  fields: () => ({
    invitation: {
      type: Invitation,
      resolve: resolveSub(UPDATED, resolveInvitation)
    }
  })
});

export default InvitationUpdated;
