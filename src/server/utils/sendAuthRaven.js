import sendSentryEvent from 'server/utils/sendSentryEvent';

const sendAuthRaven = (authToken, title, breadcrumb, returnValue) => {
  sendSentryEvent(authToken, breadcrumb);
  const {message} = breadcrumb;
  return returnValue !== undefined ? returnValue : {error: {title, message}};
};

export default sendAuthRaven;
