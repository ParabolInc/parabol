import {resolvePromiseMap} from 'universal/utils/promises';

const setImports = () =>
  new Map([
    ['component', System.import(
      'universal/modules/userDashboard/containers/Notifications/NotificationsContainer')],
  ]);

const getImports = importMap => ({
  component: importMap.get('component')
});

export default (store) => ({
  path: 'notifications',
  getIndexRoute: async(location, cb) => {
    const promiseMap = setImports();
    const importMap = await resolvePromiseMap(promiseMap);
    const {component} = getImports(importMap);
    cb(null, {component});
  }
});
