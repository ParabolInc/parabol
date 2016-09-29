const SELECT_NEW_ACTION_TEAM = 'action/userDashboard/SELECT_NEW_ACTION_TEAM';
// const SELECT_NEW_PROJECT_TEAM = 'action/userDashboard/SELECT_NEW_PROJECT_TEAM';

const initialState = {
  selectingNewActionTeam: false,
  selectingNewProjectTeam: false
};

export default function reducer(state = initialState, action = {}) {
  switch (action.type) {
    case SELECT_NEW_ACTION_TEAM: {
      return {
        ...state,
        selectingNewActionTeam: action.payload.selectingNewActionTeam
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

// export const selectNewProjectTeam = (bool) => {
//   return {
//     type: SELECT_NEW_PROJECT_TEAM,
//     payload: {
//       selectingNewProjectTeam: bool
//     }
//   };
// };
