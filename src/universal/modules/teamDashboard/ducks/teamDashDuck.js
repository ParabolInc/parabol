const FILTER_TEAM_MEMBER = 'action/teamDashboard/FILTER_TEAM_MEMBER';

const initialState = {
  teamMemberFilterId: null,
  teamMemberFilterName: 'All members'
};

export default function reducer(state = initialState, action = {type: ''}) {
  switch (action.type) {
    case FILTER_TEAM_MEMBER: {
      return {
        ...state,
        teamMemberFilterId: action.payload.teamMemberFilterId,
        teamMemberFilterName: action.payload.teamMemberFilterName || initialState.teamMemberFilterName
      };
    }
    default:
      return state;
  }
}

export const filterTeamMember = (teamMemberFilterId, teamMemberFilterName) => {
  return {
    type: FILTER_TEAM_MEMBER,
    payload: {
      teamMemberFilterId,
      teamMemberFilterName
    }
  };
};
