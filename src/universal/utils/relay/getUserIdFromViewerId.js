const getUserIdFromViewerId = (viewerId) => {
  const compoundKey = atob(viewerId);
  const delimiterIdx = compoundKey.indexOf(':');
  return compoundKey.substring(delimiterIdx + 1);
};

export default getUserIdFromViewerId;
