import shortid from 'shortid';
import makeSecretToken from '../../../utils/makeSecretToken';
import ms from 'ms';
import sendEmail from '../../../email/sendEmail';
import r from '../../../database/rethinkDriver';

export const getTeamNameInvitedBy = async (teamId, userId) => {
  const promises = [
    r.table('Team').get(teamId).pluck('name'),
    r.table('UserProfile').get(userId).pluck('preferredName')
  ];

  const [{name: teamName}, {preferredName: invitedBy}] = await Promise.all(promises);
  return {teamName, invitedBy};
};

export const resolveSentEmails = async (sendEmailPromises, invitees, invitations) => {
  const inviteeErrors = [];
  const invitationsToStore = [];
  for (let i = 0; i < sendEmailPromises.length; i++) {
    const promise = sendEmailPromises[i];
    const resolvedPromise = await promise;
    if (resolvedPromise) {
      invitationsToStore.push(invitations[i]);
    } else {
      inviteeErrors.push(invitees[i]);
    }
  }
  return {inviteeErrors, invitationsToStore};
};

export const makeInvitations = (invitees, teamId) => {
  const now = new Date();
  const tokenExpiration = Date.now() + ms('30d');
  return invitees.map(invitee => {
    const {email, task, fullName} = invitee;
    return {
      id: shortid.generate(),
      teamId,
      createdAt: now,
      isAccepted: false,
      inviteToken: makeSecretToken(email, tokenExpiration),
      fullName,
      email,
      task
    };
  });
};

export const sendInvitations = (invitedBy, teamName, invitations) => {
  return invitations.map(invitation => {
    const {email, task, fullName, inviteToken} = invitation;
    const emailData = {
      invitedBy,
      teamName,
      inviteToken,
      email,
      task,
      fullName
    };
    return sendEmail('inviteTeamMember', emailData);
  });
};

