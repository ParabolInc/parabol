import resolvePromiseMap from 'universal/utils/promises';

const setImports = () =>
  new Map([
    ['component', System.import(
      'universal/modules/userDashboard/containers/Organizations/OrganizationsContainer')],
  ]);

const getImports = (importMap) => ({
  component: importMap.get('component').default
});

export default (store) => ({
  path: 'organizations',
  getIndexRoute: async (location, cb) => {
    const promiseMap = setImports();
    const importMap = await resolvePromiseMap(promiseMap);
    const {component} = getImports(importMap);
    cb(null, {component});
  },
  getChildRoutes: (childLocation, cbChild) => {
    cbChild(null, [
      require('./organization').default(store)
    ]);
  }
});
