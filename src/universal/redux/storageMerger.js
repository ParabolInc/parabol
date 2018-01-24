export default function merger(initialState, persistedState) {
  // Update this list for each new duck written
  const whitelist = new Set(['auth']);
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
    result[reducerName] = value;
  }
  return result;
}
