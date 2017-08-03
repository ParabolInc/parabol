const fromGlobalId = (globalId) => {
  const compoundKey = atob(globalId);
  const delimiterIdx = compoundKey.indexOf(':');
  return {
    id: compoundKey.substring(delimiterIdx + 1),
    type: compoundKey.substring(0, delimiterIdx)
  };
};

export default fromGlobalId;
