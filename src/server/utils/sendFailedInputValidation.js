import sendAuthRaven from 'server/utils/sendAuthRaven';

const sendFailedInputValidation = (authToken, errors) => {
  const breadcrumb = {
    message: 'The input cannot be validated on the server',
    category: 'Server validation error',
    data: {errors}
  };
  return sendAuthRaven(authToken, 'Server validation error', breadcrumb);
};

export default sendFailedInputValidation;
