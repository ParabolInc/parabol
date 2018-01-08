import {GraphQLNonNull, GraphQLObjectType} from 'graphql';
import {resolveTeam} from 'server/graphql/resolvers';
import Notification, {notificationInterfaceFields} from 'server/graphql/types/Notification';
import Team from 'server/graphql/types/Team';
import TeamMember from 'server/graphql/types/TeamMember';

const NotifyFacilitatorDisconnected = new GraphQLObjectType({
  name: 'NotifyFacilitatorDisconnected',
  description: 'A notification sent when a meeting facilitator disconnects',
  interfaces: () => [Notification],
  fields: () => ({
    newFacilitator: {
      type: new GraphQLNonNull(TeamMember),
      description: 'The new meeting facilitator',
      resolve: ({newFacilitatorId}, args, {dataLoader}) => {
        return dataLoader.get('teamMembers').load(newFacilitatorId);
      }
    },
    oldFacilitator: {
      type: new GraphQLNonNull(TeamMember),
      description: 'The team member that disconnected',
      resolve: ({oldFacilitatorId}, args, {dataLoader}) => {
        return dataLoader.get('teamMembers').load(oldFacilitatorId);
      }
    },
    team: {
      type: Team,
      description: 'The team running the meeting',
      resolve: resolveTeam
    },
    ...notificationInterfaceFields
  })
});

export default NotifyFacilitatorDisconnected;
