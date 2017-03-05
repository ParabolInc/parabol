import {resolvePromiseMap} from 'universal/utils/promises';
import makeReducer from 'universal/redux/makeReducer';

const setMeetingImports = () =>
  new Map([
    ['component', System.import(
      'universal/modules/meeting/containers/MeetingContainer/MeetingContainer')],
    ['socket', System.import('redux-socket-cluster')],
  ]);

const getMeetingImports = importMap => ({
  component: importMap.get('component').default,
  socket: importMap.get('socket').socketClusterReducer,
});

export default store => ({
  path: 'meeting/:teamId(/:localPhase)(/:localPhaseItem)',
  getComponent: async(location, cb) => {
    const promiseMap = setMeetingImports();
    const importMap = await resolvePromiseMap(promiseMap);
    const {component, ...asyncReducers} = getMeetingImports(importMap);
    const newReducer = makeReducer(asyncReducers);
    store.replaceReducer(newReducer);

    cb(null, component);
  }
});
