import fromGlobalId from 'graphql-relay';

const maybeFromGlobalId = (maybeGlobalId = '', expectedType) => {
  const {id, type} = fromGlobalId(maybeGlobalId);
  if (type !== expectedType) {
    throw new Error(`Invalid id for ${expectedType}`);
  }
  return id;
};

export default maybeFromGlobalId;