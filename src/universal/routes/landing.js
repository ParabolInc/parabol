export default {
  path: '/',
  getComponent: async (location, cb) => {
    const component = await System.import('universal/modules/landing/containers/Landing/LandingContainer');
    cb(null, component.default);
  }
};
