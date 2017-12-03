import {GraphQLNonNull, GraphQLObjectType, GraphQLString} from 'graphql';
import {globalIdField} from 'graphql-relay';
import Notification, {notificationInterfaceFields} from 'server/graphql/types/Notification';
import TeamMember from 'server/graphql/types/TeamMember';

const NotifyFacilitatorRequest = new GraphQLObjectType({
  name: 'NotifyFacilitatorRequest',
  description: 'A notification sent by a team member to request to become the facilitator',
  interfaces: () => [Notification],
  fields: () => ({
    requestorName: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'The name of the team member requesting to become facilitator'
    },
    requestorId: globalIdField('TeamMember', ({requestorId}) => requestorId),
    requestor: {
      type: TeamMember,
      description: 'The team member that wants to be the facilitator',
      resolve: ({requestorId}, args, {getDataLoader}) => {
        return getDataLoader().teamMembers.load(requestorId);
      }
    },
    ...notificationInterfaceFields
  })
});

export default NotifyFacilitatorRequest;
