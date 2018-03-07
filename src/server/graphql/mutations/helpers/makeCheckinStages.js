import {CHECKIN} from 'universal/utils/constants';
import shortid from 'shortid';

const makeCheckinStages = async (teamId, meetingId, dataLoader, isFacilitatorPhase) => {
  const teamMembers = await dataLoader.get('teamMembersByTeamId').load(teamId);
  return teamMembers.map((teamMember, idx) => ({
    id: shortid.generate(),
    meetingId,
    isFacilitatorStage: isFacilitatorPhase && idx === 0,
    isComplete: false,
    phaseType: CHECKIN,
    teamMemberId: teamMember.id
  }));
};

export default makeCheckinStages;
