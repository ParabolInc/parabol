import {GraphQLID, GraphQLNonNull, GraphQLObjectType} from 'graphql';
import Notification, {notificationInterfaceFields} from 'server/graphql/types/Notification';
import TeamMember from 'server/graphql/types/TeamMember';
import {fromGlobalId} from 'graphql-relay';

const NotifyFacilitatorDisconnected = new GraphQLObjectType({
  name: 'NotifyFacilitatorDisconnected',
  description: 'A notification sent when a meeting facilitator disconnects',
  interfaces: () => [Notification],
  fields: () => ({
    newFacilitator: {
      type: new GraphQLNonNull(TeamMember),
      description: 'The new meeting facilitator',
      resolve: ({newFacilitatorId}, args, {getDataLoader}) => {
        const {id: dbNewFacilitatorId} = fromGlobalId(newFacilitatorId);
        return getDataLoader().teamMembers.load(dbNewFacilitatorId);
      }
    },
    newFacilitatorId: {
      type: GraphQLID,
      description: '(Relay) The team member ID that is the new facilitator'
    },
    oldFacilitator: {
      type: new GraphQLNonNull(TeamMember),
      description: 'The team member that disconnected',
      resolve: ({oldFacilitatorId}, args, {getDataLoader}) => {
        const {id: dbOldFacilitatorId} = fromGlobalId(oldFacilitatorId);
        return getDataLoader().teamMembers.load(dbOldFacilitatorId);
      }
    },
    oldFacilitatorId: {
      type: GraphQLID,
      description: '(Relay) The team member ID that disconnected'
    },
    teamId: {
      type: GraphQLID,
      description: 'The teamId of the team running the meeting'
    },
    ...notificationInterfaceFields
  })
});

export default NotifyFacilitatorDisconnected;
