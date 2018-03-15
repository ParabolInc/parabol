import {GraphQLBoolean, GraphQLID, GraphQLNonNull, GraphQLObjectType} from 'graphql';
import TeamMember from 'server/graphql/types/TeamMember';
import {resolveTeamMember} from 'server/graphql/resolvers';
import NewMeetingStage, {newMeetingStageFields} from 'server/graphql/types/NewMeetingStage';

const CheckInStage = new GraphQLObjectType({
  name: 'CheckInStage',
  description: 'A stage that focuses on a single team member',
  interfaces: () => [NewMeetingStage],
  fields: () => ({
    ...newMeetingStageFields(),
    // Note: currently we use the present tag that's on the TeamMember object.
    // we'll switch over as we normalize better
    present: {
      type: GraphQLBoolean,
      description: 'true if the team member is present for the meeting'
    },
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

export default CheckInStage;
