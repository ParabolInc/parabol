// @flow
import {GraphQLID, GraphQLInterfaceType, GraphQLNonNull} from 'graphql';
import {CHECKIN} from 'universal/utils/constants';
import CheckInStage from 'server/graphql/types/CheckInStage';
import {resolveTeamMember} from 'server/graphql/resolvers';
import TeamMember from 'server/graphql/types/TeamMember';

export const newMeetingTeamMemberStageFields = () => ({
  teamMemberId: {
    type: new GraphQLNonNull(GraphQLID),
    description: 'foreign key. use teamMember'
  },
  teamMember: {
    description: 'The team member that is the focus for this phase item',
    type: TeamMember,
    resolve: resolveTeamMember
  }
});

const NewMeetingTeamMemberStage = new GraphQLInterfaceType({
  name: 'NewMeetingTeamMemberStage',
  description:
    'An instance of a meeting phase item. On the client, this usually represents a single view',
  fields: newMeetingTeamMemberStageFields,
  resolveType: ({phaseType}) => {
    const resolveTypeLookup = {
      [CHECKIN]: CheckInStage
    };
    return resolveTypeLookup[phaseType];
  }
});

export default NewMeetingTeamMemberStage;
