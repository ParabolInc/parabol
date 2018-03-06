import {GraphQLID, GraphQLNonNull, GraphQLObjectType} from 'graphql';
import TeamMember from 'server/graphql/types/TeamMember';
import {resolveTeamMember} from 'server/graphql/resolvers';
import NewMeetingStage, {newMeetingStageFields} from 'server/graphql/types/NewMeetingStage';

const TeamMemberStage = new GraphQLObjectType({
  name: 'TeamMemberStage',
  description: 'A stage that ',
  interfaces: () => [NewMeetingStage],
  fields: () => ({
    ...newMeetingStageFields(),
    teamMemberId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'foreign key. use teamMember'
    },
    teamMember: {
      description: 'The team member that is the focus for this phase item',
      type: TeamMember,
      resolve: resolveTeamMember
    }
  })
});

export default TeamMemberStage;
