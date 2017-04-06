/* eslint-disable global-require */
import resolvePromiseMap from 'universal/utils/promises';
import makeReducer from 'universal/redux/makeReducer';

const setImports = () =>
  new Map([
    ['component', System.import('universal/modules/userDashboard/components/UserDashboard/UserDashboard')],
    ['socket', System.import('redux-socket-cluster')],
    ['userDashboard', System.import('universal/modules/userDashboard/ducks/userDashDuck')]
  ]);

const getImports = (importMap) => ({
  component: importMap.get('component').default,
  socket: importMap.get('socket').socketClusterReducer,
  userDashboard: importMap.get('userDashboard').default
});

export default (store) => ({
  path: 'me',
  getComponent: async (location, cb) => {
    const promiseMap = setImports();
    const importMap = await resolvePromiseMap(promiseMap);
    const {component, ...asyncReducers} = getImports(importMap);
    const newReducer = makeReducer(asyncReducers);
    store.replaceReducer(newReducer);
    cb(null, component);
  },
  getIndexRoute: async (location, cb) => {
    const component = await System.import('universal/modules/userDashboard/components/UserDashMain/UserDashMain');
    cb(null, {component: component.default});
  },
  getChildRoutes: (childLocation, cbChild) => {
    cbChild(null, [
      require('./userSettings').default(store),
      require('./organizations').default(store),
      require('./notifications').default(store),
    ]);
  }
});
