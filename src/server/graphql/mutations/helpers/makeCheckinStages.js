import {CHECKIN} from 'universal/utils/constants';
import shortid from 'shortid';

export const makeCheckInStage = (teamMember, meetingId, isFacilitatorStage) => ({
  id: shortid.generate(),
  meetingId,
  isFacilitatorStage,
  isComplete: false,
  phaseType: CHECKIN,
  teamMemberId: teamMember.id
});

const makeCheckinStages = async (teamId, meetingId, dataLoader, isFacilitatorPhase) => {
  const teamMembers = await dataLoader.get('teamMembersByTeamId').load(teamId);
  return teamMembers
    .sort((a, b) => a.checkInOrder > b.checkInOrder ? 1 : -1)
    .map((teamMember, idx) => makeCheckInStage(teamMember, meetingId, isFacilitatorPhase && idx === 0));
};

export default makeCheckinStages;
