import {GraphQLObjectType} from 'graphql';
import Notification, {notificationInterfaceFields} from 'server/graphql/types/Notification';
import TeamMember from 'server/graphql/types/TeamMember';

const NotifyFacilitatorRequest = new GraphQLObjectType({
  name: 'NotifyFacilitatorRequest',
  description: 'A notification sent by a team member to request to become the facilitator',
  interfaces: () => [Notification],
  fields: () => ({
    requestor: {
      type: TeamMember,
      description: 'The team member that wants to be the facilitator',
      resolve: ({requestorId}, args, {dataLoader}) => {
        return dataLoader.get('teamMembers').load(requestorId);
      }
    },
    ...notificationInterfaceFields
  })
});

export default NotifyFacilitatorRequest;
