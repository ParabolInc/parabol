import {resolvePromiseMap} from 'universal/utils/promises';
import makeReducer from 'universal/redux/makeReducer';

const setMeetingLobbyImports = () =>
  new Map([
    ['component', System.import(
      'universal/modules/meeting/containers/MeetingLobby/MeetingLobby')],
    ['socket', System.import('redux-socket-cluster')]
  ]);

const getMeetingLobbyImports = importMap => ({
  component: importMap.get('component'),
  socket: importMap.get('socket').socketClusterReducer
});

const setMeetingImports = () =>
  new Map([
    ['component', System.import(
      'universal/modules/meeting/containers/MeetingContainer/MeetingContainer')],
    ['socket', System.import('redux-socket-cluster')]
  ]);

const getMeetingImports = importMap => ({
  component: importMap.get('component'),
  socket: importMap.get('socket').socketClusterReducer
});

export default store => ([
  {
    path: 'meetingLobby/:teamId', // TODO: remove me, this is for testing
    getComponent: async(location, cb) => {
      const promiseMap = setMeetingLobbyImports();
      const importMap = await resolvePromiseMap(promiseMap);
      const {component, ...asyncReducers} = getMeetingLobbyImports(importMap);
      const newReducer = makeReducer(asyncReducers);
      store.replaceReducer(newReducer);

      cb(null, component);
    }
  },
  {
    path: 'meeting/:teamId',
    getComponent: async(location, cb) => {
      const promiseMap = setMeetingImports();
      const importMap = await resolvePromiseMap(promiseMap);
      const {component, ...asyncReducers} = getMeetingImports(importMap);
      const newReducer = makeReducer(asyncReducers);
      store.replaceReducer(newReducer);

      cb(null, component);
    }
  },
]);
