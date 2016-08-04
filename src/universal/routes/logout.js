import {makeWhitelistedReducer} from 'universal/redux/makeReducer';

const reducerWhitelist = [
  'notifications'
];

export default (store) => ({
  path: '/logout',
  getComponent: async(location, cb) => {
    const component = await System.import('universal/containers/Logout/LogoutContainer');
    const newReducer = makeWhitelistedReducer(reducerWhitelist);
    store.replaceReducer(newReducer);

    cb(null, component);
  }
});
