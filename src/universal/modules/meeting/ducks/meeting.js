import {fromJS, Map as iMap} from 'immutable';
import {push, replace} from 'react-router-redux';
import {fetchGraphQL, prepareGraphQLParams} from '../../../utils/fetching';
import {ensureState} from 'redux-optimistic-ui';
import {localStorageVars} from '../../../utils/clientOptions';
import socketCluster from 'socketcluster-client';

// Changed string consts because chances are we'll have more than 1 "CREATE_SUCCESS" down the road
export const CREATE_MEETING_REQUEST = 'action/meeting/CREATE_MEETING_REQUEST';
export const CREATE_MEETING_ERROR = 'action/meeting/CREATE_MEETING_ERROR';
export const CREATE_MEETING_SUCCESS =  'action/meeting/CREATE_MEETING_SUCCESS';
const SET_MEETING_ID = 'action/meeting/SET_MEETING_ID';
export const UPDATE_MEETING_REQUEST = 'action/meeting/UPDATE_MEETING_REQUEST';
export const UPDATE_MEETING_ERROR = 'action/meeting/UPDATE_MEETING_ERROR';
export const UPDATE_MEETING_SUCCESS = 'action/meeting/UPDATE_MEETING_SUCCESS';
export const EDIT_MEETING_REQUEST = 'action/meeting/EDIT_MEETING_REQUEST';
export const EDIT_MEETING_ERROR = 'action/meeting/EDIT_MEETING_ERROR';
export const EDIT_MEETING_SUCCESS = 'action/meeting/EDIT_MEETING_SUCCESS';
//TODO multiple meetings at once? It's possible with redux-operations
// making the switch to redux-operations now is cheap, later on it'll become a pain to switch

//TODO state doesn't have an isLoading field to know when we're requesting something
const initialState = iMap({
  isLoading: false,
  isLoaded: false,
  instance: null,
  mySocketId: '',
  otherEditing: false
});

export default function reducer(state = initialState, action = {}) {
  switch (action.type) {
    case SET_MEETING_ID:
      return state.merge({
        instance: iMap({
          id: action.payload.id
        })
      })
    case CREATE_MEETING_REQUEST:
      return state.merge({
        isLoading: true
      });
    case CREATE_MEETING_SUCCESS:
      return state.merge({
        isLoading: false,
        isLoaded: true,
        instance: iMap({
          id: action.payload.id
        })
      });
    case CREATE_MEETING_ERROR:
    case UPDATE_MEETING_ERROR:
      return state.merge({
        isLoading: false,
        error: action.error
      });
    case UPDATE_MEETING_SUCCESS:
      return state.merge({
        instance: action.payload
      });
    default:
      return state
  }
};

export const setMeetingId = meetingId => {
  return {
    type: SET_MEETING_ID,
    payload: {id: meetingId}
  }
}

export const createMeetingAndRedirect = () => {
  return async function (dispatch, getState) {
    const query = `
    mutation {
      payload: createMeeting {
        id
      }
    }`;
    const {error, data} = await fetchGraphQL({query});
    if (error) {
      return dispatch({type: CREATE_MEETING_ERROR, error});
    }
    const {payload} = data;
    dispatch({type: CREATE_MEETING_SUCCESS, payload});
    const id = ensureState(getState()).getIn(['meeting', 'instance', 'id']);
    // replace, don't push so a click on the back button does what we want
    dispatch(replace(`/meeting/${id}`));
  };
}

const updateMeetingSuccess = (payload, meta) => {
  return {
    type: UPDATE_MEETING_SUCCESS,
    payload,
    meta
  }
};

export const loadMeeting = meetingId => {
  const sub = `getMeeting/${meetingId}`;
  const {authTokenName} = localStorageVars;
  // const socket = socketCluster.connect({authTokenName});
  socket.subscribe(sub, {waitForAuth: true});
  return dispatch => {
    // client-side changefeed handler
    socket.on(sub, data => {
      dispatch({
        type: UPDATE_MEETING_SUCCESS,
        // data = changefeed.new_val
        payload: data,
        meta: {synced: true}
      })
    });
    socket.on('unsubscribe', channelName => {
      if (channelName === sub) {
        console.log(`unsubbed from ${channelName}`)
      }
    });
  };
}

export const updateEditing = (meetingId, editor, isEditing) => {
  const mutation = isEditing ? 'editContent' : 'finishEditContent';
  const query = `
  mutation($meetingId: !String, $editor: !String) {
    ${mutation}(meetingId: $meetingId, editor: $editor) {
      id,
      currentEditors
    }
  }`;
  const serializedParams = prepareGraphQLParams({query});
  const sub = 'getMeeting';
  const {authTokenName} = localStorageVars;
  // const socket = socketCluster.connect({authTokenName});
  socket.subscribe(serializedParams, {waitForAuth: true});
  return dispatch => {
    // client-side changefeed handler
    socket.on(sub, data => {
      dispatch({
        type: UPDATE_MEETING_SUCCESS,
        // data = changefeed.new_val
        payload: data,
        meta: {synced: true}
      })
    });
    socket.on('unsubscribe', channelName => {
      if (channelName === sub) {
        // TODO anything?
      }
    });
  };
}
