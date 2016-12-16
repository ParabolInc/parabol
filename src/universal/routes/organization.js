import makeReducer from 'universal/redux/makeReducer';
import {resolvePromiseMap} from 'universal/utils/promises';

const setImports = () =>
  new Map([
    ['component', System.import(
      'universal/modules/userDashboard/containers/Organization/OrganizationContainer')],
    ['orgSettings', System.import('universal/modules/userDashboard/ducks/orgSettingsDuck')]
  ]);

const getImports = importMap => ({
  component: importMap.get('component'),
  orgSettings: importMap.get('orgSettings').default
});

export default (store) => ({
  path: ':orgId',
  getComponent: async(location, cb) => {
    const promiseMap = setImports();
    const importMap = await resolvePromiseMap(promiseMap);
    const {component, ...asyncReducers} = getImports(importMap);
    const newReducer = makeReducer(asyncReducers);
    store.replaceReducer(newReducer);
    cb(null, component);
  }
});
