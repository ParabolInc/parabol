/* eslint-disable global-require */
import {resolvePromiseMap} from 'universal/utils/promises';

const setImports = () =>
  new Map([
    ['component', System.import('universal/containers/Dashboard/DashboardContainer')],
    ['socket', System.import('redux-socket-cluster')],
  ]);

const getImports = importMap => ({
  component: importMap.get('component'),
  socket: importMap.get('socket').socketClusterReducer,
});

export default store => ({
  path: 'newteam',
  getComponent: async(location, cb) => {
    const promiseMap = setImports();
    const importMap = await resolvePromiseMap(promiseMap);
    const {component} = getImports(importMap);
    cb(null, component);
  },
  getIndexRoute: async(location, cb) => {
    const component =
      await System.import('universal/modules/newTeam/components/NewTeam/NewTeam');
    cb(null, {component});
  }
});
