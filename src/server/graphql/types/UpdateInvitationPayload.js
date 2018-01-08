import {GraphQLObjectType} from 'graphql';
import Invitation from 'server/graphql/types/Invitation';

const UpdateInvitationPayload = new GraphQLObjectType({
  name: 'UpdateInvitationPayload',
  fields: () => ({
    invitation: {
      type: Invitation
    }
  })
});

export default UpdateInvitationPayload;
