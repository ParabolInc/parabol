import sendAuthRaven from 'server/utils/sendAuthRaven';

export const sendBadAuthTokenError = (authToken, returnValue) => {
  const breadcrumb = {
    message: 'The supplied auth token is invalid',
    category: 'Unauthenticated Access'
  };
  return sendAuthRaven(authToken, 'Bad authentication', breadcrumb, returnValue);
};

export const sendNotAuthenticatedAccessError = (authToken, returnValue) => {
  const breadcrumb = {
    message: 'You must be logged in for this action.',
    category: 'Unauthenticated Access'
  };
  return sendAuthRaven(authToken, 'Not logged in', breadcrumb, returnValue);
};

export const sendOrgAccessError = (authToken, orgId, returnValue) => {
  const breadcrumb = {
    message: `You do not have access to organization ${orgId}`,
    category: 'Unauthorized Access',
    data: {orgId}
  };
  return sendAuthRaven(authToken, 'Not in organization', breadcrumb, returnValue);
};

export const sendTeamAccessError = (authToken, teamId, returnValue) => {
  const breadcrumb = {
    message: `You do not have access to team ${teamId}`,
    category: 'Unauthorized Access',
    data: {teamId}
  };
  return sendAuthRaven(authToken, 'Not on team', breadcrumb, returnValue);
};

export const sendTeamLeadAccessError = (authToken, teamId, returnValue) => {
  const breadcrumb = {
    message: `You are not the team lead for ${teamId}`,
    category: 'Unauthorized Access',
    data: {teamId}
  };
  return sendAuthRaven(authToken, 'Not team lead', breadcrumb, returnValue);
};

export const sendTeamPaidTierError = (authToken, teamId, returnValue) => {
  const breadcrumb = {
    message: 'That feature is not available to teams on the personal plan',
    category: 'Unauthorized Access',
    data: {teamId}
  };
  return sendAuthRaven(authToken, 'Not available', breadcrumb, returnValue);
};

export const sendOrgLeadAccessError = (authToken, userOrgDoc, returnValue) => {
  const orgId = userOrgDoc ? userOrgDoc.id : 'unknown organization';
  const breadcrumb = {
    message: `You are not the billing leader for ${orgId}`,
    category: 'Unauthorized Access',
    data: {orgId}
  };
  return sendAuthRaven(authToken, 'Not billing leader', breadcrumb, returnValue);
};

export const sendOrgLeadOfUserAccessError = (authToken, userId, returnValue) => {
  const breadcrumb = {
    message: `You are not a billing leader for ${userId}`,
    category: 'Unauthorized Access',
    data: {userId}
  };
  return sendAuthRaven(authToken, 'Not billing leader for user', breadcrumb, returnValue);
};


export const sendGitHubAdministratorError = (authToken, nameWithOwner, returnValue) => {
  const breadcrumb = {
    message: `You must be an administrator of ${nameWithOwner} to integrate`,
    category: 'Unauthorized Access',
    data: {nameWithOwner}
  };
  return sendAuthRaven(authToken, 'Not GitHub Administrator', breadcrumb, returnValue);
};

export const sendGitHubPassedThoughError = (authToken, errors, returnValue) => {
  const firstError = Array.isArray(errors) && errors[0].message || 'Unknown GitHub error';
  const breadcrumb = {
    message: firstError,
    category: 'GitHub Error'
  };
  return sendAuthRaven(authToken, 'GitHub Error', breadcrumb, returnValue);
};


export const sendSlackChannelArchivedError = (authToken, name, returnValue) => {
  const breadcrumb = {
    message: `Slack channel ${name} is archived!`,
    category: 'Unauthorized Access',
    data: {name}
  };
  return sendAuthRaven(authToken, 'Slack Channel Archived', breadcrumb, returnValue);
};

export const sendSlackPassedThoughError = (authToken, error, returnValue) => {
  const breadcrumb = {
    message: error,
    category: 'Slack Error'
  };
  return sendAuthRaven(authToken, 'Slack Error', breadcrumb, returnValue);
};

export const sendTeamMemberNotOnTeamError = (authToken, {teamId, userId}) => {
  const breadcrumb = {
    message: 'That user is not active on the team',
    category: 'Team member not active',
    data: {teamId, userId}
  };
  return sendAuthRaven(authToken, 'Well that is weird', breadcrumb);
};

export const sendNotMeetingFacilitatorError = (authToken, userId) => {
  const breadcrumb = {
    message: 'You are not the meeting facilitator',
    category: 'Meeting facilitator',
    data: {userId}
  };
  return sendAuthRaven(authToken, 'Not meeting facilitator', breadcrumb);
};

export const sendInvitationExpiredError = (authToken, inviteToken, returnValue) => {
  const breadcrumb = {
    message: `
              Hey, your invitation expired. Maybe someone already used it or
              it was sitting in your inbox too long.
              Ask your friend for a new one.
            `,
    category: 'Expired',
    data: {inviteToken}
  };
  return sendAuthRaven(authToken, 'Invitation has expired', breadcrumb, returnValue);
};

export const sendInvitationHashFailError = (authToken, inviteToken, returnValue) => {
  const breadcrumb = {
    message: `
              We had difficulty with that link. Did you paste it correctly?
            `,
    category: 'Invalid invitation',
    data: {inviteToken}
  };
  return sendAuthRaven(authToken, 'Invitation invalid', breadcrumb, returnValue);
};

export const sendTeamAlreadyJoinedError = (authToken, inviteToken, returnValue) => {
  const breadcrumb = {
    message: 'Hey, we think you already belong to this team.',
    category: 'Team already joined',
    data: {inviteToken}
  };
  return sendAuthRaven(authToken, 'Team already joined', breadcrumb, returnValue);
};

export const sendPhaseItemNotActiveError = (authToken, retroPhaseItemId, returnValue) => {
  const breadcrumb = {
    message: 'That category is no longer active',
    category: 'Inactive',
    data: {retroPhaseItemId}
  };
  return sendAuthRaven(authToken, 'How did you find an old category?', breadcrumb, returnValue);
};

export const sendReflectionAccessError = (authToken, retroPhaseItemId, returnValue) => {
  const breadcrumb = {
    message: 'That is not your reflection',
    category: 'Reflection access error',
    data: {retroPhaseItemId}
  };
  return sendAuthRaven(authToken, 'Nacho Reflection', breadcrumb, returnValue);
};
