export default {
  path: '/logout',
  getComponent: async(location, cb) => {
    const component = await System.import('universal/containers/Logout/LogoutContainer');
    cb(null, component);
  }
};
