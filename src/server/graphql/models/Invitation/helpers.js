import shortid from 'shortid';
import ms from 'ms';
import r from '../../../database/rethinkDriver';
import sendEmail from '../../../email/sendEmail';
import makeAppLink from '../../../utils/makeAppLink';
import crypto from 'crypto';
import bcrypt from 'bcrypt';
import promisify from 'es6-promisify';

const hash = promisify(bcrypt.hash);

const asciiAlphabet = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
export const randomSafeString = (length = 8, chars = asciiAlphabet) => {
  const randomBytes = crypto.randomBytes(length);
  const result = new Array(length);
  let cursor = 0;
  for (let i = 0; i < length; i++) {
    cursor += randomBytes[i];
    result[i] = chars[cursor % chars.length];
  }
  return result.join('');
};

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
      })
    );
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

export const makeInvitationsForDB = async(invitees, teamId) => {
  const now = new Date();
  const tokenExpiration = now.valueOf() + ms('30d');
  // Turn to 12 for deployment, increase by 1 ~every 2 years
  const hashPromises = invitees.map(invitee => hash(invitee.inviteToken, 10));
  const hashedTokens = await Promise.all(hashPromises);
  return invitees.map(invitee => {
    const {email, task, fullName} = invitee;
    return {
      id: shortid.generate(),
      teamId,
      createdAt: now,
      isAccepted: false,
      fullName,
      email,
      task,
      tokenExpiration,
      hashedToken: hashedTokens[i]
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
    return sendEmail(emailProps.inviteeEmail, 'teamInvite', emailProps);
  });
};
