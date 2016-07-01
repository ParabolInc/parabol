import shortid from 'shortid';
import makeSecretToken from '../../../utils/makeSecretToken';
import ms from 'ms';
import sendEmail from '../../../email/sendEmail';
import r from '../../../database/rethinkDriver';

export const getInviterInfoAndTeamName = async (teamId, userId) => {
  /**
   * (1) Fetch user email and picture link from CachedUser.
   * (2) Rename fields to match TeamInvite email props
   * (3) Join 'UserProfile' to fetch preferredName as inviterName
   * (4) Join Team.name by using teamId as teamName
   */
  return await r.table('CachedUser').get(userId)
    .pluck('id', 'email', 'picture')
    .merge((doc) => ({
      inviterAvatar: doc('picture'),
      inviterEmail: doc('email'),
      inviterName: r.table('UserProfile').get(doc('id'))
        .pluck('preferredName')('preferredName'),
      teamName: r.table('Team').get(teamId)
        .pluck('name')('name'),
    })
  );
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

export const sendInvitations = (inviterInfoAndTeamName, invitations) => {
  return invitations.map(invitation => {
    const emailProps = Object.assign(
      inviterInfoAndTeamName,
      {
        inviteeEmail: invitation.email,
        firstProject: invitation.task,
        // TODO: change me
        inviteLink: `http://action-staging.parabol.co/welcome/invite?token=${invitation.inviteToken}`,
      }
    );
    return sendEmail(invitation.email, 'teamInvite', emailProps);
  });
};
