import {GraphQLObjectType} from 'graphql';
import {resolveInvitation} from 'server/graphql/resolvers';
import Invitation from 'server/graphql/types/Invitation';

const InvitationUpdated = new GraphQLObjectType({
  name: 'InvitationUpdated',
  fields: () => ({
    invitation: {
      type: Invitation,
      resolve: resolveInvitation
    }
  })
});

export default InvitationUpdated;
