import * as _ from 'lodash';

const CONNECTED = 'action/socket/CONNECTED';
const DISCONNECTED = 'action/socket/DISCONNECTED';
const ROOM_JOIN = 'action/socket/ROOM_JOIN';
const ROOM_JOIN_SUCCESS = 'action/socket/ROOM_JOIN_SUCCESS';
const ROOM_JOIN_FAIL = 'action/socket/ROOM_JOIN_FAIL';
const ROOM_LEAVE = 'action/socket/ROOM_LEAVE';
const ROOM_LEAVE_SUCCESS = 'action/socket/ROOM_LEAVE_SUCCESS';
const ROOM_LEAVE_FAIL = 'action/socket/ROOM_LEAVE_FAIL';

const initialState = {
  connected: false,
  rooms: [],
  id: ''
};

export default function reducer(state = initialState, action = {}) {
  switch (action.type) {
    case CONNECTED:
      return {
        ...state,
        connected: true,
        id: action.id
      };
    case DISCONNECTED:
      return {
        ...state,
        connected: false,
        id: null
      };
    case ROOM_JOIN_SUCCESS:
      return {
        ...state,
        rooms: [
          ...state.rooms,
          action.result
        ]
      };
    case ROOM_LEAVE_SUCCESS:
      return {
        ...state,
        rooms: _.without(state.rooms, action.result)
      };
    default:
      return state;
  }
}

export function isConnected(globalState) {
  return globalState.socket && globalState.socket.connected;
}

export function connected(socketId) {
  return {
    type: CONNECTED,
    id: socketId
  };
}

export function disconnected() {
  return {
    type: DISCONNECTED
  };
}

export function roomJoin(name) {
  return {
    types: [ROOM_JOIN, ROOM_JOIN_SUCCESS, ROOM_JOIN_FAIL],
    promise: (client) => client.sm
      .emitAsync('join', name)
      .then( () => name )
  };
}

export function roomLeave(name) {
  return {
    types: [ROOM_LEAVE, ROOM_LEAVE_SUCCESS, ROOM_LEAVE_FAIL],
    promise: (client) => client.sm
      .emitAsync('leave', name)
      .then( () => name )
  };
}
