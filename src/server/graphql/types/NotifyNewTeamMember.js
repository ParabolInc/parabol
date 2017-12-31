import {GraphQLObjectType, GraphQLString} from 'graphql';
import {resolveTeam, resolveTeamMember} from 'server/graphql/resolvers';
import Notification, {notificationInterfaceFields} from 'server/graphql/types/Notification';
import Team from 'server/graphql/types/Team';
import TeamMember from 'server/graphql/types/TeamMember';

const NotifyNewTeamMember = new GraphQLObjectType({
  name: 'NotifyNewTeamMember',
  description: 'A notification sent to someone who was just added to a team',
  interfaces: () => [Notification],
  fields: () => ({
    ...notificationInterfaceFields,
    team: {
      type: Team,
      description: 'The team the invitee just joined',
      resolve: resolveTeam
    },
    teamMember: {
      type: TeamMember,
      description: 'The team member that joined/rejoined the team',
      resolve: resolveTeamMember
    },
    preferredName: {
      type: GraphQLString,
      description: 'The name of the person that joined/rejoined the team'
    }
  })
});

export default NotifyNewTeamMember;
