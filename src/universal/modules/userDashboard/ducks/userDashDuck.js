const SELECT_NEW_ACTION_TEAM = 'action/userDashboard/SELECT_NEW_ACTION_TEAM';
const FILTER_TEAM = 'action/userDashboard/FILTER_TEAM';

const initialState = {
  selectingNewActionTeam: false,
  teamFilterId: null,
  teamFilterName: 'All teams'
};

export default function reducer(state = initialState, action = {}) {
  switch (action.type) {
    case SELECT_NEW_ACTION_TEAM: {
      return {
        ...state,
        selectingNewActionTeam: action.payload.selectingNewActionTeam
      };
    }
    case FILTER_TEAM: {
      return {
        ...state,
        teamFilterId: action.payload.teamFilterId,
        teamFilterName: action.payload.teamFilterName
      };
    }
    default:
      return state;
  }
}

export const selectNewActionTeam = (bool) => {
  return {
    type: SELECT_NEW_ACTION_TEAM,
    payload: {
      selectingNewActionTeam: bool
    }
  };
};

export const filterTeam = (teamId, teamName) => {
  return {
    type: FILTER_TEAM,
    payload: {
      teamFilterId: teamId,
      teamFilterName: teamName
    }
  };
};
