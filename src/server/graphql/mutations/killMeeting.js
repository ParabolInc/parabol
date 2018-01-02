import {GraphQLID, GraphQLNonNull} from 'graphql';
import getRethink from 'server/database/rethinkDriver';
import UpdateMeetingPayload from 'server/graphql/types/UpdateMeetingPayload';
import {requireTeamMember} from 'server/utils/authorization';
import publish from 'server/utils/publish';
import {LOBBY, MEETING, TEAM, UPDATED} from 'universal/utils/constants';

export default {
  type: UpdateMeetingPayload,
  description: 'Finish a meeting abruptly',
  args: {
    teamId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The team that will be having the meeting'
    }
  },
  async resolve(source, {teamId}, {authToken, socketId: mutatorId, dataLoader}) {
    const r = getRethink();
    const operationId = dataLoader.share();
    const subOptions = {mutatorId, operationId};
    // AUTH
    requireTeamMember(authToken, teamId);

    // RESOLUTION
    // reset the meeting
    const team = await r.table('Team').get(teamId)
      .update({
        facilitatorPhase: LOBBY,
        meetingPhase: LOBBY,
        meetingId: null,
        facilitatorPhaseItem: null,
        meetingPhaseItem: null,
        activeFacilitator: null
      }, {returnChanges: true})('changes')(0)('new_val').default(null);

    if (!team) {
      throw new Error('meeting already updated!');
    }
    publish(TEAM, teamId, UPDATED, {teamId}, subOptions);
    publish(MEETING, teamId, UPDATED, {teamId}, subOptions);
    return {teamId};
  }
};
