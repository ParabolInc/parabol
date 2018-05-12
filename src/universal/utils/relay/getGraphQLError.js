const getServerError = (errors) => (errors && errors[0]) || undefined;
const getPayloadError = (res) => {
  if (!res) return undefined;
  const [operationName] = Object.keys(res);
  const payload = res[operationName];
  return payload && payload.error;
};

const getGraphQLError = (res, errors) => {
  return getPayloadError(res) || getServerError(errors);
};

export default getGraphQLError;
