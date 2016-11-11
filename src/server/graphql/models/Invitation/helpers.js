import getRethink from 'server/database/rethinkDriver';
import sendEmailPromise from 'server/email/sendEmail';
import makeAppLink from 'server/utils/makeAppLink';
import crypto from 'crypto';
import bcrypt from 'bcrypt';
import promisify from 'es6-promisify';
import {getUserId, requireSUOrTeamMember} from '../authorization';
import {INVITATION_LIFESPAN} from 'server/utils/serverConstants';
import {errorObj} from '../utils';

const INVITE_TOKEN_INVITE_ID_LEN = 6;
const INVITE_TOKEN_KEY_LEN = 8;
const INVITE_TOKEN_KEY_HASH_ROUNDS = parseInt(process.env.INVITE_TOKEN_KEY_HASH_ROUNDS, 10) || 10;

const hash = promisify(bcrypt.hash);
const compare = promisify(bcrypt.compare);

const asciiAlphabet = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-_';
const randomSafeString = (length = 8, chars = asciiAlphabet) => {
  const randomBytes = crypto.randomBytes(length);
  const result = new Array(length);
  let cursor = 0;
  for (let i = 0; i < length; i++) {
    cursor += randomBytes[i];
    result[i] = chars[cursor % chars.length];
  }
  return result.join('');
};

export const makeInviteToken = () =>
  `${randomSafeString(INVITE_TOKEN_INVITE_ID_LEN)}${randomSafeString(INVITE_TOKEN_KEY_LEN)}`;

export const parseInviteToken = (uriTokenString) => ({
  id: uriTokenString.slice(0, INVITE_TOKEN_INVITE_ID_LEN),
  key: uriTokenString.slice(INVITE_TOKEN_INVITE_ID_LEN)
});

export const hashInviteTokenKey = async (uriTokenString) => {
  const {key} = parseInviteToken(uriTokenString);
  return await hash(key, INVITE_TOKEN_KEY_HASH_ROUNDS);
};

export const validateInviteTokenKey = async(key, hashStringToCompare) =>
  await compare(key, hashStringToCompare);

export const getInviterInfoAndTeamName = async(teamId, userId) => {
  const r = getRethink();
  /**
   * (1) Fetch user email and picture link from User.
   * (2) Rename fields to match TeamInvite email props
   * (3) Join Team.name by using teamId as teamName
   */
  return await r.table('User').get(userId)
    .pluck('id', 'email', 'picture', 'preferredName')
    .merge((doc) => ({
      inviterAvatar: doc('picture'),
      inviterEmail: doc('email'),
      inviterName: doc('preferredName'),
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

export const makeInvitationsForDB = async(invitees, teamId, userId) => {
  const now = new Date();
  const invitedBy = `${userId}::${teamId}`;
  const tokenExpiration = new Date(now.valueOf() + INVITATION_LIFESPAN);
  const hashPromises = invitees.map(invitee => hashInviteTokenKey(invitee.inviteToken));
  const hashedTokens = await Promise.all(hashPromises);
  return invitees.map((invitee, idx) => {
    const {email, inviteToken, task, fullName} = invitee;
    const {id} = parseInviteToken(inviteToken);
    return {
      id,
      invitedBy,
      createdAt: now,
      email,
      fullName,
      hashedToken: hashedTokens[idx],
      task,
      teamId,
      tokenExpiration,
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

export const asyncInviteTeam = async (authToken, teamId, invitees) => {
  const r = getRethink();
  const userId = getUserId(authToken);
  const inviteesWithTokens = invitees.map(invitee => ({...invitee, inviteToken: makeInviteToken()}));
  const inviterInfoAndTeamName = await getInviterInfoAndTeamName(teamId, userId);
  const sendEmailPromises = createEmailPromises(inviterInfoAndTeamName, inviteesWithTokens);
  const {inviteesToStore} = await resolveSentEmails(sendEmailPromises, inviteesWithTokens);
  const invitationsForDB = await makeInvitationsForDB(inviteesToStore, teamId, userId);
  // Bulk insert, wait in case something queries the invitation table
  await r.table('Invitation').insert(invitationsForDB);
  return true;
  // TODO generate email to inviter including folks that we couldn't reach
  // if (inviteeErrors.length > 0) {
  // throw errorObj({_error: 'Some invitations were not sent', type: 'inviteSendFail', failedEmails: inviteeErrors});
  // }
};

export const cancelInvitation = async (authToken, inviteId) => {
  const r = getRethink();
  const invite = r.table('Invitation').get(inviteId);
  const {acceptedAt, teamId, tokenExpiration} = invite;
  requireSUOrTeamMember(authToken, teamId);
  const now = new Date();
  const error = {};
  if (acceptedAt) {
    error.type = 'alreadyAccepted';
  } else if (tokenExpiration < now) {
    error.type = 'alreadyExpired';
  }
  if (error.type) {
    // eslint-disable-next-line no-underscore-dangle
    error._error = 'Cannot cancel invitation';
    throw errorObj(error);
  }
  await r.table('Invitation').get(inviteId).update({
    tokenExpiration: new Date(0),
    updatedAt: now
  });
  return invite;
};
