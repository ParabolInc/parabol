export const RESET = '@@root/RESET';

export default (appReducer) => (state, action) => {
  if (action && action.type === RESET) {
    const {whitelist} = action.payload;
    const newState = {};
    whitelist.forEach((keeper) => {
      if (keeper in state) {
        newState[keeper] = state[keeper];
      }
    });
    state = newState;
  }
  return appReducer(state, action);
};

export const reset = (whitelist = []) => ({
  type: RESET,
  payload: { whitelist }
});
