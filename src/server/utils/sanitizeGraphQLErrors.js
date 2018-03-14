const sanitizeGraphQLErrors = (res) => {
  if (!Array.isArray(res.errors)) return res;
  const sanitizedErrors = res.errors.map((error) => ({
    message: 'Server error',
    path: error.path
  }));
  return {
    ...res,
    errors: sanitizedErrors
  };
};

export default sanitizeGraphQLErrors;
