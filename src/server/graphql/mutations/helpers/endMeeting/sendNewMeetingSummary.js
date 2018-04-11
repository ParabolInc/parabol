import getRethink from 'server/database/rethinkDriver';
import sendEmailPromise from 'server/email/sendEmail';
import {RETROSPECTIVE} from 'universal/utils/constants';

const getRetroMeeting = (meetingId) => {
  const r = getRethink();
  return r.table('NewMeeting')
    .get(meetingId)
    .merge((meeting) => ({
      meetingMembers: r.table('MeetingMember')
        .getAll(meetingId, {index: 'meetingId'})
        .merge((meetingMember) => ({
          user: r.table('User').get(meetingMember('userId')),
          tasks: r.table('Task')
            .getAll(meeting('teamId'), {index: 'teamId'})
            .filter({
              userId: meetingMember('userId'),
              meetingId
            })
            .coerceTo('array')
        }))
        .coerceTo('array'),
      team: r.table('Team').get(meeting('teamId')),
      reflectionGroups: r.table('RetroReflectionGroup')
        .getAll(meetingId, {index: 'meetingId'})
        .filter({isActive: true})
        .merge((reflectionGroup) => ({
          reflections: r.table('RetroReflection')
            .getAll(reflectionGroup('id'), {index: 'reflectionGroupId'})
            .filter({isActive: true})
            .coerceTo('array')
        }))
        .coerceTo('array')
    }));
};

const meetingGetters = {
  [RETROSPECTIVE]: getRetroMeeting
};

export default async function sendNewMeetingSummary(newMeeting) {
  const {id: meetingId, meetingType, summarySentAt} = newMeeting;
  const r = getRethink();
  if (summarySentAt) return;
  const specificMeeting = await meetingGetters[meetingType](meetingId);
  const emails = specificMeeting.meetingMembers.map((member) => member.user.email);
  const emailString = emails.join(', ');
  const emailSuccess = await sendEmailPromise(emailString, 'newMeetingSummaryEmailCreator', {meeting: specificMeeting});
  if (emailSuccess) {
    const now = new Date();
    await r.table('NewMeeting').get(meetingId).update({summarySentAt: now});
  }
}
