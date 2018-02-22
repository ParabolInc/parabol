import makeAppLink from 'server/utils/makeAppLink';
import sendEmailPromise from 'server/email/sendEmail';

export default function createEmailPromises(inviterInfoAndTeamName, inviteesWithTokens) {
  return inviteesWithTokens.map((invitee) => {
    const emailProps = {
      ...inviterInfoAndTeamName,
      inviteeEmail: invitee.email,
      inviteeName: invitee.fullName,
      firstTask: invitee.task,
      inviteLink: makeAppLink(`invitation/${invitee.inviteToken}`)
    };
    return sendEmailPromise(emailProps.inviteeEmail, 'teamInvite', emailProps);
  });
}
