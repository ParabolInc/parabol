import makeReducer from 'universal/redux/makeReducer';
import resolvePromiseMap from 'universal/utils/promises';

const setImports = () =>
  new Map([
    ['component', System.import(
      'universal/modules/teamDashboard/containers/TeamSettings/TeamSettingsContainer')]
  ]);

const getImports = (importMap) => ({
  component: importMap.get('component').default
});

export default (store) => ({
  path: 'settings',
  getComponent: async (location, cb) => {
    const promiseMap = setImports();
    const importMap = await resolvePromiseMap(promiseMap);
    const {component, ...asyncReducers} = getImports(importMap);
    const newReducer = makeReducer(asyncReducers);
    store.replaceReducer(newReducer);
    cb(null, component);
  }
  // getChildRoutes: (childLocation, cbChild) => {
  //   cbChild(null, [
  //     /* eslint-disable global-require */
  //     require('./integrations').default(store),
  //     /* eslint-enable */
  //   ]);
  // }
});
