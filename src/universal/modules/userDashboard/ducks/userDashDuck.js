const SELECT_NEW_ACTION_TEAM = 'userDashboard/SELECT_NEW_ACTION_TEAM';
const FILTER_TEAM = 'userDashboard/FILTER_TEAM';

const initialState = {
  selectingNewActionTeam: false,
  teamFilterId: null,
  teamFilterName: 'All teams'
};

export default function reducer(state = initialState, action = {type: ''}) {
  if (action.type.startsWith('userDashboard/')) {
    const {type, payload} = action;
    if (action.type === SELECT_NEW_ACTION_TEAM) {
      return {
        ...state,
        selectingNewActionTeam: payload.selectingNewActionTeam
      };
    } else if (type === FILTER_TEAM) {
      return {
        ...state,
        teamFilterId: payload.teamFilterId,
        teamFilterName: payload.teamFilterName
      };
    }
  }
  return state;
}

export const selectNewActionTeam = (bool) => {
  return {
    type: SELECT_NEW_ACTION_TEAM,
    payload: {
      selectingNewActionTeam: bool
    }
  };
};

export const filterTeam = (teamId = null, teamName) => {
  return {
    type: FILTER_TEAM,
    payload: {
      teamFilterId: teamId,
      teamFilterName: teamId ? teamName : initialState.teamFilterName
    }
  };
};
