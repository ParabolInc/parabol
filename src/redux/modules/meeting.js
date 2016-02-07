import * as _ from 'lodash';

import { subscriptionManager } from '../../helpers/subscriptionManager';
import { CONNECTED as SOCKET_CONNECTED } from './socket';

const CREATE = 'action/meeting/CREATE';
const CREATE_SUCCESS = 'action/meeting/CREATE_SUCCESS';
const CREATE_FAIL = 'action/meeting/CREATE_FAIL';
const LOAD = 'action/meeting/LOAD';
const LOAD_SUCCESS = 'action/meeting/LOAD_SUCCESS';
const LOAD_FAIL = 'action/meeting/LOAD_FAIL';
const UPDATE_CONTENT_OPTIMISTIC = 'action/meeting/UPDATE_CONTENT_OPTIMISTIC';
const UPDATE_CONTENT = 'action/meeting/UPDATE_CONTENT';
const UPDATE_CONTENT_SUCCESS = 'action/meeting/UPDATE_CONTENT_SUCCESS';
const UPDATE_CONTENT_FAIL = 'action/meeting/UPDATE_CONTENT_FAIL';
const UPDATE_EDITING = 'action/meeting/UPDATE_EDITING';
const UPDATE_EDITING_SUCCESS = 'action/meeting/UPDATE_EDITING_SUCCESS';
const UPDATE_EDITING_FAIL = 'action/meeting/UPDATE_EDITING_FAIL';
const SUBSCRIBE = 'action/meeting/SUBSCRIBE';
const SUBSCRIBE_SUCCESS = 'action/meeting/SUBSCRIBE_SUCCESS';
const SUBSCRIBE_FAIL = 'action/meeting/SUBSCRIBE_SUCCESS';
const UNSUBSCRIBE = 'action/meeting/UNSUBSCRIBE';
const UNSUBSCRIBE_SUCCESS = 'action/meeting/UNSUBSCRIBE_SUCCESS';
const UNSUBSCRIBE_FAIL = 'action/meeting/UNSUBSCRIBE_SUCCESS';
const S_MEETING_INSERT = 'action/meeting/S_MEETING_INSERT';
const S_MEETING_UPDATE = 'action/meeting/S_MEETING_UPDATE';
const S_MEETING_DELETE = 'action/meeting/S_MEETING_DELETE';

const THROTTLED_NETWORK_RATE = 500; // ms

const initialState = {
  loaded: false,
  instance: null,
  mySocketId: '',
  otherEditing: false
};

export default function reducer(state = initialState, action = {}) {
  switch (action.type) {
    case CREATE:
      return {
        ...state,
        loaded: false,
        instance: null
      };
    case CREATE_SUCCESS:
      return {
        ...state,
        loaded: false,
        loading: false,
        instance: {
          id: action.result
        },
        error: null
      };
    case CREATE_FAIL:
      return {
        ...state,
        loading: false,
        loaded: false,
        instance: null,
        error: action.error
      };
    case LOAD:
      return {
        ...state,
        loaded: false,
        loading: true,
        instance: null
      };
    case LOAD_SUCCESS:
      return {
        ...state,
        loaded: true,
        loading: false,
        instance: action.result,
        error: null
      };
    case LOAD_FAIL:
      return {
        ...state,
        loaded: false,
        loading: false,
        instance: null,
        error: action.error
      };
    case UPDATE_CONTENT_OPTIMISTIC:
      return {
        ...state,
        instance: {
          ...state.instance,
          content: action.payload.content
        }
      };
    case S_MEETING_UPDATE:
      return {
        ...state,
        instance: {
          ...state.instance,
          ...action.payload.new_val
        },
        otherEditing: (
          action.payload.new_val.editing &&
          state.mySocketId !== action.payload.new_val.authoredBy
        )
      };
    case SOCKET_CONNECTED:
      return {
        ...state,
        mySocketId: action.id
      };
    default:
      return state;
  }
}

export function isLoaded(globalState) {
  return globalState.meeting && globalState.meeting.loaded;
}

export function load(meetingId) {
  return {
    types: [LOAD, LOAD_SUCCESS, LOAD_FAIL],
    promise: (client) => client.falcor
      .get(['meetingsById', [meetingId], ['id', 'content']])
      .then( (response) => response.json.meetingsById[meetingId] )
  };
}

export function create() {
  return {
    types: [CREATE, CREATE_SUCCESS, CREATE_FAIL],
    promise: (client) => client.falcor
      .call('meetings.create',
        [ ], // no params
        ['id'], // what to fetch for any refs created
      )
      .then( (response) => response.json
        .meetings[Object.keys(response.json.meetings)[0]].id
      )
  };
}

function updateContentOptimistic(content) {
  return {
    type: UPDATE_CONTENT_OPTIMISTIC,
    payload: {
      content: content
    }
  };
}

const _throttledUpdateContent = _.throttle((dispatch, id, content, socketId) => {
  dispatch({
    types: [UPDATE_CONTENT, UPDATE_CONTENT_SUCCESS, UPDATE_CONTENT_FAIL],
    promise: (client) => {
      const payload = { json: { meetingsById: { } } };
      const { meetingsById } = payload.json;
      meetingsById[id] = {
        content: content,
        updatedBy: socketId
      };
      return client.falcor
        .set(payload)
        .then( () => {
          return {
            content: content
          };
        });
    }
  });
}, THROTTLED_NETWORK_RATE);

export function updateContent(id, content, socketId) {
  return (dispatch) => { // Hey, I'm a thunk!
    dispatch(updateContentOptimistic(content)); // sync update
    _throttledUpdateContent(dispatch, id, content, socketId); // throttled async
  };
}

export function updateEditing(id, editing, socketId) {
  return {
    types: [UPDATE_EDITING, UPDATE_EDITING_SUCCESS, UPDATE_EDITING_FAIL],
    promise: (client) => {
      const payload = { json: { meetingsById: { } } };
      const { meetingsById } = payload.json;
      meetingsById[id] = {
        editing: editing,
        updatedBy: socketId
      };
      return client.falcor
        .set(payload)
        .then( () => {
          return {
            editing: editing
          };
        });
    }
  };
}

export function subscribe(room, id) {
  return {
    types: [SUBSCRIBE, SUBSCRIBE_SUCCESS, SUBSCRIBE_FAIL],
    promise: (client) => subscriptionManager.subscribe(
      client, 'meetingsById', { id: id }, room,
      [ S_MEETING_INSERT, S_MEETING_UPDATE, S_MEETING_DELETE ]
    )
  };
}

export function unsubscribe(room, id) {
  return {
    types: [UNSUBSCRIBE, UNSUBSCRIBE_SUCCESS, UNSUBSCRIBE_FAIL],
    promise: (client) => subscriptionManager.unsubscribe(
      client, 'meetingsById', { id: id }, room,
    )
  };
}
