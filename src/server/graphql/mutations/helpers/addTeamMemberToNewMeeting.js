import {CHECKIN} from 'universal/utils/constants';
import getRethink from 'server/database/rethinkDriver';
import {makeCheckInStage} from 'server/graphql/mutations/helpers/makeCheckinStages';

/*
 * NewMeetings have a predefined set of stages, we need to add the new team member manually
 */
const addTeamMemberToNewMeeting = async (teamMember, teamId, dataLoader) => {
  const now = new Date();
  const r = getRethink();
  const team = await dataLoader.get('teams').load(teamId);
  const {meetingId} = team;
  if (!meetingId) return false;
  // make sure it's a new meeting
  const newMeeting = await r.table('NewMeeting').get(meetingId).default(null);
  if (!newMeeting) return false;
  const {phases} = newMeeting;
  const checkInPhase = phases.find((phase) => phase.phaseType === CHECKIN);
  if (!checkInPhase) return false;

  const {stages} = checkInPhase;
  const newStage = makeCheckInStage(teamMember, meetingId, false);
  stages.push(newStage);
  await r.table('NewMeeting')
    .get(meetingId)
    .update({
      phases,
      updatedAt: now
    });
  return true;
};

export default addTeamMemberToNewMeeting;
