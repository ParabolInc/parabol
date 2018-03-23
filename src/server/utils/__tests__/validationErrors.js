import sendAuthRaven from 'server/utils/sendAuthRaven';

export const sendGroupTitleRequiredError = (authToken, reflectionGroupId) => {
  const breadcrumb = {
    message: 'You are missing a title',
    category: 'Validation error',
    data: {reflectionGroupId}
  };
  return sendAuthRaven(authToken, 'Well that isn’t right', breadcrumb);
};

export const sendTooManyReflectionsError = (authToken, reflectionIds) => {
  const breadcrumb = {
    message: 'A group must be created with a maximum of 2 reflections',
    category: 'Validation error',
    data: {reflectionIds}
  };
  return sendAuthRaven(authToken, 'Well that isn’t right', breadcrumb);
};

export const sendGroupTitleDuplicateError = (authToken, title) => {
  const breadcrumb = {
    message: 'A group title must be unique',
    category: 'Validation error',
    data: {title}
  };
  return sendAuthRaven(authToken, 'That might be confusing', breadcrumb);
};
