import {GraphQLBoolean, GraphQLID, GraphQLNonNull} from 'graphql';
import getRethink from 'server/database/rethinkDriver';
import MeetingCheckInPayload from 'server/graphql/types/MeetingCheckInPayload';
import {requireTeamMember} from 'server/utils/authorization';
import publish from 'server/utils/publish';
import {TEAM_MEMBER} from 'universal/utils/constants';

export default {
  type: MeetingCheckInPayload,
  description: 'Check a member in as present or absent',
  args: {
    teamMemberId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The global teamMemberId of the person who is being checked in'
    },
    isCheckedIn: {
      type: GraphQLBoolean,
      description: 'true if the member is present, false if absent, null if undecided'
    }
  },
  async resolve(source, {teamMemberId, isCheckedIn}, {authToken, dataLoader, socketId: mutatorId}) {
    const r = getRethink();
    const operationId = dataLoader.share();
    const subOptions = {mutatorId, operationId};

    // teamMemberId is of format 'userId::teamId'
    const [, teamId] = teamMemberId.split('::');
    requireTeamMember(authToken, teamId);

    // RESOLUTION
    await r.table('TeamMember')
      .get(teamMemberId)
      .update({isCheckedIn});

    const data = {teamMemberId};
    publish(TEAM_MEMBER, teamId, MeetingCheckInPayload, data, subOptions);
    return data;
  }
};
