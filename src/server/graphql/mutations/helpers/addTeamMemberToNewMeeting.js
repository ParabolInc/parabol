import {CHECKIN} from 'universal/utils/constants';
import getRethink from 'server/database/rethinkDriver';
import {makeCheckInStage} from 'server/graphql/mutations/helpers/makeCheckinStages';
import createMeetingMember from 'server/graphql/mutations/helpers/createMeetingMember';
import extendMeetingMembersForType from 'server/graphql/mutations/helpers/extendMeetingMembersForType';

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
  const {meetingType, phases} = newMeeting;
  const checkInPhase = phases.find((phase) => phase.phaseType === CHECKIN);
  if (!checkInPhase) return false;

  const {stages} = checkInPhase;
  const newStage = makeCheckInStage(teamMember, meetingId, false);
  stages.push(newStage);
  const meetingMember = createMeetingMember(meetingId, meetingType)(teamMember);
  const [extendedMeetingMember] = extendMeetingMembersForType([meetingMember], dataLoader);
  await r({
    meeting: r.table('NewMeeting')
      .get(meetingId)
      .update({
        phases,
        updatedAt: now
      }),
    member: r.table('MeetingMember').insert(extendedMeetingMember)
  });
  return true;
};

export default addTeamMemberToNewMeeting;
