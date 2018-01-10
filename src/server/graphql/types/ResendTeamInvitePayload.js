import {GraphQLObjectType} from 'graphql';
import {resolveInvitation} from 'server/graphql/resolvers';
import Invitation from 'server/graphql/types/Invitation';

const ResendTeamInvitePayload = new GraphQLObjectType({
  name: 'ResendTeamInvitePayload',
  fields: () => ({
    invitation: {
      type: Invitation,
      resolve: resolveInvitation
    }
  })
});

export default ResendTeamInvitePayload;
