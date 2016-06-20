const SET_WELCOME_NAME = 'action/welcome/SET_WELCOME_NAME';
const SET_WELCOME_TEAM_NAME = 'action/welcome/SET_WELCOME_TEAM_NAME';

const initialState = {
  fullName: null,
  teamName: null
};

export default function reducer(state = initialState, action = {}) {
  switch (action.type) {
    case SET_WELCOME_NAME:
      return Object.assign({}, state, {
        fullName: action.payload.fullName
      });
    case SET_WELCOME_TEAM_NAME:
      return Object.assign({}, state, {
        teamName: action.payload.teamName
      });
    default:
      return state;
  }
}

export const setWelcomeName = fullName => {
  return {
    type: SET_WELCOME_NAME,
    payload: {fullName}
  };
};

export const setWelcomeTeamName = teamName => {
  return {
    type: SET_WELCOME_TEAM_NAME,
    payload: {teamName}
  };
};
