import {GraphQLID, GraphQLNonNull, GraphQLObjectType} from 'graphql';
import Notification, {notificationInterfaceFields} from 'server/graphql/types/Notification';
import TeamMember from 'server/graphql/types/TeamMember';

const NotifyFacilitatorDisconnected = new GraphQLObjectType({
  name: 'NotifyFacilitatorDisconnected',
  description: 'A notification sent when a meeting facilitator disconnects',
  interfaces: () => [Notification],
  fields: () => ({
    newFacilitator: {
      type: new GraphQLNonNull(TeamMember),
      description: 'The new meeting facilitator',
      resolve: ({newFacilitatorId}, args, {getDataLoader}) => {
        return getDataLoader().teamMembers.load(newFacilitatorId);
      }
    },
    newFacilitatorId: {
      type: GraphQLID,
      description: 'The team member ID that is the new facilitator'
    },
    oldFacilitator: {
      type: new GraphQLNonNull(TeamMember),
      description: 'The team member that disconnected',
      resolve: ({oldFacilitatorId}, args, {getDataLoader}) => {
        return getDataLoader().teamMembers.load(oldFacilitatorId);
      }
    },
    oldFacilitatorId: {
      type: GraphQLID,
      description: 'The team member ID that disconnected'
    },
    teamId: {
      type: GraphQLID,
      description: 'The teamId of the team running the meeting'
    },
    ...notificationInterfaceFields
  })
});

export default NotifyFacilitatorDisconnected;
