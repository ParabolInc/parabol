const SET_WELCOME_TEAM = 'action/welcome/SET_WELCOME_TEAM';

const initialState = {
  teamId: null,
  teamMemberId: null
};

export default function reducer(state = initialState, action = {}) {
  switch (action.type) {
    case SET_WELCOME_TEAM:
      return Object.assign({}, state, action.payload);
    default:
      return state;
  }
}

export const setWelcomeTeam = payload => {
  return {
    type: SET_WELCOME_TEAM,
    payload
  };
};
