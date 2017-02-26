export default {
  path: '/signout',
  getComponent: async(location, cb) => {
    const component = await System.import('universal/containers/Signout/SignoutContainer');
    cb(null, component.default);
  }
};
