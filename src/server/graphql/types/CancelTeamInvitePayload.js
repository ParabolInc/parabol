import {GraphQLID, GraphQLObjectType} from 'graphql';
import Invitation from 'server/graphql/types/Invitation';

const CancelTeamInvitePayload = new GraphQLObjectType({
  name: 'CancelTeamInvitePayload',
  fields: () => ({
    invitation: {
      type: Invitation,
      description: 'The cancelled invitation'
    },
    deletedNotificationId: {
      type: GraphQLID,
      description: 'IDs of notifications deleted'
    }
  })
});

export default CancelTeamInvitePayload;
