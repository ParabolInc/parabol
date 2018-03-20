import sendAuthRaven from 'server/utils/sendAuthRaven';

export const sendGroupTitleRequiredError = (authToken, reflectionGroupId) => {
  const breadcrumb = {
    message: 'You are missing a title',
    category: 'Validation error',
    data: {reflectionGroupId}
  };
  return sendAuthRaven(authToken, 'Well that isn’t right', breadcrumb);
};
