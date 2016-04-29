import {resolvePromiseMap} from 'universal/utils/promises';
import makeReducer from 'universal/redux/makeReducer';

const setMeetingImports = () =>
  new Map([
    ['component', System.import(
      'universal/modules/meeting/containers/MeetingLayout/MeetingLayout')],
    ['socket', System.import('redux-socket-cluster')]
  ]);

const getKanbanImports = importMap => ({
  component: importMap.get('component'),
  socket: importMap.get('socket').socketClusterReducer
});

export default store => ({
  path: 'meeting/:id',
  getComponent: async(location, cb) => {
    const promiseMap = setMeetingImports();
    const importMap = await resolvePromiseMap(promiseMap);
    const {component, ...asyncReducers} = getKanbanImports(importMap);
    const newReducer = makeReducer(asyncReducers);
    store.replaceReducer(newReducer);

    cb(null, component);
  }
});
