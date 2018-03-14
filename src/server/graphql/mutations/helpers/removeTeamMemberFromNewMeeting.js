import {CHECKIN} from 'universal/utils/constants';
import getRethink from 'server/database/rethinkDriver';
import findStageAfterId from 'universal/utils/meetings/findStageAfterId';
import findStageBeforeId from 'universal/utils/meetings/findStageBeforeId';

const getNextFacilitatorStage = (facilitatorStageId, teamMemberStageId, phases) => {
  const facilitatorOnStage = facilitatorStageId === teamMemberStageId;
  if (!facilitatorOnStage) return facilitatorStageId;
  // get the next stage. if this is the last stage, get the previous one
  const {stage: nextStage} = findStageAfterId(phases, teamMemberStageId) || findStageBeforeId(phases, teamMemberStageId);
  return nextStage;
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
    const nextStage = getNextFacilitatorStage(facilitatorStageId, teamMemberStageId, phases);
    const {id: nextStageId} = nextStage;
    if (nextStage.id !== facilitatorStageId) {
      // mutative
      nextStage.startAt = now;
      nextStage.viewCount = nextStage.viewCount ? nextStage.viewCount + 1 : 1;
    }
    stages.splice(teamMemberStageIdx, 1);
    await r.table('NewMeeting')
      .get(meetingId)
      .update({
        facilitatorStageId: nextStageId,
        phases,
        updatedAt: now
      });
    return true;
  }
  return false;
};

export default removeTeamMemberFromNewMeeting;
