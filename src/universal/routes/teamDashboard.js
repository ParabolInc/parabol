/* eslint-disable global-require */
import {resolvePromiseMap} from 'universal/utils/promises';
import makeReducer from 'universal/redux/makeReducer';

const setImports = () =>
  new Map([
    ['component', System.import('universal/containers/Dashboard/DashboardContainer')],
    ['socket', System.import('redux-socket-cluster')],
    ['teamDashboard', System.import('universal/modules/teamDashboard/ducks/teamDashDuck')]
  ]);

const getImports = importMap => ({
  component: importMap.get('component'),
  socket: importMap.get('socket').socketClusterReducer,
  teamDashboard: importMap.get('teamDashboard').default
});

export default store => ({
  path: 'team',
  getComponent: async(location, cb) => {
    const promiseMap = setImports();
    const importMap = await resolvePromiseMap(promiseMap);
    const {component, ...asyncReducers} = getImports(importMap);
    const newReducer = makeReducer(asyncReducers);
    store.replaceReducer(newReducer);
    cb(null, component);
  },
  getChildRoutes: (childLocation, cbChild) => {
    cbChild(null, [
      require('./teamDashMain')(store)
    ]);
  }
});
