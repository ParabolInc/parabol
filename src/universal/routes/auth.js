export default {
  path: 'auth/loginAs',
  getComponent: async (location, cb) => {
    const component = await System.import('universal/modules/admin/containers/Auth/AuthLoginAs');
    cb(null, component);
  }
};
