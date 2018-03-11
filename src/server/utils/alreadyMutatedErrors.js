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
