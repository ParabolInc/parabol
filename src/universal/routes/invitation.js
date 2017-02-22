import makeReducer from 'universal/redux/makeReducer';
import {resolvePromiseMap} from 'universal/utils/promises';

const setImports = () =>
  new Map([
    ['component', System.import(
      'universal/modules/invitation/containers/Invitation/Invitation')],
    ['userDashboardSettings', System.import(
      'universal/modules/userDashboard/ducks/settingsDuck')]
  ]);

const getImports = importMap => ({
  component: importMap.get('component').default,
  userDashboardSettings: importMap.get('userDashboardSettings').default
});

export default (store) => ({
  path: '/invitation/:id',
  getComponent: async(location, cb) => {
    const promiseMap = setImports();
    const importMap = await resolvePromiseMap(promiseMap);
    const {component, ...asyncReducers} = getImports(importMap);
    const newReducer = makeReducer(asyncReducers);
    store.replaceReducer(newReducer);
    cb(null, component);
  }
});
