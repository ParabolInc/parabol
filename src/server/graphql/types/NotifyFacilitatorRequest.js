import {GraphQLID, GraphQLNonNull, GraphQLObjectType, GraphQLString} from 'graphql';
import Notification from 'server/graphql/types/Notification';
import NotificationEnum from 'server/graphql/types/NotificationEnum';

const NotifyFacilitatorRequest = new GraphQLObjectType({
  name: 'NotifyFacilitatorRequest',
  description: 'A notification sent by a team member to request to become the facilitator',
  interfaces: () => [Notification],
  fields: () => ({
    requestorName: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'The name of the team member requesting to become facilitator'
    },
    requestorId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The teamMemberId of the requestor'
    },
    type: {
      type: new GraphQLNonNull(NotificationEnum)
    }
  })
});

export default NotifyFacilitatorRequest;
