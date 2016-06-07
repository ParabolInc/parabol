import {Map as iMap, List as iList, fromJS} from 'immutable';
import {push, replace} from 'react-router-redux'; // eslint-disable-line no-unused-vars
import {fetchGraphQL} from '../../../utils/fetching';
import {ensureState} from 'redux-optimistic-ui';
import {localStorageVars} from '../../../utils/clientOptions';
import socketCluster from 'socketcluster-client';
import {
  createTeam,
  loadTeam,
  LOAD_TEAM_SUCCESS
} from './team';

export const CREATE_MEETING_REQUEST = 'action/meeting/CREATE_MEETING_REQUEST';
export const CREATE_MEETING_ERROR = 'action/meeting/CREATE_MEETING_ERROR';
export const CREATE_MEETING_SUCCESS = 'action/meeting/CREATE_MEETING_SUCCESS';

export const LOAD_MEETING_REQUEST = 'action/meeting/LOAD_MEETING_REQUEST';
export const LOAD_MEETING_ERROR = 'action/meeting/LOAD_MEETING_ERROR';
export const LOAD_MEETING_SUCCESS = 'action/meeting/LOAD_MEETING_SUCCESS';

export const UPDATE_MEETING_REQUEST = 'action/meeting/UPDATE_MEETING_REQUEST';
export const UPDATE_MEETING_ERROR = 'action/meeting/UPDATE_MEETING_ERROR';
export const UPDATE_MEETING_SUCCESS = 'action/meeting/UPDATE_MEETING_SUCCESS';

export const NAVIGATE_SETUP_0_GET_STARTED = 'action/meeting/NAVIGATE_SETUP_0_GET_STARTED';
export const NAVIGATE_SETUP_1_INVITE_TEAM = 'action/meeting/NAVIGATE_SETUP_1_INVITE_TEAM';
export const NAVIGATE_SETUP_2_INVITE_TEAM = 'action/meeting/NAVIGATE_SETUP_2_INVITE_TEAM';

const initialState = iMap({
  isLoading: false,
  isLoaded: false,
  instance: iMap({
    id: '',
    lastUpdatedBy: '',
    teamId: '',
    content: '',
    currentEditors: iList()
  }),
  navigation: NAVIGATE_SETUP_0_GET_STARTED
});

export default function reducer(state = initialState, action = {}) {
  switch (action.type) {
    case CREATE_MEETING_REQUEST:
    case LOAD_MEETING_REQUEST:
      return state.merge({
        isLoading: true
      });
    case CREATE_MEETING_SUCCESS:
    case LOAD_MEETING_SUCCESS:
      return state.mergeDeep({
        isLoading: false,
        isLoaded: true,
        instance: fromJS(action.payload)
      });
    case CREATE_MEETING_ERROR:
    case LOAD_MEETING_ERROR:
    case UPDATE_MEETING_ERROR:
      return state.merge({
        isLoading: false,
        error: action.error
      });
    case UPDATE_MEETING_SUCCESS:
      return state.mergeDeep({
        instance: iMap(action.payload)
      });
    case NAVIGATE_SETUP_0_GET_STARTED:
      return state.merge({
        navigation: NAVIGATE_SETUP_0_GET_STARTED
      });
    case NAVIGATE_SETUP_1_INVITE_TEAM:
      return state.merge({
        navigation: NAVIGATE_SETUP_1_INVITE_TEAM
      });
    case NAVIGATE_SETUP_2_INVITE_TEAM:
      return state.merge({
        navigation: NAVIGATE_SETUP_2_INVITE_TEAM
      });
    default:
      return state;
  }
}

export const createTeamAndMeetingThenRedirect = () =>
  async (dispatch, getState) => {
    await dispatch(createTeam(''));
    const teamId = ensureState(getState())
      .getIn(['meetingModule', 'team', 'instance', 'id']);
    const query = `
    mutation($teamId: ID!) {
      payload: createMeeting(teamId: $teamId) {
        id,
        teamId
      }
    }`;
    const {error, data} = await fetchGraphQL({query, variables: {teamId}});
    if (error) {
      return dispatch({type: CREATE_MEETING_ERROR, error});
    }
    const {payload} = data;
    dispatch({type: CREATE_MEETING_SUCCESS, payload});
    const id = ensureState(getState()).getIn(['meetingModule', 'meeting', 'instance', 'id']);
    // replace, don't use push. a click should go back 2.
    return dispatch(replace(`/meeting/${id}`));
  };

const updateMeetingSuccess = (payload, meta) => ({
  type: UPDATE_MEETING_SUCCESS,
  payload,
  meta
});

export const loadMeeting = meetingId => {
  const sub = `getMeeting/${meetingId}`;
  const {authTokenName} = localStorageVars;
  const socket = socketCluster.connect({authTokenName});
  socket.subscribe(sub, {waitForAuth: true});
  return dispatch => {
    // client-side changefeed handler
    socket.on(sub, data => {
      dispatch({
        type: UPDATE_MEETING_SUCCESS,
        payload: data,
        meta: {synced: true}
      });
    });
    socket.on('unsubscribe', channelName => {
      if (channelName === sub) {
        console.log(`unsubbed from ${channelName}`);
      }
    });
  };
};

export const loadMeetingAndTeam = (meetingId) =>
  async dispatch => {
    dispatch({type: LOAD_MEETING_REQUEST});
    const query = `
      query($meetingId: ID!) {
        payload: getMeetingById(meetingId: $meetingId) {
          id,
          createdAt,
          updatedAt,
          lastUpdatedBy,
          team {
            id,
            name
          },
          content
        }
      }`;
    const {error, data} = await fetchGraphQL({query, variables: {meetingId}});
    console.log(data);
    if (error) {
      return dispatch({type: LOAD_MEETING_ERROR, error});
    }
    const {payload} = data;
    return dispatch({
      type: LOAD_TEAM_SUCCESS,
      payload
    });
  };

export const updateEditing = (meetingId, editor, isEditing) => {
  if (!editor) {
    // can remove
    console.log('updateEditing has no editor');
  }
  return async dispatch => {
    const mutation = isEditing ? 'editContent' : 'finishEditContent';
    const query = `
      mutation($meetingId: ID!, $editor: String!) {
        payload: ${mutation}(meetingId: $meetingId, editor: $editor) {
          id,
          currentEditors
        }
      }`;
    const {error, data} = await fetchGraphQL({query, variables: {meetingId, editor}});
    if (error) {
      return dispatch({type: UPDATE_MEETING_ERROR, error});
    }
    const {payload} = data;
    return dispatch(updateMeetingSuccess(payload));
  };
};

export const updateContent = (meetingId, content, updatedBy) =>
  async dispatch => {
    const query = `
      mutation($meetingId: ID!, $content: String!, $updatedBy: String!) {
        payload: updateContent(meetingId: $meetingId, content: $content, updatedBy: $updatedBy) {
          id,
          content,
          lastUpdatedBy
        }
      }`;
    const {error, data} = await fetchGraphQL({query, variables: {meetingId, content, updatedBy}});
    if (error) {
      return dispatch({type: UPDATE_MEETING_ERROR, error});
    }
    const {payload} = data;
    return dispatch(updateMeetingSuccess(payload));
  };
