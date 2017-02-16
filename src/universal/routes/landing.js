export default {
  path: '(/:login)',
  getComponent: async(location, cb) => {
    const component = await System.import('universal/modules/landing/containers/Landing/LandingContainer');
    cb(null, component);
  }
};
