import makeReducer from 'universal/redux/makeReducer';
import {resolvePromiseMap} from 'universal/utils/promises';

const setImports = () =>
  new Map([
    ['component', System.import(
      'universal/modules/userDashboard/containers/Me/Me')],
    ['reduxForm', System.import('redux-form')],
  ]);

const getImports = importMap => ({
  component: importMap.get('component'),
  reduxForm: importMap.get('reduxForm'),
});

export default store => ({
  path: '/me',
  getComponent: async(location, cb) => {
    const promiseMap = setImports();
    const importMap = await resolvePromiseMap(promiseMap);
    const {component, ...asyncReducers} = getImports(importMap);
    const newReducer = makeReducer(asyncReducers);
    store.replaceReducer(newReducer);
    cb(null, component);
  },
  childRoutes: [
    {
      path: '/me/settings'
    }
  ]
});
