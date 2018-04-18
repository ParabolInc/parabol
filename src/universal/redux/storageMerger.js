import {DEFAULT_AUTH_REDUCER_NAME} from 'universal/redux/authDuck';
import {DEFAULT_INVITATION_REDUCER_NAME} from 'universal/redux/invitationDuck';

export default function merger(initialState, persistedState) {
  // Update this list for each new duck written
  const whitelist = new Set([DEFAULT_AUTH_REDUCER_NAME, DEFAULT_INVITATION_REDUCER_NAME]);
  const result = {};
  const persistedStateKeys = Object.keys(persistedState);
  for (let i = 0; i < persistedStateKeys.length; i++) {
    const reducerName = persistedStateKeys[i];
    if (!whitelist.has(reducerName)) continue;
    const value = persistedState[reducerName];
    if (reducerName === DEFAULT_AUTH_REDUCER_NAME && value && value.obj) {
      if (value.obj.exp < Date.now() / 1000) {
        continue;
      }
    }
    result[reducerName] = value;
  }
  return result;
}
