import {GraphQLBoolean, GraphQLObjectType} from 'graphql';
import NewMeetingStage, {newMeetingStageFields} from 'server/graphql/types/NewMeetingStage';
import NewMeetingTeamMemberStage, {newMeetingTeamMemberStageFields} from 'server/graphql/types/NewMeetingTeamMemberStage';

const CheckInStage = new GraphQLObjectType({
  name: 'CheckInStage',
  description: 'A stage that focuses on a single team member',
  interfaces: () => [NewMeetingStage, NewMeetingTeamMemberStage],
  fields: () => ({
    ...newMeetingStageFields(),
    ...newMeetingTeamMemberStageFields(),
    // Note: currently we use the present tag that's on the TeamMember object.
    // we'll switch over as we normalize better
    present: {
      type: GraphQLBoolean,
      description: 'true if the team member is present for the meeting'
    }
  })
});

export default CheckInStage;
