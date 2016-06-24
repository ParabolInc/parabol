const SET_WELCOME_NAME = 'action/welcome/SET_WELCOME_NAME';
const SET_WELCOME_TEAM = 'action/welcome/SET_WELCOME_TEAM';

const initialState = {
  preferredName: null,
  teamName: null,
  teamId: null,
  teamMemberId: null
};

export default function reducer(state = initialState, action = {}) {
  switch (action.type) {
    case SET_WELCOME_NAME:
      return Object.assign({}, state, {
        preferredName: action.payload.preferredName
      });
    case SET_WELCOME_TEAM:
      return Object.assign({}, state, action.payload);
    default:
      return state;
  }
}

export const setWelcomeName = preferredName => {
  return {
    type: SET_WELCOME_NAME,
    payload: {preferredName}
  };
};

export const setWelcomeTeam = payload => {
  return {
    type: SET_WELCOME_TEAM,
    payload
  };
};
