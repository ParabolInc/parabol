import jwtDecode from 'jwt-decode';

export default function merger(initialState, persistedState) {
  const whitelist = new Set(['authToken', 'cashay', 'notifications']);
  // const {routing, ...whitePersistedState} = persistedState;
  const result = {};
  const persistedStateKeys = Object.keys(persistedState);
  for (let i = 0; i < persistedStateKeys.length; i++) {
    const reducerName = persistedStateKeys[i];
    if (!whitelist.has(reducerName)) continue;
    const value = persistedState[reducerName];
    if (reducerName === 'authToken' && value) {
      const authTokenObj = jwtDecode(value);
      if (authTokenObj.exp < Date.now() / 1000) {
        continue;
      }
    }
    result[reducerName] = value;
  }
  return result;
}
