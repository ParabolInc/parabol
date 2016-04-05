export default {
  path: 'signin/:action',
  getComponent: async(location, cb) => {
    const component = await System.import('universal/modules/meeting/containers/SigninSuccess/SigninSuccess');
    cb(null, component);
  }
};
