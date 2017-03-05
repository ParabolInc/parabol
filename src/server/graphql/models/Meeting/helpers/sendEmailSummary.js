import getRethink from 'server/database/rethinkDriver';
import sendEmailPromise from 'server/email/sendEmail';

export default async function sendEmailSummary(meeting, teamMemberId) {
  const {facilitator, id: meetingId, invitees, summarySentAt} = meeting;
  const r = getRethink();
  if (facilitator === teamMemberId && !summarySentAt) {
    // send the summary email
    const teamMemberIds = invitees.map(({id}) => id);
    const emails = await r.table('TeamMember')
      .getAll(r.args(teamMemberIds))('email');
    const emailString = emails.join(', ');
    const emailSuccess = await sendEmailPromise(emailString, 'summaryEmail', {meeting});
    if (emailSuccess) {
      const now = new Date();
      await r.table('Meeting').get(meetingId).update({summarySentAt: now});
    }
  }
}
