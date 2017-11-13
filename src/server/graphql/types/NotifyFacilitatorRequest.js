import {GraphQLID, GraphQLNonNull, GraphQLObjectType, GraphQLString} from 'graphql';
import Notification, {notificationInterfaceFields} from 'server/graphql/types/Notification';
import TeamMember from 'server/graphql/types/TeamMember';
import {fromGlobalId} from 'graphql-relay';

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
      description: '(Relay) The teamMemberId of the requestor'
    },
    requestor: {
      type: TeamMember,
      description: 'The team member that wants to be the facilitator',
      resolve: ({requestorId}, args, {sharedDataloader, operationId}) => {
        const {id: dbRequestorId} = fromGlobalId(requestorId);
        const dataloader = sharedDataloader.get(operationId);
        return dataloader.teamMembers.load(dbRequestorId);
      }
    },
    ...notificationInterfaceFields
  })
});

export default NotifyFacilitatorRequest;
