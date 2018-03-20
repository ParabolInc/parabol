import {CHECKIN} from 'universal/utils/constants';
import shortid from 'shortid';

export const makeCheckInStage = (teamMember, meetingId) => ({
  id: shortid.generate(),
  meetingId,
  isComplete: false,
  phaseType: CHECKIN,
  teamMemberId: teamMember.id
});

const makeCheckinStages = async (teamId, meetingId, dataLoader) => {
  const teamMembers = await dataLoader.get('teamMembersByTeamId').load(teamId);
  return teamMembers
    .sort((a, b) => a.checkInOrder > b.checkInOrder ? 1 : -1)
    .map((teamMember) => makeCheckInStage(teamMember, meetingId));
};

export default makeCheckinStages;
