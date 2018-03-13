import sendSentryEvent from 'server/utils/sendSentryEvent';

const sendGraphQLErrorResult = (protocol, firstError, query, variables, authToken) => {
  const message = `${protocol} GraphQL Error`;
  const breadcrumb = {
    message,
    category: 'graphql',
    data: {
      query,
      variables,
      firstError
    }
  };
  sendSentryEvent(authToken, breadcrumb);
};

export default sendGraphQLErrorResult;
