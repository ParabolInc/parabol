const SET_WELCOME_TEAM = 'action/welcome/SET_WELCOME_TEAM';
const NEXT_PAGE = 'action/welcome/NEXT_PAGE';
const PREVIOUS_PAGE = 'action/welcome/PREVIOUS_PAGE';
const GO_TO_PAGE = 'action/welcome/GO_TO_PAGE';
const UPDATE_COMPLETED = 'action/welcome/UPDATE_COMPLETED';
const UPDATE_EXISTING_INVITES = 'action/welcome/UPDATE_EXISTING_INVITES';

const MIN_PAGE = 1;
const MAX_PAGE = 3;

const initialState = {
  page: 1,
  completed: 0,
  teamId: null,
  teamMemberId: null,
  existingInvites: []
};

export default function reducer(state = initialState, action = {type: ''}) {
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
    case GO_TO_PAGE:
      return {
        ...state,
        page: action.payload
      };
    case UPDATE_COMPLETED:
      return {
        ...state,
        completed: Math.max(state.completed, action.payload)
      };
    case UPDATE_EXISTING_INVITES:
      return {
        ...state,
        existingInvites: action.payload
      };
    case SET_WELCOME_TEAM:
      return Object.assign({}, state, action.payload);
    default:
      return state;
  }
}

export const setWelcomeTeam = (payload) => {
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

export const goToPage = (page) => {
  return {
    type: GO_TO_PAGE,
    payload: page
  };
};

export const updateCompleted = (page) => {
  return {
    type: UPDATE_COMPLETED,
    payload: page
  };
};

export const updateExistingInvites = (list) => {
  // each idx in the list is an email address that has already been entered and should get highlighted for a second
  // creates an array and then removes it, giving enough time for a class-based animation to occur
  return (dispatch) => {
    dispatch({
      type: UPDATE_EXISTING_INVITES,
      payload: list
    });
    setTimeout(() => {
      dispatch({
        type: UPDATE_EXISTING_INVITES,
        payload: []
      });
    }, 1500);
  };
};
