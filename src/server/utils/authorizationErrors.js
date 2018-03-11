import sendSentryEvent from 'server/utils/sendSentryEvent';

export const sendNotAuthenticatedAccessError = (authToken, returnValue) => {
  const message = 'You must be logged in for this action.';
  const breadcrumb = {
    message,
    category: 'Unauthenticated Access'
  };
  sendSentryEvent(authToken, breadcrumb);
  return returnValue !== undefined ? returnValue : {
    title: 'Not logged in',
    message
  };
};
export const sendOrgAccessError = (authToken, orgId, returnValue) => {
  const message = `You do not have access to organization ${orgId}`;
  const breadcrumb = {
    message,
    category: 'Unauthorized Access',
    data: {orgId}
  };
  sendSentryEvent(authToken, breadcrumb);
  return returnValue !== undefined ? returnValue : {
    title: 'Not in organization',
    message
  };
};
export const sendTeamAccessError = (authToken, teamId, returnValue) => {
  const message = `You do not have access to team ${teamId}`;
  const breadcrumb = {
    message,
    category: 'Unauthorized Access',
    data: {teamId}
  };
  sendSentryEvent(authToken, breadcrumb);
  return returnValue !== undefined ? returnValue : {
    title: 'Not on team',
    message
  };
};
export const sendTeamLeadAccessError = (authToken, teamId, returnValue) => {
  const message = `You are not the team lead for ${teamId}`;
  const breadcrumb = {
    message,
    category: 'Unauthorized Access',
    data: {teamId}
  };
  sendSentryEvent(authToken, breadcrumb);
  return returnValue !== undefined ? returnValue : {
    title: 'Not team lead',
    message
  };
};
export const sendOrgLeadAccessError = (authToken, userOrgDoc, returnValue) => {
  const orgId = userOrgDoc ? userOrgDoc.id : 'unknown organization';
  const message = `You are not the billing leader for ${orgId}`;
  const breadcrumb = {
    message,
    category: 'Unauthorized Access',
    data: {orgId}
  };
  sendSentryEvent(authToken, breadcrumb);
  return returnValue !== undefined ? returnValue : {
    title: 'Not billing leader',
    message
  };
};
export const sendOrgLeadOfUserAccessError = (authToken, userId, returnValue) => {
  const message = `You are not a billing leader for ${userId}`;
  const breadcrumb = {
    message,
    category: 'Unauthorized Access',
    data: {userId}
  };
  sendSentryEvent(authToken, breadcrumb);
  return returnValue !== undefined ? returnValue : {
    title: 'Not billing leader for user',
    message
  };
};
export const sendNotificationAccessError = (authToken, notificationId, returnValue) => {
  const message = `Notification ${notificationId} does not exist`;
  const breadcrumb = {
    message,
    category: 'Unauthorized Access',
    data: {notificationId}
  };
  sendSentryEvent(authToken, breadcrumb);
  return returnValue !== undefined ? returnValue : {
    title: 'Notification not found',
    message
  };
};
