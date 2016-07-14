import ms from 'ms';
import r from '../../../database/rethinkDriver';
import sendEmailPromise from '../../../email/sendEmail';
import {hashToken} from '../../../utils/inviteTokens';
import makeAppLink from '../../../utils/makeAppLink';

export const getInviterInfoAndTeamName = async(teamId, userId) => {
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
    }));
};

// can't use Promise.all because we want to try n+1, even if n was an error. we're not quitters!
export const resolveSentEmails = async(sendEmailPromises, inviteesWithTokens) => {
  const inviteeErrors = [];
  const inviteesToStore = [];
  for (let i = 0; i < sendEmailPromises.length; i++) {
    const promise = sendEmailPromises[i];
    const invitee = inviteesWithTokens[i];
    const resolvedPromise = await promise;
    const arrayToFill = resolvedPromise ? inviteesToStore : inviteeErrors;
    arrayToFill.push(invitee);
  }
  return {inviteeErrors, inviteesToStore};
};

export const makeInvitationsForDB = async (invitees, teamId) => {
  const now = new Date();
  const tokenExpiration = now.valueOf() + ms('30d');
  return invitees.map((invitee) => {
    const {email, inviteToken, fullName, task} = invitee;
    return {
      id: inviteToken,
      teamId,
      createdAt: now,
      isAccepted: false,
      fullName,
      email,
      task,
      tokenExpiration,
      hashedToken: hashToken(inviteToken)
    };
  });
};

export const createEmailPromises = (inviterInfoAndTeamName, inviteesWithTokens) => {
  return inviteesWithTokens.map(invitee => {
    const emailProps = {
      ...inviterInfoAndTeamName,
      inviteeEmail: invitee.email,
      firstProject: invitee.task,
      inviteLink: makeAppLink(`invitation/${invitee.inviteToken}`)
    };
    return sendEmailPromise(emailProps.inviteeEmail, 'teamInvite', emailProps);
  });
};
