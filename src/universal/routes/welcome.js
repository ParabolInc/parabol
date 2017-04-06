import makeReducer from 'universal/redux/makeReducer';
import resolvePromiseMap from 'universal/utils/promises';

const setImports = () =>
  new Map([
    ['component', System.import(
      'universal/modules/welcome/containers/Welcome/Welcome')],
    ['welcome', System.import('universal/modules/welcome/ducks/welcomeDuck')]
  ]);

const getImports = (importMap) => ({
  component: importMap.get('component').default,
  welcome: importMap.get('welcome').default
});

export default (store) => ({
  path: '/welcome',
  getComponent: async (location, cb) => {
    const promiseMap = setImports();
    const importMap = await resolvePromiseMap(promiseMap);
    const {component, ...asyncReducers} = getImports(importMap);
    const newReducer = makeReducer(asyncReducers);
    store.replaceReducer(newReducer);
    cb(null, component);
  }
});
