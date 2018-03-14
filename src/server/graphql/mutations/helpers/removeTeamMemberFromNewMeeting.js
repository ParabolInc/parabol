import {CHECKIN} from 'universal/utils/constants';
import getRethink from 'server/database/rethinkDriver';
import findStageAfterId from 'universal/utils/meetings/findStageAfterId';
import findStageBeforeId from 'universal/utils/meetings/findStageBeforeId';

const getNextFacilitatorStageId = (facilitatorStageId, teamMemberStageId) => {
  const facilitatorOnStage = facilitatorStageId === teamMemberStageId;
  if (!facilitatorOnStage) return facilitatorStageId;
  // get the next stage. if this is the last stage, get the previous one
  const {stage: nextStage} = findStageAfterId(teamMemberStageId) || findStageBeforeId(teamMemberStageId);
  return nextStage.id;
}
/*
 * NewMeetings have a predefined set of stages, we need to remove it manually
 */
const removeTeamMemberFromNewMeeting = async (teamMemberId, teamId, dataLoader) => {
  const now = new Date();
  const r = getRethink();
  const team = await dataLoader.get('teams').load(teamId);
  const {meetingId} = team;
  if (meetingId) {
    // make sure it's a new meeting
    const newMeeting = await r.table('NewMeeting').get(meetingId).default(null);
    if (!newMeeting) return false;
    const {facilitatorStageId, phases} = newMeeting;
    const checkInPhase = phases.find((phase) => phase.phaseType === CHECKIN);
    if (!checkInPhase) return false;

    const {stages} = checkInPhase;
    const teamMemberStageIdx = stages.findIndex((stage) => stage.teamMemberId === teamMemberId);
    if (teamMemberStageIdx === -1) return false;
    const teamMemberStageId = stages[teamMemberStageIdx].id;
    stages.splice(teamMemberStageIdx, 1);
    await r.table('NewMeeting')
      .get(meetingId)
      .update({
        facilitatorStageId: getNextFacilitatorStageId(facilitatorStageId, teamMemberStageId),
        phases,
        updatedAt: now
      });
    return true;
  }
  return false;
};

export default removeTeamMemberFromNewMeeting;
