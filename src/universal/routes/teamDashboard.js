/* eslint-disable global-require */
import resolvePromiseMap from 'universal/utils/promises';
import makeReducer from 'universal/redux/makeReducer';

const setImports = () =>
  new Map([
    ['component', System.import('universal/modules/teamDashboard/containers/Team/TeamContainer')],
    ['socket', System.import('redux-socket-cluster')],
    ['teamDashboard', System.import('universal/modules/teamDashboard/ducks/teamDashDuck')]
  ]);

const getImports = (importMap) => ({
  component: importMap.get('component').default,
  socket: importMap.get('socket').socketClusterReducer,
  teamDashboard: importMap.get('teamDashboard').default
});

export default (store) => ({
  path: 'team/:teamId',
  getComponent: async (location, cb) => {
    const promiseMap = setImports();
    const importMap = await resolvePromiseMap(promiseMap);
    const {component, ...asyncReducers} = getImports(importMap);
    const newReducer = makeReducer(asyncReducers);
    store.replaceReducer(newReducer);
    cb(null, component);
  },
  getIndexRoute: async (location, cb) => {
    const component = await System.import('universal/modules/teamDashboard/containers/AgendaAndProjects/AgendaAndProjectsContainer');
    cb(null, {component: component.default});
  },
  getChildRoutes: (childLocation, cbChild) => {
    cbChild(null, [
      /* eslint-disable global-require */
      require('./teamArchive').default(store),
      require('./teamSettings').default(store)
      /* eslint-enable */
    ]);
  }
});
