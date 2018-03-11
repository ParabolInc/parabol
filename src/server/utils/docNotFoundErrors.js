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
    message: `Team member does not exist`,
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
