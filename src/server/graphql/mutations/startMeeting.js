import {GraphQLID, GraphQLNonNull} from 'graphql';
import getRethink from 'server/database/rethinkDriver';
import {startSlackMeeting} from 'server/graphql/mutations/helpers/notifySlack';
import UpdateMeetingPayload from 'server/graphql/types/UpdateMeetingPayload';
import {requireSUOrTeamMember} from 'server/utils/authorization';
import getPubSub from 'server/utils/getPubSub';
import {errorObj} from 'server/utils/utils';
import shortid from 'shortid';
import {CHECKIN, MEETING_UPDATED} from 'universal/utils/constants';
import convertToProjectContent from 'universal/utils/draftjs/convertToProjectContent';
import getWeekOfYear from 'universal/utils/getWeekOfYear';
import {makeCheckinGreeting, makeCheckinQuestion} from 'universal/utils/makeCheckinGreeting';

export default {
  type: UpdateMeetingPayload,
  description: 'Start a meeting from the lobby',
  args: {
    facilitatorId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The facilitator teamMemberId for this meeting'
    }
  },
  async resolve(source, {facilitatorId}, {authToken, socketId, sharedDataloader, operationId}) {
    const r = getRethink();

    // AUTH
    // facilitatorId is of format 'userId::teamId'
    const [, teamId] = facilitatorId.split('::');
    requireSUOrTeamMember(authToken, teamId);

    // RESOLUTION
    const facilitatorMembership = await r.table('TeamMember').get(facilitatorId);
    if (!facilitatorMembership || !facilitatorMembership.isNotRemoved) {
      throw errorObj({_error: 'facilitator is not active on that team'});
    }

    const now = new Date();
    const meetingId = shortid.generate();
    const week = getWeekOfYear(now);

    const updatedTeam = {
      checkInGreeting: makeCheckinGreeting(week, teamId),
      checkInQuestion: convertToProjectContent(makeCheckinQuestion(week, teamId)),
      meetingId,
      activeFacilitator: facilitatorId,
      facilitatorPhase: CHECKIN,
      facilitatorPhaseItem: 1,
      meetingPhase: CHECKIN,
      meetingPhaseItem: 1
    };
    const {team} = await r({
      team: r.table('Team').get(teamId).update(updatedTeam, {returnChanges: true})('changes')(0)('new_val'),
      meeting: r.table('Meeting').insert({
        id: meetingId,
        createdAt: now,
        meetingNumber: r.table('Meeting')
          .getAll(teamId, {index: 'teamId'})
          .count()
          .add(1),
        teamId,
        teamName: r.table('Team').get(teamId)('name')
      })
    });
    startSlackMeeting(teamId);

    const meetingUpdated = {team};
    sharedDataloader.share(operationId);
    getPubSub().publish(`${MEETING_UPDATED}.${teamId}`, {meetingUpdated, mutatorId: socketId, operationId});
    return {team};
  }
};
