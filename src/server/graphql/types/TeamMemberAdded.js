import {GraphQLObjectType} from 'graphql';
import {resolveInvitation, resolveTeamMember} from 'server/graphql/resolvers';
import Invitation from 'server/graphql/types/Invitation';
import NotifyNewTeamMember from 'server/graphql/types/NotifyNewTeamMember';
import TeamMember from 'server/graphql/types/TeamMember';

const TeamMemberAdded = new GraphQLObjectType({
  name: 'TeamMemberAdded',
  fields: () => ({
    teamMember: {
      type: TeamMember,
      resolve: resolveTeamMember
    },
    notification: {
      type: NotifyNewTeamMember,
      description: 'A notification triggered by a team member being added'
    },
    removedInvitation: {
      type: Invitation,
      description: 'The old invitation that the new team member accepted',
      resolve: resolveInvitation
    }
  })
});

export default TeamMemberAdded;
