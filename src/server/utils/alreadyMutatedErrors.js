import sendAuthRaven from 'server/utils/sendAuthRaven';

export const sendAlreadyJoinedIntegrationError = (authToken, integrationId) => {
  const breadcrumb = {
    message: 'You are already a part of this integration',
    category: 'Already mutated',
    data: {integrationId}
  };
  return sendAuthRaven(authToken, 'Easy there', breadcrumb);
};

export const sendAlreadyUpdatedIntegrationError = (authToken, integrationId) => {
  const breadcrumb = {
    message: 'Integration was already updated',
    category: 'Already mutated',
    data: {integrationId}
  };
  return sendAuthRaven(authToken, 'Easy there', breadcrumb);
};

export const sendAlreadyRemovedIntegrationError = (authToken, integrationId) => {
  const breadcrumb = {
    message: 'Integration was already removed',
    category: 'Already mutated',
    data: {integrationId}
  };
  return sendAuthRaven(authToken, 'Easy there', breadcrumb);
};

export const sendAlreadyArchivedTeamError = (authToken, teamId) => {
  const breadcrumb = {
    message: 'Team was already archived',
    category: 'Team Already Archived',
    data: {teamId}
  };
  return sendAuthRaven(authToken, 'Easy there', breadcrumb);
}

export const sendAlreadyInactivatedUserError = (authToken, userId) => {
  const breadcrumb = {
    message: 'That user is already inactive. cannot inactivate twice',
    category: 'Already inactive',
    data: {userId}
  };
  return sendAuthRaven(authToken, 'Easy there', breadcrumb);
}

export const sendAlreadyCurrentFacilitatorError = (authToken, facilitatorId) => {
  const breadcrumb = {
    message: 'You are already the facilitator',
    category: 'Already facilitator',
    data: {facilitatorId}
  };
  return sendAuthRaven(authToken, 'Easy there', breadcrumb);
}

export const sendAlreadyStartedMeetingError = (authToken, teamId) => {
  const breadcrumb = {
    message: 'The meeting has already started. Get in there!',
    category: 'Already started meeting',
    data: {teamId}
  };
  return sendAuthRaven(authToken, 'Easy there', breadcrumb);
}

export const sendAlreadyUpdatedTaskError = (authToken, taskId) => {
  const breadcrumb = {
    message: 'The task has already been updated',
    category: 'Already updated task',
    data: {taskId}
  };
  return sendAuthRaven(authToken, 'Easy there', breadcrumb);
}

export const sendAlreadyProTierError = (authToken, orgId) => {
  const breadcrumb = {
    message: 'You are already pro!',
    category: 'Already pro tier',
    data: {orgId}
  };
  return sendAuthRaven(authToken, 'Easy there', breadcrumb);
}

