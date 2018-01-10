import {GraphQLObjectType} from 'graphql';
import Invitation from 'server/graphql/types/Invitation';

const RemoveInvitationPayload = new GraphQLObjectType({
  name: 'RemoveInvitationPayload',
  fields: () => ({
    invitation: {
      type: Invitation
    }
  })
});

export default RemoveInvitationPayload;
