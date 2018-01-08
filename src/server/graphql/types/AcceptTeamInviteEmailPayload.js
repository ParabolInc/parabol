import {GraphQLID, GraphQLObjectType} from 'graphql';
import AcceptTeamInviteError from 'server/graphql/types/AcceptTeamInviteError';
import AcceptTeamInvitePayload from 'server/graphql/types/AcceptTeamInvitePayload';
import {acceptTeamInviteFields} from 'server/graphql/types/AcceptTeamInvitePayload';

const AcceptTeamInviteEmailPayload = new GraphQLObjectType({
  name: 'AcceptTeamInviteEmailPayload',
  interfaces: [AcceptTeamInvitePayload],
  fields: () => ({
    ...acceptTeamInviteFields,
    authToken: {
      type: GraphQLID,
      description: 'The new JWT'
    },
    error: {
      type: AcceptTeamInviteError,
      description: 'The error encountered while accepting a team invite'
    }
  })
});

export default AcceptTeamInviteEmailPayload;
