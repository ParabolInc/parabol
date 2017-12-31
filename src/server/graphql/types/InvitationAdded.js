import {GraphQLObjectType} from 'graphql';
import {resolveInvitation, resolveSub} from 'server/graphql/resolvers';
import Invitation from 'server/graphql/types/Invitation';
import {ADDED} from 'universal/utils/constants';

const InvitationAdded = new GraphQLObjectType({
  name: 'InvitationAdded',
  fields: () => ({
    invitation: {
      type: Invitation,
      resolve: resolveSub(ADDED, resolveInvitation)
    }
  })
});

export default InvitationAdded;
