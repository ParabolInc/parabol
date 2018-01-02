import {GraphQLObjectType} from 'graphql';
import {resolveInvitation} from 'server/graphql/resolvers';
import Invitation from 'server/graphql/types/Invitation';

const CancelTeamInvitePayload = new GraphQLObjectType({
  name: 'CancelTeamInvitePayload',
  fields: () => ({
    invitation: {
      type: Invitation,
      description: 'The cancelled invitation',
      resolve: resolveInvitation
    }
  })
});

export default CancelTeamInvitePayload;
