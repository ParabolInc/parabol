import sendSentryEvent from 'server/utils/sendSentryEvent';

const sendGraphQLErrorResult = (protocol, firstError, query, variables, authToken) => {
  const message = `${protocol} GraphQL Error`;
  if (process.env.NODE_ENV !== 'production') {
    const error = new Error(message);
    const breadcrumb = {
      message,
      category: 'graphql',
      data: {
        query,
        variables,
        firstError
      }
    };
    sendSentryEvent(error, authToken, breadcrumb);
  } else {
    console.error(message, firstError);
  }
};

export default sendGraphQLErrorResult;
