import {resolvePromiseMap} from 'universal/utils/promises';

const setImports = () =>
  new Map([
    ['component', System.import(
      'universal/modules/userDashboard/containers/Organization/OrganizationContainer')],
  ]);

const getImports = importMap => ({
  component: importMap.get('component')
});

export default (store) => ({
  path: ':orgId',
  getComponent: async(location, cb) => {
    const promiseMap = setImports();
    const importMap = await resolvePromiseMap(promiseMap);
    const {component} = getImports(importMap);
    cb(null, component);
  }
});
