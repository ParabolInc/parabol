import {GraphQLObjectType} from 'graphql';
import Invitation from 'server/graphql/types/Invitation';

const AddInvitationPayload = new GraphQLObjectType({
  name: 'AddInvitationPayload',
  fields: () => ({
    invitation: {
      type: Invitation
    }
  })
});

export default AddInvitationPayload;
