const FILTER_TEAM = 'userDashboard/FILTER_TEAM';

const initialState = {
  selectingNewActionTeam: false,
  teamFilterId: null,
  teamFilterName: 'All teams'
};

export default function reducer(state = initialState, action = {type: ''}) {
  if (action.type.startsWith('userDashboard/')) {
    const {type, payload} = action;
    if (type === FILTER_TEAM) {
      return {
        ...state,
        teamFilterId: payload.teamFilterId,
        teamFilterName: payload.teamFilterName
      };
    }
  }
  return state;
}

export const filterTeam = (teamId = null, teamName) => {
  return {
    type: FILTER_TEAM,
    payload: {
      teamFilterId: teamId,
      teamFilterName: teamId ? teamName : initialState.teamFilterName
    }
  };
};
