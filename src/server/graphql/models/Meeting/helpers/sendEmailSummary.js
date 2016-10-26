import getRethink from 'server/database/rethinkDriver';
import sendEmailPromise from 'server/email/sendEmail';

export default async function sendEmailSummary(meeting, teamMemberId) {
  const {facilitator, id: meetingId, invitees, summarySentAt} = meeting;
  const r = getRethink();
  if (facilitator === teamMemberId && !summarySentAt) {
    // send the summary email
    const userIds = invitees.map((doc) => doc.id.substr(0, doc.id.indexOf('::')));
    const emails = await r.table('User')
      .getAll(r.args(userIds))
      .map((user) => user('email'));
    const emailString = emails.join(', ');
    const emailSuccess = await sendEmailPromise(emailString, 'summaryEmail', {meeting});
    if (emailSuccess) {
      const now = new Date();
      await r.table('Meeting').get(meetingId).update({summarySentAt: now});
    }
  }
}
