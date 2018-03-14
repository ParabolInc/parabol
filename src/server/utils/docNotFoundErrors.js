import sendAuthRaven from 'server/utils/sendAuthRaven';

export const sendTaskNotFoundError = (authToken, taskId) => {
  const breadcrumb = {
    message: `Task ${taskId} does not exist`,
    category: 'Not found',
    data: {taskId}
  };
  return sendAuthRaven(authToken, 'Task not found', breadcrumb);
};

export const sendTeamMemberNotFoundError = (authToken, teamId, userId) => {
  const breadcrumb = {
    message: 'Team member does not exist',
    category: 'Not found',
    data: {teamId, userId}
  };
  return sendAuthRaven(authToken, 'TeamMember not found', breadcrumb);
};

export const sendInvitationNotFoundError = (authToken, invitationId) => {
  const breadcrumb = {
    message: `Invitation ${invitationId} does not exist`,
    category: 'Not found',
    data: {invitationId}
  };
  return sendAuthRaven(authToken, 'Invitation not found', breadcrumb);
};

export const sendIntegrationNotFoundError = (authToken, integrationId) => {
  const breadcrumb = {
    message: `Integration ${integrationId} does not exist`,
    category: 'Not found',
    data: {integrationId}
  };
  return sendAuthRaven(authToken, 'Integration not found', breadcrumb);
};

export const sendAgendaItemNotFoundError = (authToken, agendaItemId) => {
  const breadcrumb = {
    message: `AgendaItem ${agendaItemId} does not exist`,
    category: 'Not found',
    data: {agendaItemId}
  };
  return sendAuthRaven(authToken, 'AgendaItem not found', breadcrumb);
};

export const sendNotificationAccessError = (authToken, notificationId, returnValue) => {
  const breadcrumb = {
    message: `Notification ${notificationId} does not exist`,
    category: 'Not found',
    data: {notificationId}
  };
  return sendAuthRaven(authToken, 'Notification not found', breadcrumb, returnValue);
};

export const sendGitHubProviderNotFoundError = (authToken, data, returnValue) => {
  const breadcrumb = {
    message: 'No GitHub Provider found! Try refreshing your token',
    category: 'Not found',
    data
  };
  return sendAuthRaven(authToken, 'GitHub Account Not Found', breadcrumb, returnValue);
};

export const sendSlackProviderNotFoundError = (authToken, data, returnValue) => {
  const breadcrumb = {
    message: 'No Slack Provider found! Try refreshing your token',
    category: 'Not found',
    data
  };
  return sendAuthRaven(authToken, 'Slack Account Not Found', breadcrumb, returnValue);
};

export const sendMeetingNotFoundError = (authToken, meetingId, returnValue) => {
  const breadcrumb = {
    message: 'Meeting ID not found',
    category: 'Not found',
    data: {meetingId}
  };
  return sendAuthRaven(authToken, 'Meeting Not Found', breadcrumb, returnValue);
};
