import jwtDecode from 'jwt-decode';

export default function merger(initialState, persistedState) {
  // Update this list for each new duck written
  const whitelist = new Set(['auth', 'cashay', 'notifications']);
  const result = {};
  const persistedStateKeys = Object.keys(persistedState);
  for (let i = 0; i < persistedStateKeys.length; i++) {
    const reducerName = persistedStateKeys[i];
    if (!whitelist.has(reducerName)) continue;
    const value = persistedState[reducerName];
    if (reducerName === 'auth' && value) {
      // Always perform a fresh decode for security's sake:
      let authTokenObj = null;
      try {
        authTokenObj = jwtDecode(value.token);
      } catch (e) {
        console.warn(`unable to decode jwt: ${e}`);
        continue;
      }
      if (authTokenObj.exp < Date.now() / 1000) {
        continue;
      }
    }
    if (reducerName === 'cashay') {
      if (value && value.entities) {
        // cashay now supports rehydrating sub data
        // remove items with unbounded growth in production
        value.result.presence = undefined;
        value.entities.Presence = undefined;
        value.entities.Task = undefined;
      }
    }
    result[reducerName] = value;
  }
  return result;
}
