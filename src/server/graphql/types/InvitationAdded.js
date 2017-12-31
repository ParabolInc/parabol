import {GraphQLObjectType} from 'graphql';
import {resolveInvitation} from 'server/graphql/resolvers';
import Invitation from 'server/graphql/types/Invitation';

const InvitationAdded = new GraphQLObjectType({
  name: 'InvitationAdded',
  fields: () => ({
    invitation: {
      type: Invitation,
      resolve: resolveInvitation
    }
  })
});

export default InvitationAdded;
