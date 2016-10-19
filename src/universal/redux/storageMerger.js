export default function merger(initialState, persistedState) {
  // Update this list for each new duck written
  const whitelist = new Set(['auth', 'cashay']);
  const result = {};
  const persistedStateKeys = Object.keys(persistedState);
  for (let i = 0; i < persistedStateKeys.length; i++) {
    const reducerName = persistedStateKeys[i];
    if (!whitelist.has(reducerName)) continue;
    const value = persistedState[reducerName];
    if (reducerName === 'auth' && value && value.obj) {
      if (value.obj.exp < Date.now() / 1000) {
        continue;
      }
    }
    if (reducerName === 'cashay') {
      if (value) {
        // nuke everything except the User
        const {User} = value.entities || {};
        value.entities = User ? {User} : {};
        value.result = {};
        value.ops = {};
      }
    }
    result[reducerName] = value;
  }
  return result;
}
