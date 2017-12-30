import {GraphQLID, GraphQLNonNull, GraphQLObjectType, GraphQLString} from 'graphql';
import {resolveTeam} from 'server/graphql/resolvers';
import Notification, {notificationInterfaceFields} from 'server/graphql/types/Notification';
import Team from 'server/graphql/types/Team';

const NotifyNewTeamMember = new GraphQLObjectType({
  name: 'NotifyNewTeamMember',
  description: 'A notification sent to someone who was just added to a team',
  interfaces: () => [Notification],
  fields: () => ({
    ...notificationInterfaceFields,
    // inviterName: {
    //  type: new GraphQLNonNull(GraphQLString),
    //  description: 'The name of the person that invited them onto the team'
    // },
    teamId: {
      type: GraphQLID,
      description: 'The id of the team'
    },
    teamName: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'The name of the team the user is joining',
      deprecatedReason: 'Use team.name instead'
    },
    team: {
      type: Team,
      description: 'The team the invitee just joined',
      resolve: resolveTeam
    },
    preferredName: {
      type: GraphQLString,
      description: 'The name of the person that joined/rejoined the team'
    }
  })
});

export default NotifyNewTeamMember;
