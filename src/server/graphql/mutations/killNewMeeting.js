import {GraphQLID, GraphQLNonNull} from 'graphql';
import getRethink from 'server/database/rethinkDriver';
import {isTeamMember} from 'server/utils/authorization';
import publish from 'server/utils/publish';
import {TEAM} from 'universal/utils/constants';
import {sendTeamAccessError} from 'server/utils/authorizationErrors';
import KillNewMeetingPayload from 'server/graphql/types/KillNewMeetingPayload';
import {sendMeetingNotFoundError} from 'server/utils/docNotFoundErrors';

export default {
  type: KillNewMeetingPayload,
  description: 'Finish a new meeting abruptly',
  args: {
    meetingId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The meeting to kill'
    }
  },
  async resolve(source, {meetingId}, {authToken, socketId: mutatorId, dataLoader}) {
    const r = getRethink();
    const operationId = dataLoader.share();
    const subOptions = {mutatorId, operationId};
    const now = new Date();
    // AUTH
    const meeting = await r.table('NewMeeting').get(meetingId).default(null);
    if (!meeting) return sendMeetingNotFoundError(authToken, meetingId);
    const {teamId} = meeting;
    if (!isTeamMember(authToken, teamId)) return sendTeamAccessError(authToken, teamId);

    // RESOLUTION
    // reset the meeting
    await r({
      team: r.table('Team').get(teamId)
        .update({
          meetingId: null
        }),
      meeting: r.table('NewMeeting').get(meetingId)
        .update({
          endAt: now
        })
    });

    const data = {meetingId, teamId};
    publish(TEAM, teamId, KillNewMeetingPayload, data, subOptions);
    return data;
  }
};
