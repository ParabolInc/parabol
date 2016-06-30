const SET_WELCOME_TEAM = 'action/welcome/SET_WELCOME_TEAM';
const NEXT_PAGE = 'action/welcome/NEXT_PAGE';
const PREVIOUS_PAGE = 'action/welcome/PREVIOUS_PAGE';

const MIN_PAGE = 1;
const MAX_PAGE = 3;

const initialState = {
  page: 1,
  teamId: null,
  teamMemberId: null
};

export default function reducer(state = initialState, action = {}) {
  switch (action.type) {
    case NEXT_PAGE:
      return {
        ...state,
        page: state.page < MAX_PAGE ? state.page + 1 : state.page
      };
    case PREVIOUS_PAGE:
      return {
        ...state,
        page: state.page > MIN_PAGE ? state.page - 1 : state.page
      };
    case SET_WELCOME_TEAM:
      return Object.assign({}, state, action.payload);
    case NEXT_PAGE:
      return Object.assign({}, state, {
        page: state.page + 1
      });
    case PREVIOUS_PAGE:
      return Object.assign({}, state, {
        page: state.page - 1
      });
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

export const nextPage = () => {
  return {
    type: NEXT_PAGE
  };
};

export const previousPage = () => {
  return {
    type: PREVIOUS_PAGE
  };
};
