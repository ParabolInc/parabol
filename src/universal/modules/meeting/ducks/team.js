import { Map as iMap, fromJS } from 'immutable';
import { push, replace } from 'react-router-redux'; // eslint-disable-line no-unused-vars
import { fetchGraphQL } from '../../../utils/fetching';

export const CREATE_TEAM_REQUEST = 'action/meeting/CREATE_TEAM_REQUEST';
export const CREATE_TEAM_ERROR = 'action/meeting/CREATE_TEAM_ERROR';
export const CREATE_TEAM_SUCCESS = 'action/meeting/CREATE_TEAM_SUCCESS';

export const LOAD_TEAM_REQUEST = 'action/meeting/LOAD_TEAM_REQUEST';
export const LOAD_TEAM_SUCCESS = 'action/meeting/LOAD_TEAM_SUCCESS';
export const LOAD_TEAM_ERROR = 'action/meeting/LOAD_TEAM_ERROR';

export const UPDATE_TEAM_NAME_LOCAL = 'action/meeting/UPDATE_TEAM_NAME_LOCAL';
export const UPDATE_TEAM_NAME_REQUEST = 'action/meeting/UPDATE_TEAM_NAME_REQUEST';
export const UPDATE_TEAM_NAME_SUCCESS = 'action/meeting/UPDATE_TEAM_NAME_SUCCESS';
export const UPDATE_TEAM_NAME_ERROR = 'action/meeting/UPDATE_TEAM_NAME_ERROR';

const initialState = iMap({
  isLoading: false,
  isLoaded: false,
  error: '',
  instance: iMap({
    id: '',
    name: '',
  }),
});

export default function reducer(state = initialState, action = {}) {
  switch (action.type) {
    case CREATE_TEAM_REQUEST:
    case LOAD_TEAM_REQUEST:
      return state.merge({
        isLoading: true,
        error: ''
      });
    case CREATE_TEAM_SUCCESS:
      return state.mergeDeep({
        isLoading: false,
        isLoaded: true,
        instance: iMap({
          id: action.payload.id
        })
      });
    case CREATE_TEAM_ERROR:
    case LOAD_TEAM_ERROR:
      return state.merge({
        isLoading: false,
        error: action.error
      });
    case LOAD_TEAM_SUCCESS:
      return state.mergeDeep({
        isLoading: false,
        instance: fromJS(action.payload)
      });
    case UPDATE_TEAM_NAME_LOCAL:
      return state.mergeDeep({
        instance: iMap({
          name: action.payload.name
        })
      });
    case UPDATE_TEAM_NAME_SUCCESS:
      return state.mergeDeep({
        instance: fromJS(action.payload)
      });
    case UPDATE_TEAM_NAME_ERROR:
      return state.merge({
        instance: action.error
      });
    default:
      return state;
  }
}

export const createTeam = (name) =>
  async (dispatch) => {
    dispatch({type: CREATE_TEAM_REQUEST});
    const query = `
    mutation($name: String!) {
      payload: createTeam(name: $name) {
        id
      }
    }`;
    const {error, data} = await fetchGraphQL({query, variables: {name}});
    if (error) {
      return dispatch({type: CREATE_TEAM_ERROR, error});
    }
    const {payload} = data;
    return dispatch({type: CREATE_TEAM_SUCCESS, payload});
  };

export const loadTeam = (teamId) =>
  async dispatch => {
    dispatch({type: LOAD_TEAM_REQUEST});
    const query = `
      query($teamId: ID!) {
        payload: getTeamById(teamId: $teamId) {
          id,
          name
        }
      }`;
    const {error, data} = await fetchGraphQL({query, variables: {teamId}});
    if (error) {
      return dispatch({type: LOAD_TEAM_ERROR, error});
    }
    const {payload} = data;
    return dispatch({type: LOAD_TEAM_SUCCESS, payload});
  };

export const updateTeamName = (teamId, name) =>
  async dispatch => {
    dispatch({type: UPDATE_TEAM_NAME_REQUEST});
    const query = `
      mutation($teamId: ID!, $name: String!) {
        payload: updateTeamName(teamId: $teamId, name: $name) {
          id,
          name
        }
      }`;
    const {error, data} = await fetchGraphQL({query, variables: {teamId, name}});
    if (error) {
      return dispatch({type: UPDATE_TEAM_NAME_ERROR, error});
    }
    const {payload} = data;
    return dispatch({type: UPDATE_TEAM_NAME_SUCCESS, payload});
  };

export const updateTeamNameLocal = (name) => ({
  type: UPDATE_TEAM_NAME_LOCAL,
  payload: {name}
});
