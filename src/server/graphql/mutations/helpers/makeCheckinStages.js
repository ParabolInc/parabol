import {CHECKIN} from 'universal/utils/constants';
import shortid from 'shortid';

export const makeCheckInStage = (teamMember, meetingId, isFirstStage) => ({
  id: shortid.generate(),
  meetingId,
  isComplete: false,
  phaseType: CHECKIN,
  startAt: isFirstStage ? new Date() : undefined,
  teamMemberId: teamMember.id,
  viewCount: 0
});

const makeCheckinStages = async (teamId, meetingId, dataLoader, isFirstPhase) => {
  const teamMembers = await dataLoader.get('teamMembersByTeamId').load(teamId);
  return teamMembers
    .sort((a, b) => a.checkInOrder > b.checkInOrder ? 1 : -1)
    .map((teamMember, idx) => makeCheckInStage(teamMember, meetingId, isFirstPhase && idx === 0));
};

export default makeCheckinStages;
