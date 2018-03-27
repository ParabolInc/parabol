import sendAuthRaven from 'server/utils/sendAuthRaven';
import {phaseLabelLookup} from 'universal/utils/meetings/lookups';

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
};

export const sendAlreadyInactivatedUserError = (authToken, userId) => {
  const breadcrumb = {
    message: 'That user is already inactive. cannot inactivate twice',
    category: 'Already inactive',
    data: {userId}
  };
  return sendAuthRaven(authToken, 'Easy there', breadcrumb);
};

export const sendAlreadyCurrentFacilitatorError = (authToken, facilitatorId) => {
  const breadcrumb = {
    message: 'You are already the facilitator',
    category: 'Already facilitator',
    data: {facilitatorId}
  };
  return sendAuthRaven(authToken, 'Easy there', breadcrumb);
};

export const sendAlreadyStartedMeetingError = (authToken, teamId) => {
  const breadcrumb = {
    message: 'The meeting has already started. Get in there!',
    category: 'Already started meeting',
    data: {teamId}
  };
  return sendAuthRaven(authToken, 'Easy there', breadcrumb);
};

export const sendAlreadyEndedMeetingError = (authToken, meetingId) => {
  const breadcrumb = {
    message: 'The meeting has ended!',
    category: 'Already ended meeting',
    data: {meetingId}
  };
  return sendAuthRaven(authToken, 'Easy there', breadcrumb);
};

export const sendAlreadyCompletedMeetingPhaseError = (authToken, phaseType, meetingId) => {
  const breadcrumb = {
    message: `The ${phaseLabelLookup[phaseType]} phase is already complete!`,
    category: 'Already completed phase',
    data: {meetingId}
  };
  return sendAuthRaven(authToken, 'Hey now', breadcrumb);
};

export const sendAlreadyUpdatedTaskError = (authToken, taskId) => {
  const breadcrumb = {
    message: 'The task has already been updated',
    category: 'Already updated task',
    data: {taskId}
  };
  return sendAuthRaven(authToken, 'Easy there', breadcrumb);
};

export const sendAlreadyProTierError = (authToken, orgId) => {
  const breadcrumb = {
    message: 'You are already pro!',
    category: 'Already pro tier',
    data: {orgId}
  };
  return sendAuthRaven(authToken, 'Easy there', breadcrumb);
};

export const sendAlreadyRemovedVoteError = (authToken, reflectionGroupId) => {
  const breadcrumb = {
    message: 'You’ve already removed that vote',
    category: 'Already removed vote',
    data: {reflectionGroupId}
  };
  return sendAuthRaven(authToken, 'Easy there', breadcrumb);
};

export const sendNoVotesLeftError = (authToken, reflectionGroupId) => {
  const breadcrumb = {
    message: 'You’re all out of votes!',
    category: 'Out of votes',
    data: {reflectionGroupId}
  };
  return sendAuthRaven(authToken, 'Easy there', breadcrumb);
};

export const sendMaxVotesPerGroupError = (authToken, reflectionGroupId, maxVotesPerGroup) => {
  const breadcrumb = {
    message: `Unfortunately, you can only vote ${maxVotesPerGroup} times per theme`,
    category: 'Max votes per theme',
    data: {reflectionGroupId}
  };
  return sendAuthRaven(authToken, 'Feeling passionate? We like that', breadcrumb);
};
