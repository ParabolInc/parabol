import publish from 'server/utils/publish';
import {TEAM} from 'universal/utils/constants';
import PromoteNewMeetingFacilitatorPayload from 'server/graphql/types/PromoteNewMeetingFacilitatorPayload';
import getRethink from 'server/database/rethinkDriver';

const promoteFirstTeamMember = (oldFacilitatorUserId, subOptions) => async (team) => {
  const r = getRethink();
  const now = new Date();
  const {teamId, meetingId} = team;
  await r.table('NewMeeting').get(meetingId).update((meeting) => ({
    facilitatorUserId: r.table('TeamMember')
      .getAll(teamId, {index: 'teamId'})
      .filter({isNotRemoved: true})
      .eqJoin('userId', r.table('User'))
      .zip()
      .filter((row) => row('connectedSockets').count().ge(1))
      .min((row) => row('checkInOrder'))('userId')
      .default(meeting('facilitatorUserId')),
    updatedAt: now
  }), {nonAtomic: true});
  const data = {meetingId, oldFacilitatorUserId};
  publish(TEAM, teamId, PromoteNewMeetingFacilitatorPayload, data, subOptions);
};

export default promoteFirstTeamMember;
